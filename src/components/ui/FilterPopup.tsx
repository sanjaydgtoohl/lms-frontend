import React, { useCallback, useEffect, useId, useState, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import SelectDropdown from './SelectDropdown';
import MultiSelectDropdown from './MultiSelectDropdown';
import {
  fetchStates,
  fetchCities,
  fetchZones,
  fetchSubZones,
  fetchPincodes,
  fetchArterialRoutes,
  fetchModeOfMedia,
  fetchPublishers,
  fetchMainCategories,
  fetchCategories,
  fetchSubCategories,
  fetchLocationTypes,
  fetchOrientations,
  fetchResolutions,
  fetchScreenLocations,
  fetchStretches,
  fetchProperties,
  type LocationOption,
  fetchCountries,
} from '../../services/LocationCategoryDevice';

/** Comma-separated tokens (legacy labels or IDs during hydration). */
function splitCsvTokens(value: string): string[] {
  // Filter state is stored as CSV so it can flow through the existing form and API contracts.
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function joinCsvTokens(tokens: string[]): string {
  return tokens.filter(Boolean).join(',');
}

function migrateTokensToIdsCsv(
  rawValue: string,
  opts: LocationOption[],
  labelFn: (opt: LocationOption) => string
): string {
  const tokens = splitCsvTokens(rawValue);
  if (!tokens.length) return '';
  const ids = tokens.map((token) => {
    const byId = opts.find((o) => String(o.id) === token);
    if (byId) return String(byId.id);
    const byLabel = opts.find((o) => labelFn(o) === token);
    return byLabel ? String(byLabel.id) : token;
  });
  return joinCsvTokens(ids);
}

function idsCsvToLabelsCsv(
  rawValue: string,
  opts: LocationOption[],
  labelFn: (opt: LocationOption) => string
): string {
  const ids = splitCsvTokens(rawValue);
  if (!ids.length) return '';
  const labels = ids.map((idStr) => {
    const opt = opts.find((o) => String(o.id) === idStr);
    return opt ? labelFn(opt) : idStr;
  });
  return joinCsvTokens(labels);
}

export type LocationFilterValues = {
  country: string;
  state: string;
  city: string;
  zoneArea: string;
  subZoneArea: string;
  pincode: string;
  arterialRoute: string;
  modeOfMedia: string;
  publisher: string;
  mainCategory: string;
  category: string;
  categorySub: string;
  locationType: string;
  orientation: string;
  resolution: string;
  screenLocation: string;
  stretch: string;
  property: string;
};

/** Fields edited via MultiSelectDropdown — draft holds comma-separated option IDs; labels are sent on Apply. */
const MULTI_SELECT_FIELDS: (keyof LocationFilterValues)[] = [
  'state',
  'city',
  'zoneArea',
  'subZoneArea',
  'pincode',
  'arterialRoute',
  'modeOfMedia',
  'publisher',
  'mainCategory',
  'category',
  'categorySub',
  'locationType',
  'orientation',
  'resolution',
  'screenLocation',
  'stretch',
  'property',
];

export type FilterSection = {
  title: string;
  fields: Array<{
    name: keyof LocationFilterValues;
    label: string;
  }>;
};

export type FilterOptions = Record<string, LocationOption[]>;
const EMPTY_FILTER_OPTIONS: FilterOptions = {};

type FilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  appliedValues: LocationFilterValues;
  onApply: (values: LocationFilterValues) => void;
  onReset: () => void;
  /** Filter sections with field definitions */
  filterSections?: FilterSection[];
  /** Options for each select field */
  options?: FilterOptions;
};

const FilterPopup: React.FC<FilterPopupProps> = ({
  isOpen,
  onClose,
  appliedValues,
  onApply,
  onReset,
  filterSections,
  options = EMPTY_FILTER_OPTIONS,
}) => {
  const titleId = useId();
  const [draft, setDraft] = useState<LocationFilterValues>(appliedValues);
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set());
  const [allOptions, setAllOptions] = useState<FilterOptions>(options);
  const allOptionsRef = useRef<FilterOptions>(options);
  const initialOptionsLoadedRef = useRef(false);
  const categoryOptionsRef = useRef<LocationOption[]>([]);
  const categorySubOptionsRef = useRef<LocationOption[]>([]);
  const modeOptionsRef = useRef<LocationOption[]>([]);
  const publisherOptionsRef = useRef<LocationOption[]>([]);
  const mainCategoryOptionsRef = useRef<LocationOption[]>([]);
  const deviceOptionsRef = useRef<Record<string, LocationOption[]>>({});
  const hydratedCountryKeyRef = useRef<string | null>(null);
  const hydratedStateKeyRef = useRef<string | null>(null);
  const stateCascadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  allOptionsRef.current = allOptions;
  const getNormalizedOptionLabel = useCallback((opt: LocationOption): string => {
    return String(opt.name || opt.label || opt.id || '').trim();
  }, []);

  const mergeUniqueOptions = useCallback((groups: LocationOption[][]): LocationOption[] => {
    const map = new Map<string, LocationOption>();
    groups.forEach((group) => group.forEach((option) => {
      const key = `${String(option.id)}::${getNormalizedOptionLabel(option).toLowerCase()}`;
      if (!map.has(key)) map.set(key, option);
    }));
    return Array.from(map.values());
  }, [getNormalizedOptionLabel]);

  const setFieldLoading = useCallback((fieldName: string, isLoading: boolean) => {
    setLoadingFields((previous) => {
      const next = new Set(previous);
      if (isLoading) next.add(fieldName);
      else next.delete(fieldName);
      return next;
    });
  }, []);

  const updateFieldOptions = useCallback((fieldName: string, newOptions: LocationOption[]) => {
    setAllOptions((previous) => ({ ...previous, [fieldName]: newOptions }));
  }, []);

  const getSelectedOptionIds = useCallback(
    (fieldName: string, selectedValue: string): Array<string | number> => splitCsvTokens(selectedValue)
      .map((token) => {
        const option = (allOptions[fieldName] || []).find(
          (item) => String(item.id) === token || getNormalizedOptionLabel(item) === token
        );
        return option?.id;
      })
      .filter((id): id is string | number => id !== undefined && id !== null),
    [allOptions, getNormalizedOptionLabel]
  );
  const getSelectedOptionValues = useCallback(
    (fieldName: string, selectedValue: string): Array<string | number> => splitCsvTokens(selectedValue)
      .map((token) => {
        const option = (allOptions[fieldName] || []).find(
          (item) => String(item.id) === token || getNormalizedOptionLabel(item) === token
        );
        return option?.value ?? option?.id;
      })
      .filter((value): value is string | number => value !== undefined && value !== null),
    [allOptions, getNormalizedOptionLabel]
  );

  const refreshDeviceOptionsForCategories = useCallback(async (values: LocationFilterValues) => {
    // Rebuild device options from the current category/location selection so dependent filters stay valid.
    const state = getSelectedOptionValues('state', values.state);
    const city = getSelectedOptionValues('city', values.city);
    const zone = getSelectedOptionValues('zoneArea', values.zoneArea);
    const subZone = getSelectedOptionValues('subZoneArea', values.subZoneArea);
    const pincode = getSelectedOptionValues('pincode', values.pincode);
    const arterialRoute = getSelectedOptionValues('arterialRoute', values.arterialRoute);
    const filters = {
      state,
      city,
      zone,
      subZone,
      pincode,
      arterialRoute,
      publisher: getSelectedOptionValues('publisher', values.publisher),
      mainCategory: getSelectedOptionValues('mainCategory', values.mainCategory),
      category: getSelectedOptionValues('category', values.category),
      subCategory: getSelectedOptionValues('categorySub', values.categorySub),
    };
    const [locationType, orientation, resolution, screenLocation, stretch, property] = await Promise.all([
      fetchLocationTypes(filters.publisher, filters),
      fetchOrientations(undefined, filters),
      fetchResolutions(undefined, filters),
      fetchScreenLocations(undefined, filters),
      fetchStretches(undefined, filters),
      fetchProperties(undefined, filters),
    ]);
    updateFieldOptions('locationType', locationType);
    updateFieldOptions('orientation', orientation);
    updateFieldOptions('resolution', resolution);
    updateFieldOptions('screenLocation', screenLocation);
    updateFieldOptions('stretch', stretch);
    updateFieldOptions('property', property);
  }, [getSelectedOptionValues, updateFieldOptions]);

  const refreshPublisherOptionsForCategories = useCallback(async (values: LocationFilterValues) => {
    // Publisher choices depend on both location and category selections.
    const filters = {
      state: getSelectedOptionValues('state', values.state),
      city: getSelectedOptionValues('city', values.city),
      zone: getSelectedOptionValues('zoneArea', values.zoneArea),
      subZone: getSelectedOptionValues('subZoneArea', values.subZoneArea),
      pincode: getSelectedOptionValues('pincode', values.pincode),
      arterialRoute: getSelectedOptionValues('arterialRoute', values.arterialRoute),
      mainCategory: getSelectedOptionValues('mainCategory', values.mainCategory),
      category: getSelectedOptionValues('category', values.category),
      subCategory: getSelectedOptionValues('categorySub', values.categorySub),
    };
    const modeOfMedia = getSelectedOptionValues('modeOfMedia', values.modeOfMedia);
    const publisherOptions = await fetchPublishers(modeOfMedia, filters);
    updateFieldOptions('publisher', publisherOptions);
    return publisherOptions;
  }, [getSelectedOptionValues, updateFieldOptions]);

  const refreshOptionsForLocation = useCallback(async (
    state: Array<string | number>,
    city: Array<string | number>,
    zone: Array<string | number>,
    subZone: Array<string | number>,
    pincode: Array<string | number>,
    arterialRoute: Array<string | number>
  ) => {
    // Load all filter families affected by a location change in parallel to keep the cascade responsive.
    const categoryFilters = { state, city, zone, subZone, pincode, arterialRoute };
    const deviceFilters = { state, city, zone, subZone, pincode, arterialRoute };
    const [modeOfMedia, publishers, mainCategories, categories, subCategories, locationTypes, orientations, resolutions, screenLocations, stretches, properties] = await Promise.all([
      fetchModeOfMedia(categoryFilters),
      fetchPublishers(undefined, categoryFilters),
      fetchMainCategories(undefined, categoryFilters),
      fetchCategories(undefined, undefined, categoryFilters),
      fetchSubCategories(undefined, undefined, undefined, categoryFilters),
      fetchLocationTypes(undefined, deviceFilters),
      fetchOrientations(undefined, deviceFilters),
      fetchResolutions(undefined, deviceFilters),
      fetchScreenLocations(undefined, deviceFilters),
      fetchStretches(undefined, deviceFilters),
      fetchProperties(undefined, deviceFilters),
    ]);

    updateFieldOptions('modeOfMedia', modeOfMedia);
    updateFieldOptions('publisher', publishers);
    updateFieldOptions('mainCategory', mainCategories);
    updateFieldOptions('category', categories);
    updateFieldOptions('categorySub', subCategories);
    updateFieldOptions('locationType', locationTypes);
    updateFieldOptions('orientation', orientations);
    updateFieldOptions('resolution', resolutions);
    updateFieldOptions('screenLocation', screenLocations);
    updateFieldOptions('stretch', stretches);
    updateFieldOptions('property', properties);
    categoryOptionsRef.current = categories;
    categorySubOptionsRef.current = subCategories;
    modeOptionsRef.current = modeOfMedia;
    publisherOptionsRef.current = publishers;
    mainCategoryOptionsRef.current = mainCategories;
    deviceOptionsRef.current = {
      locationType: locationTypes,
      orientation: orientations,
      resolution: resolutions,
      screenLocation: screenLocations,
      stretch: stretches,
      property: properties,
    };
  }, [updateFieldOptions]);

  const filterCategoryOptions = useCallback(
    (source: LocationOption[], parentField: 'mainCategory' | 'category', selectedValue: string) => {
      const selectedIds = splitCsvTokens(selectedValue);
      if (!selectedIds.length) return source;

      const parentKeys = parentField === 'mainCategory'
        ? ['main_category_id', 'mainCategoryId', 'main_category', 'mainCategory', 'parent_id', 'parentId']
        : ['category_id', 'categoryId', 'category', 'parent_id', 'parentId'];
      const getParentIds = (option: LocationOption): string[] => {
        const rawOption = option as LocationOption & Record<string, unknown>;
        for (const key of parentKeys) {
          const rawValue = rawOption[key];
          if (Array.isArray(rawValue)) return rawValue.map(String);
          if (rawValue !== undefined && rawValue !== null && rawValue !== '') return [String(rawValue)];
        }
        return [];
      };
      const optionsWithParent = source.filter((option) => getParentIds(option).length > 0);
      if (!optionsWithParent.length) return source;
      return source.filter((option) => getParentIds(option).some((id) => selectedIds.includes(id)));
    },
    []
  );

  // Initialize with options from parent or fetch if not provided and rehydrate dependent cascades.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadInitial = async () => {
      let countries: LocationOption[];
      let modeOfMedia: LocationOption[];
      let publishers: LocationOption[];
      let mainCategories: LocationOption[];
      let categories: LocationOption[];
      let subCategories: LocationOption[];
      let states: LocationOption[];
      let cities: LocationOption[];
      let zones: LocationOption[];
      let subZones: LocationOption[];
      let pincodes: LocationOption[];
      let arterialRoutes: LocationOption[];
      let locationTypes: LocationOption[];
      let orientations: LocationOption[];
      let resolutions: LocationOption[];
      let screenLocations: LocationOption[];
      let stretches: LocationOption[];
      let properties: LocationOption[];
      try {
        if (!initialOptionsLoadedRef.current) {
          const initialState = splitCsvTokens(appliedValues.state);
          const initialCity = splitCsvTokens(appliedValues.city);
          const initialZone = splitCsvTokens(appliedValues.zoneArea);
          const initialSubZone = splitCsvTokens(appliedValues.subZoneArea);
          const initialPincode = splitCsvTokens(appliedValues.pincode);
          const initialArterialRoute = splitCsvTokens(appliedValues.arterialRoute);
          const initialCategoryFilters = {
            state: initialState,
            city: initialCity,
            zone: initialZone,
            subZone: initialSubZone,
            pincode: initialPincode,
            arterialRoute: initialArterialRoute,
          };
          const initialDeviceFilters = {
            state: initialState,
            city: initialCity,
            zone: initialZone,
            subZone: initialSubZone,
            pincode: initialPincode,
            arterialRoute: initialArterialRoute,
          };
          [
            countries,
            modeOfMedia,
            publishers,
            mainCategories,
            categories,
            subCategories,
            zones,
            subZones,
            pincodes,
            arterialRoutes,
            locationTypes,
            orientations,
            resolutions,
            screenLocations,
            stretches,
            properties,
          ] = await Promise.all([
            fetchCountries(),
            fetchModeOfMedia(initialCategoryFilters),
            fetchPublishers(undefined, initialCategoryFilters),
            fetchMainCategories(undefined, initialCategoryFilters),
            fetchCategories(undefined, undefined, initialCategoryFilters),
            fetchSubCategories(undefined, undefined, undefined, initialCategoryFilters),
            fetchZones(),
            fetchSubZones(),
            fetchPincodes({
              state: initialState,
              city: initialCity,
              zone: initialZone,
              subZone: initialSubZone,
              country: splitCsvTokens(appliedValues.country),
            }),
            fetchArterialRoutes(undefined, {
              state: initialState,
              city: initialCity,
              zone: initialZone,
              subZone: initialSubZone,
            }),
            fetchLocationTypes(undefined, initialDeviceFilters),
            fetchOrientations(undefined, initialDeviceFilters),
            fetchResolutions(undefined, initialDeviceFilters),
            fetchScreenLocations(undefined, initialDeviceFilters),
            fetchStretches(undefined, initialDeviceFilters),
            fetchProperties(undefined, initialDeviceFilters),
          ]);
          initialOptionsLoadedRef.current = true;
        } else {
          const currentOptions = allOptionsRef.current;
          countries = currentOptions.country || [];
          modeOfMedia = currentOptions.modeOfMedia || [];
          publishers = currentOptions.publisher || [];
          mainCategories = currentOptions.mainCategory || [];
          categories = categoryOptionsRef.current;
          subCategories = categorySubOptionsRef.current;
          zones = currentOptions.zoneArea || [];
          subZones = currentOptions.subZoneArea || [];
          pincodes = currentOptions.pincode || [];
          arterialRoutes = currentOptions.arterialRoute || [];
          locationTypes = currentOptions.locationType || [];
          orientations = currentOptions.orientation || [];
          resolutions = currentOptions.resolution || [];
          screenLocations = currentOptions.screenLocation || [];
          stretches = currentOptions.stretch || [];
          properties = currentOptions.property || [];
        }
        states = [];
        cities = [];
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load initial filter options:', error);
        }
        return;
      }

      let nextOptions: FilterOptions = {
        ...options,
        country: countries,
        modeOfMedia,
        publisher: publishers,
        mainCategory: mainCategories,
        category: categories,
        categorySub: subCategories,
        state: states,
        city: cities,
        zoneArea: zones,
        subZoneArea: subZones,
        pincode: pincodes,
        arterialRoute: arterialRoutes,
        locationType: locationTypes,
        orientation: orientations,
        resolution: resolutions,
        screenLocation: screenLocations,
        stretch: stretches,
        property: properties,
      };

      categoryOptionsRef.current = categories;
      categorySubOptionsRef.current = subCategories;
      modeOptionsRef.current = modeOfMedia;
      publisherOptionsRef.current = publishers;
      mainCategoryOptionsRef.current = mainCategories;
      deviceOptionsRef.current = {
        locationType: locationTypes,
        orientation: orientations,
        resolution: resolutions,
        screenLocation: screenLocations,
        stretch: stretches,
        property: properties,
      };
      nextOptions.category = filterCategoryOptions(categories, 'mainCategory', appliedValues.mainCategory);
      nextOptions.categorySub = appliedValues.category
        ? filterCategoryOptions(subCategories, 'category', appliedValues.category)
        : subCategories;

      const commit = () => {
        if (cancelled) return;
        setAllOptions({ ...nextOptions });
        setDraft((prev) => {
          const next = { ...prev };
          for (const field of MULTI_SELECT_FIELDS) {
            const opts = nextOptions[field as string] || [];
            next[field] = migrateTokensToIdsCsv(String(prev[field] ?? ''), opts, getNormalizedOptionLabel);
          }
          return next;
        });
      };

      commit();

      const resolveIds = (fieldName: string, rawValue: string) =>
        splitCsvTokens(rawValue)
          .map((item) => {
            const matched = (nextOptions[fieldName] || []).find((opt) => {
              const label = getNormalizedOptionLabel(opt);
              return label === item || String(opt.id) === item;
            });
            return matched?.id;
          })
          .filter((id): id is string | number => id !== undefined && id !== null);

      const resolveValues = (fieldName: string, rawValue: string) =>
        splitCsvTokens(rawValue)
          .map((item) => {
            const matched = (nextOptions[fieldName] || []).find((opt) => {
              const label = getNormalizedOptionLabel(opt);
              return label === item || String(opt.id) === item;
            });
            return matched?.value ?? matched?.id;
          })
          .filter((value): value is string | number => value !== undefined && value !== null);

      const countryKey = appliedValues.country || '';
      const countryIds = resolveIds('country', countryKey);
      if (countryKey !== hydratedCountryKeyRef.current && countryIds.length) {
        hydratedCountryKeyRef.current = countryKey;
        try {
          const statesByCountry = await Promise.all(countryIds.map((id) => fetchStates(id)));
          nextOptions = { ...nextOptions, state: mergeUniqueOptions(statesByCountry) };
          commit();
        } catch (error) {
          if (!cancelled) console.warn('Failed to load state options for filter:', error);
        }
      }

      const stateKey = appliedValues.state || '';
      const stateValues = resolveValues('state', stateKey);
      if (stateKey !== hydratedStateKeyRef.current && stateValues.length) {
        hydratedStateKeyRef.current = stateKey;
        try {
          const cities = await fetchCities(stateValues);
          nextOptions = { ...nextOptions, city: cities };
          commit();
        } catch (error) {
          if (!cancelled) console.warn('Failed to load city options for filter:', error);
        }
      }

    };

    loadInitial();
    setDraft(appliedValues);

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    appliedValues,
    options,
    getNormalizedOptionLabel,
    mergeUniqueOptions,
    filterCategoryOptions,
  ]);

  useEffect(() => {
    if (isOpen) return;
    initialOptionsLoadedRef.current = false;
    hydratedCountryKeyRef.current = null;
    hydratedStateKeyRef.current = null;
    if (stateCascadeTimerRef.current) {
      clearTimeout(stateCascadeTimerRef.current);
      stateCascadeTimerRef.current = null;
      setFieldLoading('city', false);
    }
  }, [isOpen, setFieldLoading]);

  // Handle cascading updates when a field changes
  const handleFieldChange = useCallback(
    async (fieldName: keyof LocationFilterValues, value: string) => {
      const newDraft = {
        ...draft,
        [fieldName]: value,
      };

      // Cascading logic - reset dependent fields when parent changes
      setDraft(newDraft);

      if (fieldName === 'modeOfMedia') {
        setDraft({ ...newDraft, publisher: '', mainCategory: '', category: '', categorySub: '' });
        setFieldLoading('publisher', Boolean(value));
        setFieldLoading('mainCategory', Boolean(value));
        setFieldLoading('category', Boolean(value));
        setFieldLoading('categorySub', Boolean(value));
        const modeSelection = getSelectedOptionIds('modeOfMedia', value);
        const categoryFilters = {
          state: getSelectedOptionValues('state', newDraft.state),
          city: getSelectedOptionValues('city', newDraft.city),
          zone: getSelectedOptionValues('zoneArea', newDraft.zoneArea),
          subZone: getSelectedOptionValues('subZoneArea', newDraft.subZoneArea),
          pincode: getSelectedOptionValues('pincode', newDraft.pincode),
          arterialRoute: getSelectedOptionValues('arterialRoute', newDraft.arterialRoute),
        };
        const [publisherOptions, mainCategoryOptions, categoryOptions, subCategoryOptions] = await Promise.all([
          value ? fetchPublishers(modeSelection, categoryFilters) : Promise.resolve(publisherOptionsRef.current),
          fetchMainCategories(undefined, categoryFilters),
          fetchCategories(undefined, undefined, categoryFilters),
          fetchSubCategories(undefined, undefined, undefined, categoryFilters),
        ]);
        updateFieldOptions('publisher', publisherOptions);
        updateFieldOptions('mainCategory', mainCategoryOptions);
        updateFieldOptions('category', categoryOptions);
        updateFieldOptions('categorySub', subCategoryOptions);
        updateFieldOptions('stretch', deviceOptionsRef.current.stretch || []);
        updateFieldOptions('property', deviceOptionsRef.current.property || []);
        setFieldLoading('publisher', false);
        setFieldLoading('mainCategory', false);
        setFieldLoading('category', false);
        setFieldLoading('categorySub', false);
        return;
      }

      if (fieldName === 'publisher') {
        await refreshDeviceOptionsForCategories(newDraft);
        return;
      }

      const categoryCascade = {
        mainCategory: {
          child: 'category' as const,
          selection: getSelectedOptionValues('mainCategory', value),
          defaults: categoryOptionsRef,
          load: (selection: Array<string | number>) => fetchCategories(
            selection,
            undefined,
            {
              state: getSelectedOptionValues('state', newDraft.state),
              city: getSelectedOptionValues('city', newDraft.city),
              zone: getSelectedOptionValues('zoneArea', newDraft.zoneArea),
              subZone: getSelectedOptionValues('subZoneArea', newDraft.subZoneArea),
              pincode: getSelectedOptionValues('pincode', newDraft.pincode),
              arterialRoute: getSelectedOptionValues('arterialRoute', newDraft.arterialRoute),
            }
          ),
        },
        category: {
          child: 'categorySub' as const,
          selection: getSelectedOptionValues('category', value),
          defaults: categorySubOptionsRef,
          load: (selection: Array<string | number>) => fetchSubCategories(
            selection,
            getSelectedOptionValues('mainCategory', newDraft.mainCategory),
            undefined,
            {
              state: getSelectedOptionValues('state', newDraft.state),
              city: getSelectedOptionValues('city', newDraft.city),
              zone: getSelectedOptionValues('zoneArea', newDraft.zoneArea),
              subZone: getSelectedOptionValues('subZoneArea', newDraft.subZoneArea),
              pincode: getSelectedOptionValues('pincode', newDraft.pincode),
              arterialRoute: getSelectedOptionValues('arterialRoute', newDraft.arterialRoute),
            }
          ),
        },
      }[fieldName as 'mainCategory' | 'category'];

      if (fieldName === 'categorySub') {
        setFieldLoading('publisher', true);
        await refreshPublisherOptionsForCategories(newDraft);
        setFieldLoading('publisher', false);
        await refreshDeviceOptionsForCategories(newDraft);
        return;
      }

      if (fieldName === 'property') {
        const propertySelection = getSelectedOptionIds('property', value);
        const propertyFilters = {
          state: getSelectedOptionValues('state', newDraft.state),
          city: getSelectedOptionValues('city', newDraft.city),
          zone: getSelectedOptionValues('zoneArea', newDraft.zoneArea),
          subZone: getSelectedOptionValues('subZoneArea', newDraft.subZoneArea),
          pincode: getSelectedOptionValues('pincode', newDraft.pincode),
          arterialRoute: getSelectedOptionValues('arterialRoute', newDraft.arterialRoute),
          publisher: getSelectedOptionIds('publisher', newDraft.publisher),
          property: propertySelection,
          mainCategory: getSelectedOptionValues('mainCategory', newDraft.mainCategory),
          category: getSelectedOptionValues('category', newDraft.category),
          subCategory: getSelectedOptionValues('categorySub', newDraft.categorySub),
        };
        setFieldLoading('locationType', true);
        setFieldLoading('orientation', true);
        setFieldLoading('resolution', true);
        setFieldLoading('screenLocation', true);
        setFieldLoading('stretch', true);
        const [locationTypeOptions, orientationOptions, resolutionOptions, screenLocationOptions, stretchOptions] = await Promise.all([
          fetchLocationTypes(undefined, propertyFilters),
          fetchOrientations(undefined, propertyFilters),
          fetchResolutions(undefined, propertyFilters),
          fetchScreenLocations(undefined, propertyFilters),
          fetchStretches(undefined, propertyFilters),
        ]);
        updateFieldOptions('locationType', locationTypeOptions);
        updateFieldOptions('orientation', orientationOptions);
        updateFieldOptions('resolution', resolutionOptions);
        updateFieldOptions('screenLocation', screenLocationOptions);
        updateFieldOptions('stretch', stretchOptions);
        setFieldLoading('locationType', false);
        setFieldLoading('orientation', false);
        setFieldLoading('resolution', false);
        setFieldLoading('screenLocation', false);
        setFieldLoading('stretch', false);
        return;
      }

      if (categoryCascade) {
        const categoryDescendants: Partial<Record<string, string[]>> = {
          modeOfMedia: ['publisher', 'mainCategory', 'category', 'categorySub'],
          mainCategory: ['category'],
          category: ['categorySub'],
        };
        const fieldsToClear = categoryDescendants[fieldName] || [categoryCascade.child];
        setDraft({
          ...newDraft,
          ...Object.fromEntries(fieldsToClear.map((field) => [field, ''])),
        });
        setFieldLoading(categoryCascade.child, Boolean(value));
        const childOptions = value
          ? await categoryCascade.load(categoryCascade.selection)
          : categoryCascade.defaults.current;
        updateFieldOptions(categoryCascade.child, childOptions);
        setFieldLoading(categoryCascade.child, false);
        const nextCategoryValues = {
          ...newDraft,
          ...Object.fromEntries(fieldsToClear.map((field) => [field, ''])),
        } as LocationFilterValues;
        setFieldLoading('publisher', true);
        await refreshPublisherOptionsForCategories(nextCategoryValues);
        setFieldLoading('publisher', false);
        await refreshDeviceOptionsForCategories(nextCategoryValues);
        return;
      }

      try {
        const selected = (field: keyof LocationFilterValues): Array<string | number> =>
          getSelectedOptionValues(field, newDraft[field]);
        const country = selected('country');
        const state = selected('state');
        const city = selected('city');
        const zone = selected('zoneArea');
        const subZone = selected('subZoneArea');
        const pincode = selected('pincode');
        const arterialRoute = selected('arterialRoute');
        const common = {
            // Clear descendants from the request context because their selections are reset below.
          country,
          state: ['country'].includes(fieldName) ? [] : state,
          city: ['country', 'state'].includes(fieldName) ? [] : city,
          zone: ['country', 'state', 'city'].includes(fieldName) ? [] : zone,
          subZone: ['country', 'state', 'city', 'zoneArea'].includes(fieldName) ? [] : subZone,
        };
        const descendantMap: Partial<Record<keyof LocationFilterValues, Array<keyof LocationFilterValues>>> = {
          country: ['state', 'city', 'zoneArea', 'subZoneArea', 'pincode', 'arterialRoute'],
          state: ['city', 'zoneArea', 'subZoneArea', 'pincode', 'arterialRoute'],
          city: ['zoneArea', 'subZoneArea', 'pincode', 'arterialRoute'],
          zoneArea: ['subZoneArea', 'pincode', 'arterialRoute'],
          subZoneArea: ['pincode', 'arterialRoute'],
          pincode: ['arterialRoute'],
        };
        const descendants = descendantMap[fieldName] || [];

        if (descendants.length || fieldName === 'arterialRoute') {
          setDraft((previous) => ({
            ...previous,
            ...Object.fromEntries(descendants.map((field) => [field, ''])),
          }));
          if (
            fieldName === 'state' ||
            fieldName === 'city' ||
            fieldName === 'zoneArea' ||
            fieldName === 'subZoneArea' ||
            fieldName === 'pincode' ||
            fieldName === 'arterialRoute'
          ) {
            const dependentFilterFields: Array<keyof LocationFilterValues> = [
              'modeOfMedia',
              'publisher',
              'mainCategory',
              'category',
              'categorySub',
              'locationType',
              'orientation',
              'resolution',
              'screenLocation',
              'stretch',
              'property',
            ];
            setDraft((previous) => ({
              ...previous,
              ...Object.fromEntries(dependentFilterFields.map((field) => [field, ''])),
            }));
          }
          const filter = (overrides: Partial<typeof common> = {}) => ({ ...common, ...overrides });
          // Only request descendants affected by this field, avoiding unrelated API calls.
          const requests: Partial<Record<keyof LocationFilterValues, Promise<LocationOption[]>>> = {};
          if (fieldName === 'country') requests.state = fetchStates(country[0]);
          if (descendants.includes('city')) requests.city = fetchCities(undefined, filter());
          if (descendants.includes('zoneArea')) requests.zoneArea = fetchZones(undefined, filter());
          if (descendants.includes('subZoneArea')) requests.subZoneArea = fetchSubZones(undefined, filter());
          if (descendants.includes('pincode')) requests.pincode = fetchPincodes({
            country,
            state,
            city,
            zone,
            subZone,
          });
          if (descendants.includes('arterialRoute')) requests.arterialRoute = fetchArterialRoutes(undefined, filter());
          const results = await Promise.all(
            Object.entries(requests).map(async ([field, request]) => [field, await request!] as const)
          );
          results.forEach(([field, options]) => updateFieldOptions(field, options));
          if (fieldName === 'state' || fieldName === 'city' || fieldName === 'zoneArea' || fieldName === 'subZoneArea' || fieldName === 'pincode' || fieldName === 'arterialRoute') {
            await refreshOptionsForLocation(
              state,
              fieldName === 'state' ? [] : city,
              fieldName === 'state' || fieldName === 'city' ? [] : zone,
              fieldName === 'state' || fieldName === 'city' || fieldName === 'zoneArea' ? [] : subZone,
              fieldName === 'state' || fieldName === 'city' || fieldName === 'zoneArea' || fieldName === 'subZoneArea'
                ? []
                : pincode,
              fieldName === 'arterialRoute' ? arterialRoute : []
            );
          }
          return;
        }

        const deviceCascade = {
          // Each device attribute narrows the available values of the next attribute.
          locationType: { child: 'orientation' as const, load: fetchOrientations },
          orientation: { child: 'resolution' as const, load: fetchResolutions },
          resolution: { child: 'screenLocation' as const, load: fetchScreenLocations },
          screenLocation: { child: 'stretch' as const, load: fetchStretches },
        }[fieldName as 'locationType' | 'orientation' | 'resolution' | 'screenLocation'];
        if (deviceCascade) {
          const child = deviceCascade.child;
          const deviceDescendants: Record<string, Array<keyof LocationFilterValues>> = {
            locationType: ['orientation', 'resolution', 'screenLocation', 'stretch'],
            orientation: ['resolution', 'screenLocation', 'stretch'],
            resolution: ['screenLocation', 'stretch'],
            screenLocation: ['stretch'],
            stretch: [],
          };
          const descendants = deviceDescendants[fieldName] || [];
          setDraft((previous) => ({ ...previous, ...Object.fromEntries(descendants.map((item) => [item, ''])) }));
          const selectedDevice = (field: keyof LocationFilterValues): Array<string | number> =>
            getSelectedOptionIds(field, newDraft[field]);
          const selectedDeviceApiValues = (field: keyof LocationFilterValues): Array<string | number> =>
            field === 'locationType' || field === 'resolution'
              ? getSelectedOptionValues(field, newDraft[field])
              : selectedDevice(field);
          const effectiveDeviceSelection = (field: keyof LocationFilterValues): Array<string | number> =>
            field === fieldName ? selectedDeviceApiValues(field) : descendants.includes(field) ? [] : selectedDeviceApiValues(field);
          const stretchFilters = {
            publisher: selectedDevice('publisher'),
            property: selectedDevice('property'),
            locationType: effectiveDeviceSelection('locationType'),
            orientation: effectiveDeviceSelection('orientation'),
            resolution: effectiveDeviceSelection('resolution'),
          };
          const deviceParentFilters = {
            publisher: selectedDevice('publisher'),
            property: selectedDevice('property'),
            locationType: effectiveDeviceSelection('locationType'),
            orientation: effectiveDeviceSelection('orientation'),
            resolution: effectiveDeviceSelection('resolution'),
          };
          const childSelection = selectedDeviceApiValues(fieldName);
          setFieldLoading(child, Boolean(value));
          setFieldLoading('resolution', fieldName === 'locationType' && Boolean(value));
          setFieldLoading(
            'screenLocation',
            (fieldName === 'locationType' || fieldName === 'orientation') && Boolean(value)
          );
          const [childOptions, stretchOptions, resolutionOptions, screenLocationOptions] = await Promise.all([
            value
              ? child === 'orientation'
                ? fetchOrientations(childSelection, deviceParentFilters)
                : child === 'resolution'
                  ? fetchResolutions(childSelection, deviceParentFilters)
                  : child === 'screenLocation'
                    ? fetchScreenLocations(childSelection, deviceParentFilters)
                    : child === 'stretch'
                      ? fetchStretches(childSelection, deviceParentFilters)
                        : Promise.resolve(deviceOptionsRef.current[child] || [])
              : Promise.resolve(deviceOptionsRef.current[child] || []),
            fieldName !== 'stretch' && (value || Object.values(stretchFilters).some((items) => items.length))
              ? fetchStretches(effectiveDeviceSelection('screenLocation'), stretchFilters)
              : Promise.resolve(deviceOptionsRef.current.stretch || []),
            fieldName === 'locationType' && value
              ? fetchResolutions(undefined, deviceParentFilters)
              : Promise.resolve(deviceOptionsRef.current.resolution || []),
            (fieldName === 'locationType' || fieldName === 'orientation') && value
              ? fetchScreenLocations(undefined, deviceParentFilters)
              : Promise.resolve(deviceOptionsRef.current.screenLocation || []),
          ]);
          updateFieldOptions(child, childOptions);
          updateFieldOptions('stretch', stretchOptions);
          updateFieldOptions('resolution', resolutionOptions);
          updateFieldOptions('screenLocation', screenLocationOptions);
          setFieldLoading(child, false);
          setFieldLoading('resolution', false);
          setFieldLoading('screenLocation', false);
          return;
        }
      } catch (error) {
        console.warn('Cascade fetch error handled gracefully:', error);
        // Errors are silently handled - dropdowns will show empty if API fails
      }
    },
    [
      draft,
      getSelectedOptionIds,
      getSelectedOptionValues,
      refreshOptionsForLocation,
      refreshPublisherOptionsForCategories,
      refreshDeviceOptionsForCategories,
      setFieldLoading,
      updateFieldOptions,
    ]
  );

  const handleApply = useCallback(() => {
    // Convert draft option IDs back to labels because the parent filter state uses display values.
    const outgoing: LocationFilterValues = { ...draft };
    for (const field of MULTI_SELECT_FIELDS) {
      const opts = allOptions[field as string] || [];
      outgoing[field] = idsCsvToLabelsCsv(String(draft[field] ?? ''), opts, getNormalizedOptionLabel);
    }
    onApply(outgoing);
    onClose();
  }, [allOptions, draft, getNormalizedOptionLabel, onApply, onClose]);

  const handleReset = useCallback(() => {
    const emptyValues = Object.fromEntries(
      Object.keys(draft).map((fieldName) => [fieldName, ''])
    ) as LocationFilterValues;
    setDraft(emptyValues);
    onReset();
    onClose();
  }, [draft, onReset, onClose]);

  // Close only on Escape key press (not on outside click)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (stateCascadeTimerRef.current) {
        clearTimeout(stateCascadeTimerRef.current);
        stateCascadeTimerRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const getCountrySelectOptions = (): string[] => {
    const opts = allOptions.country;
    if (!opts) return [];
    return opts.map((opt: LocationOption) => getNormalizedOptionLabel(opt));
  };

  const getMultiSelectStructuredOptions = (
    fieldName: string
  ): Array<{ value: string; label: string }> => {
    const opts = allOptions[fieldName];
    if (!opts) return [];
    return opts.map((opt: LocationOption) => ({
      value: String(opt.id),
      label: getNormalizedOptionLabel(opt),
    }));
  };

  const isFieldEnabled = (fieldName: keyof LocationFilterValues): boolean => {
    void fieldName;
    return true;
  };

  const defaultFilterSections: FilterSection[] = [
    {
      title: 'Location',
      fields: [
        { name: 'country', label: 'Country' },
        { name: 'state', label: 'State' },
        { name: 'city', label: 'City' },
        { name: 'zoneArea', label: 'Zone' },
        { name: 'subZoneArea', label: 'Sub Zone' },
        { name: 'pincode', label: 'Pincode' },
        { name: 'arterialRoute', label: 'Arterial Route' },
      ],
    },
    {
      title: 'Category',
      fields: [
        { name: 'modeOfMedia', label: 'Mode of Media (Screen Type)' },
        { name: 'mainCategory', label: 'Main Category For Property' },
        { name: 'category', label: 'Category For Property' },
        { name: 'categorySub', label: 'Sub Category For Property' },
        { name: 'property', label: 'Property Name' },
      ],
    },
    {
      title: 'Publisher',
      fields: [
        { name: 'publisher', label: 'Publisher' },
      ],
    },
    {
      title: 'Device',
      fields: [
        { name: 'locationType', label: 'Location Type' },
        { name: 'orientation', label: 'Orientation' },
        { name: 'resolution', label: 'Resolution' },
        { name: 'screenLocation', label: 'Screen Location' },
        { name: 'stretch', label: 'Stretch' },
      ],
    },
  ];

  const sectionsToRender = filterSections || defaultFilterSections;

  return (
    <>
      {/* Light overlay backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,80rem)] lg:w-[min(70vw-2rem,80rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-5 shadow-xl ring-1 ring-black/5 max-h-[calc(100vh-3rem)] overflow-y-auto"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-md font-semibold text-gray-900">
            Filter Inventory
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary shrink-0"
            aria-label="Close"
          >
            <IoMdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {sectionsToRender.map((section) => (
            <div key={section.title} className="outer-wrapper">
              <h3 className="text-base font-semibold text-gray-800 mb-3">{section.title}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {section.fields.map((field) => {
                  const isLoading = loadingFields.has(field.name as string);
                  const enabled = isFieldEnabled(field.name);

                  if (field.name === 'country') {
                    const countryOptions = getCountrySelectOptions();
                    return (
                      <label key={field.name} className="block">
                        <span className="mb-1 block text-xs font-medium text-gray-700">
                          {field.label}
                          {isLoading && <span className="ml-1 text-xs text-blue-600">• Loading...</span>}
                        </span>
                        <SelectDropdown
                          name={field.name as string}
                          value={draft[field.name]}
                          placeholder={`Select ${field.label.toLowerCase()}`}
                          options={countryOptions}
                          onChange={(val) =>
                            handleFieldChange(
                              field.name,
                              typeof val === 'string' ? val : val[0] || ''
                            )
                          }
                          disabled={isLoading || !enabled}
                          className="w-full"
                          inputClassName="h-10"
                          searchable
                        />
                      </label>
                    );
                  }

                  const multiOptions = getMultiSelectStructuredOptions(field.name as string);
                  return (
                    <label key={field.name} className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-700">
                        {field.label}
                        {isLoading && <span className="ml-1 text-xs text-blue-600">• Loading...</span>}
                      </span>
                      <MultiSelectDropdown
                        name={field.name as string}
                        value={splitCsvTokens(draft[field.name])}
                        placeholder={`Select ${field.label.toLowerCase()}`}
                        options={multiOptions}
                        onChange={(vals) => handleFieldChange(field.name, joinCsvTokens(vals))}
                        disabled={isLoading || !enabled}
                        className="w-full"
                        inputClassName="h-10"
                        multi
                        horizontalScroll
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn-primary"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="btn-primary !bg-black"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPopup;