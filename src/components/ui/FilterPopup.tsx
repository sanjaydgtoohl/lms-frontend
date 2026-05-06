import React, { useCallback, useEffect, useId, useState, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const stateCascadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parseMultiValue = useCallback((value: string): string[] => {
    if (!value) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }, []);

  const getNormalizedOptionLabel = useCallback((opt: LocationOption): string => {
    return String(opt.name || opt.label || opt.id || '').trim();
  }, []);

  const mergeUniqueOptions = useCallback((groups: LocationOption[][]): LocationOption[] => {
    const map = new Map<string, LocationOption>();
    groups.forEach((group) => {
      group.forEach((opt) => {
        const key = `${String(opt.id)}::${getNormalizedOptionLabel(opt).toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, opt);
        }
      });
    });
    return Array.from(map.values());
  }, [getNormalizedOptionLabel]);

  // Helper function to mark field as loading
  const setFieldLoading = useCallback((fieldName: string, isLoading: boolean) => {
    setLoadingFields((prev) => {
      const next = new Set(prev);
      if (isLoading) {
        next.add(fieldName);
      } else {
        next.delete(fieldName);
      }
      return next;
    });
  }, []);

  // Helper function to update options for a specific field
  const updateFieldOptions = useCallback((fieldName: string, newOptions: LocationOption[]) => {
    setAllOptions((prev) => ({
      ...prev,
      [fieldName]: newOptions,
    }));
  }, []);

  const findOptionByValue = useCallback(
    (fieldName: string, selectedValue: string): LocationOption | undefined => {
      const fieldOptions = allOptions[fieldName] || [];
      const normalizedValue = selectedValue.trim();
      return fieldOptions.find((opt) => {
        const label = getNormalizedOptionLabel(opt);
        return (
          label === normalizedValue ||
          String(opt.id) === normalizedValue
        );
      });
    },
    [allOptions, getNormalizedOptionLabel]
  );

  // UI stores display names in draft, but cascading APIs expect IDs.
  const getSelectedOptionIds = useCallback(
    (fieldName: string, selectedValue: string): Array<string | number> => {
      const selectedItems = parseMultiValue(selectedValue);
      if (!selectedItems.length) return [];
      return selectedItems
        .map((item) => findOptionByValue(fieldName, item)?.id)
        .filter((id): id is string | number => id !== undefined && id !== null);
    },
    [findOptionByValue, parseMultiValue]
  );

  // Initialize with options from parent or fetch if not provided and rehydrate dependent cascades.
  useEffect(() => {
    if (!isOpen) return;

    const loadInitial = async () => {
      try {
        const [countries, modeOfMedia, locationTypes] = await Promise.all([
          fetchCountries(),
          fetchModeOfMedia(),
          fetchLocationTypes(),
        ]);

        let nextOptions: FilterOptions = {
          ...options,
          country: countries,
          modeOfMedia,
          locationType: locationTypes,
        };

        const resolveIds = (fieldName: string, rawValue: string) =>
          parseMultiValue(rawValue)
            .map((item) => {
              const matched = (nextOptions[fieldName] || []).find((opt) => {
                const label = getNormalizedOptionLabel(opt);
                return label === item || String(opt.id) === item;
              });
              return matched?.id;
            })
            .filter((id): id is string | number => id !== undefined && id !== null);

        const countryIds = resolveIds('country', appliedValues.country);
        if (countryIds.length) {
          const statesByCountry = await Promise.all(countryIds.map((id) => fetchStates(id)));
          nextOptions = { ...nextOptions, state: mergeUniqueOptions(statesByCountry) };
        }

        const stateIds = resolveIds('state', appliedValues.state);
        if (stateIds.length) {
          const citiesByState = await Promise.all(stateIds.map((id) => fetchCities(id)));
          nextOptions = { ...nextOptions, city: mergeUniqueOptions(citiesByState) };
        }

        const cityIds = resolveIds('city', appliedValues.city);
        if (cityIds.length) {
          const [zonesByCity, arterialByCity] = await Promise.all([
            Promise.all(cityIds.map((id) => fetchZones(id))),
            Promise.all(cityIds.map((id) => fetchArterialRoutes(id))),
          ]);
          nextOptions = {
            ...nextOptions,
            zoneArea: mergeUniqueOptions(zonesByCity),
            arterialRoute: mergeUniqueOptions(arterialByCity),
          };
        }

        const zoneIds = resolveIds('zoneArea', appliedValues.zoneArea);
        if (zoneIds.length) {
          const subZonesByZone = await Promise.all(zoneIds.map((id) => fetchSubZones(id)));
          nextOptions = { ...nextOptions, subZoneArea: mergeUniqueOptions(subZonesByZone) };
        }

        const subZoneIds = resolveIds('subZoneArea', appliedValues.subZoneArea);
        if (subZoneIds.length) {
          const pincodesBySubZone = await Promise.all(subZoneIds.map((id) => fetchPincodes(id)));
          nextOptions = { ...nextOptions, pincode: mergeUniqueOptions(pincodesBySubZone) };
        }

        const modeIds = resolveIds('modeOfMedia', appliedValues.modeOfMedia);
        if (modeIds.length) {
          const publishersByMode = await Promise.all(modeIds.map((id) => fetchPublishers(id)));
          nextOptions = { ...nextOptions, publisher: mergeUniqueOptions(publishersByMode) };
        }

        const publisherIds = resolveIds('publisher', appliedValues.publisher);
        if (publisherIds.length) {
          const mainCategoriesByPublisher = await Promise.all(
            publisherIds.map((id) => fetchMainCategories(id))
          );
          nextOptions = { ...nextOptions, mainCategory: mergeUniqueOptions(mainCategoriesByPublisher) };
        }

        const mainCategoryIds = resolveIds('mainCategory', appliedValues.mainCategory);
        if (mainCategoryIds.length) {
          const categoriesByMainCategory = await Promise.all(
            mainCategoryIds.map((id) => fetchCategories(id))
          );
          nextOptions = { ...nextOptions, category: mergeUniqueOptions(categoriesByMainCategory) };
        }

        const categoryIds = resolveIds('category', appliedValues.category);
        if (categoryIds.length) {
          const subCategoriesByCategory = await Promise.all(
            categoryIds.map((id) => fetchSubCategories(id))
          );
          nextOptions = { ...nextOptions, categorySub: mergeUniqueOptions(subCategoriesByCategory) };
        }

        const locationTypeIds = resolveIds('locationType', appliedValues.locationType);
        if (locationTypeIds.length) {
          const orientationsByLocationType = await Promise.all(
            locationTypeIds.map((id) => fetchOrientations(id))
          );
          nextOptions = { ...nextOptions, orientation: mergeUniqueOptions(orientationsByLocationType) };
        }

        const orientationIds = resolveIds('orientation', appliedValues.orientation);
        if (orientationIds.length) {
          const resolutionsByOrientation = await Promise.all(
            orientationIds.map((id) => fetchResolutions(id))
          );
          nextOptions = { ...nextOptions, resolution: mergeUniqueOptions(resolutionsByOrientation) };
        }

        const resolutionIds = resolveIds('resolution', appliedValues.resolution);
        if (resolutionIds.length) {
          const screenLocationsByResolution = await Promise.all(
            resolutionIds.map((id) => fetchScreenLocations(id))
          );
          nextOptions = { ...nextOptions, screenLocation: mergeUniqueOptions(screenLocationsByResolution) };
        }

        const screenLocationIds = resolveIds('screenLocation', appliedValues.screenLocation);
        if (screenLocationIds.length) {
          const stretchesByScreenLocation = await Promise.all(
            screenLocationIds.map((id) => fetchStretches(id))
          );
          nextOptions = { ...nextOptions, stretch: mergeUniqueOptions(stretchesByScreenLocation) };
        }

        const stretchIds = resolveIds('stretch', appliedValues.stretch);
        if (stretchIds.length) {
          const propertiesByStretch = await Promise.all(stretchIds.map((id) => fetchProperties(id)));
          nextOptions = { ...nextOptions, property: mergeUniqueOptions(propertiesByStretch) };
        }

        setAllOptions(nextOptions);
      } catch (error) {
        console.warn('Failed to load initial filter options:', error);
      }
    };

    loadInitial();
    setDraft(appliedValues);
  }, [
    isOpen,
    appliedValues,
    options,
    parseMultiValue,
    getNormalizedOptionLabel,
    mergeUniqueOptions,
  ]);

  // Handle cascading updates when a field changes
  const handleFieldChange = useCallback(
    async (fieldName: keyof LocationFilterValues, value: string) => {
      const newDraft = {
        ...draft,
        [fieldName]: value,
      };

      // Cascading logic - reset dependent fields when parent changes
      if (fieldName === 'country' && value !== draft.country) {
        newDraft.state = '';
        newDraft.city = '';
        newDraft.zoneArea = '';
        newDraft.subZoneArea = '';
        newDraft.pincode = '';
        newDraft.arterialRoute = '';
      }

      if (fieldName === 'state' && value !== draft.state) {
        newDraft.city = '';
        newDraft.zoneArea = '';
        newDraft.subZoneArea = '';
        newDraft.pincode = '';
        newDraft.arterialRoute = '';
      }

      if (fieldName === 'city' && value !== draft.city) {
        newDraft.zoneArea = '';
        newDraft.subZoneArea = '';
        newDraft.pincode = '';
        newDraft.arterialRoute = '';
      }

      if (fieldName === 'zoneArea' && value !== draft.zoneArea) {
        newDraft.subZoneArea = '';
        newDraft.pincode = '';
      }

      if (fieldName === 'subZoneArea' && value !== draft.subZoneArea) {
        newDraft.pincode = '';
      }

      if (fieldName === 'mainCategory' && value !== draft.mainCategory) {
        newDraft.category = '';
        newDraft.categorySub = '';
      }

      if (fieldName === 'modeOfMedia' && value !== draft.modeOfMedia) {
        newDraft.publisher = '';
        newDraft.mainCategory = '';
        newDraft.category = '';
        newDraft.categorySub = '';
      }

      if (fieldName === 'publisher' && value !== draft.publisher) {
        newDraft.mainCategory = '';
        newDraft.category = '';
        newDraft.categorySub = '';
      }

      if (fieldName === 'category' && value !== draft.category) {
        newDraft.categorySub = '';
      }

      if (fieldName === 'locationType' && value !== draft.locationType) {
        newDraft.orientation = '';
        newDraft.resolution = '';
        newDraft.screenLocation = '';
        newDraft.stretch = '';
        newDraft.property = '';
      }

      if (fieldName === 'orientation' && value !== draft.orientation) {
        newDraft.resolution = '';
        newDraft.screenLocation = '';
        newDraft.stretch = '';
        newDraft.property = '';
      }

      if (fieldName === 'resolution' && value !== draft.resolution) {
        newDraft.screenLocation = '';
        newDraft.stretch = '';
        newDraft.property = '';
      }

      if (fieldName === 'screenLocation' && value !== draft.screenLocation) {
        newDraft.stretch = '';
        newDraft.property = '';
      }

      if (fieldName === 'stretch' && value !== draft.stretch) {
        newDraft.property = '';
      }

      setDraft(newDraft);

      // Fetch dependent field data
      try {
        if (fieldName === 'country' && value) {
          const countryId = getSelectedOptionIds('country', value)[0];
          if (countryId === undefined) return;
          setFieldLoading('state', true);
          const states = await fetchStates(countryId);
          updateFieldOptions('state', states);
          setFieldLoading('state', false);
        }

        if (fieldName === 'state' && value) {
          if (stateCascadeTimerRef.current) {
            clearTimeout(stateCascadeTimerRef.current);
            stateCascadeTimerRef.current = null;
            // Cancelled callbacks never reach `finally`, so clear loading from superseded runs.
            setFieldLoading('city', false);
          }
          setFieldLoading('city', true);
          stateCascadeTimerRef.current = setTimeout(async () => {
            try {
              const stateIds = getSelectedOptionIds('state', value);
              if (!stateIds.length) {
                updateFieldOptions('city', []);
                return;
              }
              const citiesByState = await Promise.all(stateIds.map((stateId) => fetchCities(stateId)));
              const cities = mergeUniqueOptions(citiesByState);
              updateFieldOptions('city', cities);
            } catch (error) {
              console.warn('State cascade fetch error handled gracefully:', error);
            } finally {
              setFieldLoading('city', false);
            }
          }, 300);
          return;
        }

        if (fieldName === 'city' && value) {
          const cityIds = getSelectedOptionIds('city', value);
          if (!cityIds.length) return;
          setFieldLoading('zoneArea', true);
          setFieldLoading('arterialRoute', true);
          const [zonesByCity, arterialRoutesByCity] = await Promise.all([
            Promise.all(cityIds.map((cityId) => fetchZones(cityId))),
            Promise.all(cityIds.map((cityId) => fetchArterialRoutes(cityId))),
          ]);
          const zones = mergeUniqueOptions(zonesByCity);
          const arterialRoutes = mergeUniqueOptions(arterialRoutesByCity);
          updateFieldOptions('zoneArea', zones);
          updateFieldOptions('arterialRoute', arterialRoutes);
          setFieldLoading('zoneArea', false);
          setFieldLoading('arterialRoute', false);
        }

        if (fieldName === 'zoneArea' && value) {
          const zoneIds = getSelectedOptionIds('zoneArea', value);
          if (!zoneIds.length) return;
          setFieldLoading('subZoneArea', true);
          const subZonesByZone = await Promise.all(zoneIds.map((zoneId) => fetchSubZones(zoneId)));
          const subZones = mergeUniqueOptions(subZonesByZone);
          updateFieldOptions('subZoneArea', subZones);
          setFieldLoading('subZoneArea', false);
        }

        if (fieldName === 'subZoneArea' && value) {
          const subZoneIds = getSelectedOptionIds('subZoneArea', value);
          if (!subZoneIds.length) return;
          setFieldLoading('pincode', true);
          const pincodesBySubZone = await Promise.all(subZoneIds.map((subZoneId) => fetchPincodes(subZoneId)));
          const pincodes = mergeUniqueOptions(pincodesBySubZone);
          updateFieldOptions('pincode', pincodes);
          setFieldLoading('pincode', false);
        }

        if (fieldName === 'mainCategory' && value) {
          const mainCategoryIds = getSelectedOptionIds('mainCategory', value);
          if (!mainCategoryIds.length) return;
          setFieldLoading('category', true);
          const categoriesByMainCategory = await Promise.all(
            mainCategoryIds.map((mainCategoryId) => fetchCategories(mainCategoryId))
          );
          const categories = mergeUniqueOptions(categoriesByMainCategory);
          updateFieldOptions('category', categories);
          setFieldLoading('category', false);
        }

        if (fieldName === 'category' && value) {
          const categoryIds = getSelectedOptionIds('category', value);
          if (!categoryIds.length) return;
          setFieldLoading('categorySub', true);
          const subCategoriesByCategory = await Promise.all(
            categoryIds.map((categoryId) => fetchSubCategories(categoryId))
          );
          const subCategories = mergeUniqueOptions(subCategoriesByCategory);
          updateFieldOptions('categorySub', subCategories);
          setFieldLoading('categorySub', false);
        }

        if (fieldName === 'modeOfMedia' && value) {
          const modeOfMediaIds = getSelectedOptionIds('modeOfMedia', value);
          if (!modeOfMediaIds.length) return;
          setFieldLoading('publisher', true);
          const publishersByMode = await Promise.all(
            modeOfMediaIds.map((modeOfMediaValue) => fetchPublishers(modeOfMediaValue))
          );
          const publishers = mergeUniqueOptions(publishersByMode);
          updateFieldOptions('publisher', publishers);
          setFieldLoading('publisher', false);
        }

        if (fieldName === 'publisher' && value) {
          const publisherIds = getSelectedOptionIds('publisher', value);
          if (!publisherIds.length) return;
          setFieldLoading('mainCategory', true);
          const mainCategoriesByPublisher = await Promise.all(
            publisherIds.map((publisherValue) => fetchMainCategories(publisherValue))
          );
          const mainCategories = mergeUniqueOptions(mainCategoriesByPublisher);
          updateFieldOptions('mainCategory', mainCategories);
          setFieldLoading('mainCategory', false);
        }

        if (fieldName === 'locationType' && value) {
          const locationTypeIds = getSelectedOptionIds('locationType', value);
          if (!locationTypeIds.length) return;
          setFieldLoading('orientation', true);
          const orientationsByLocationType = await Promise.all(
            locationTypeIds.map((locationTypeValue) => fetchOrientations(locationTypeValue))
          );
          const orientations = mergeUniqueOptions(orientationsByLocationType);
          updateFieldOptions('orientation', orientations);
          setFieldLoading('orientation', false);
        }

        if (fieldName === 'orientation' && value) {
          const orientationIds = getSelectedOptionIds('orientation', value);
          if (!orientationIds.length) return;
          setFieldLoading('resolution', true);
          const resolutionsByOrientation = await Promise.all(
            orientationIds.map((orientationValue) => fetchResolutions(orientationValue))
          );
          const resolutions = mergeUniqueOptions(resolutionsByOrientation);
          updateFieldOptions('resolution', resolutions);
          setFieldLoading('resolution', false);
        }

        if (fieldName === 'resolution' && value) {
          const resolutionIds = getSelectedOptionIds('resolution', value);
          if (!resolutionIds.length) return;
          setFieldLoading('screenLocation', true);
          const screenLocationsByResolution = await Promise.all(
            resolutionIds.map((resolutionValue) => fetchScreenLocations(resolutionValue))
          );
          const screenLocations = mergeUniqueOptions(screenLocationsByResolution);
          updateFieldOptions('screenLocation', screenLocations);
          setFieldLoading('screenLocation', false);
        }

        if (fieldName === 'screenLocation' && value) {
          const screenLocationIds = getSelectedOptionIds('screenLocation', value);
          if (!screenLocationIds.length) return;
          setFieldLoading('stretch', true);
          const stretchesByScreenLocation = await Promise.all(
            screenLocationIds.map((screenLocationValue) => fetchStretches(screenLocationValue))
          );
          const stretches = mergeUniqueOptions(stretchesByScreenLocation);
          updateFieldOptions('stretch', stretches);
          setFieldLoading('stretch', false);
        }

        if (fieldName === 'stretch' && value) {
          const stretchIds = getSelectedOptionIds('stretch', value);
          if (!stretchIds.length) return;
          setFieldLoading('property', true);
          const propertiesByStretch = await Promise.all(
            stretchIds.map((stretchValue) => fetchProperties(stretchValue))
          );
          const properties = mergeUniqueOptions(propertiesByStretch);
          updateFieldOptions('property', properties);
          setFieldLoading('property', false);
        }
      } catch (error) {
        console.warn('Cascade fetch error handled gracefully:', error);
        // Errors are silently handled - dropdowns will show empty if API fails
      }
    },
    [draft, getSelectedOptionIds, mergeUniqueOptions, setFieldLoading, updateFieldOptions]
  );

  const handleApply = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraft({
      country: 'India',
      state: '',
      city: '',
      zoneArea: '',
      subZoneArea: '',
      pincode: '',
      arterialRoute: '',
      modeOfMedia: '',
      publisher: '',
      mainCategory: '',
      category: '',
      categorySub: '',
      locationType: '',
      orientation: '',
      resolution: '',
      screenLocation: '',
      stretch: '',
      property: '',
    });
    onReset();
    onClose();
  }, [onReset, onClose]);

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
  const controller = abortControllerRef.current;

  return () => {
    if (stateCascadeTimerRef.current) {
      clearTimeout(stateCascadeTimerRef.current);
      stateCascadeTimerRef.current = null;
    }
    if (controller) {
      controller.abort();
    }
  };
}, []);

  if (!isOpen) return null;

  // Helper to convert LocationOption[] to display format
  const getOptionsForField = (fieldName: string): string[] => {
    const opts = allOptions[fieldName];
    if (!opts) return [];

    return opts.map((opt: LocationOption) => {
      return opt.name || opt.label || String(opt.id);
    });
  };

  const isFieldEnabled = (fieldName: keyof LocationFilterValues): boolean => {
    if (fieldName === 'state') return Boolean(draft.country);
    if (fieldName === 'city') return Boolean(draft.state);
    if (fieldName === 'zoneArea') return Boolean(draft.city);
    if (fieldName === 'subZoneArea') return Boolean(draft.zoneArea);
    if (fieldName === 'pincode') return Boolean(draft.subZoneArea);
    if (fieldName === 'arterialRoute') return Boolean(draft.city);

    if (fieldName === 'publisher') return Boolean(draft.modeOfMedia);
    if (fieldName === 'mainCategory') return Boolean(draft.publisher);
    if (fieldName === 'category') return Boolean(draft.mainCategory);
    if (fieldName === 'categorySub') return Boolean(draft.category);

    if (fieldName === 'orientation') return Boolean(draft.locationType);
    if (fieldName === 'resolution') return Boolean(draft.orientation);
    if (fieldName === 'screenLocation') return Boolean(draft.resolution);
    if (fieldName === 'stretch') return Boolean(draft.screenLocation);
    if (fieldName === 'property') return Boolean(draft.stretch);

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
        { name: 'publisher', label: 'Publisher' },
        { name: 'mainCategory', label: 'Main Category' },
        { name: 'category', label: 'Category' },
        { name: 'categorySub', label: 'Sub Category' },
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
        { name: 'property', label: 'Property' },
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
        <h2 id={titleId} className="text-md font-semibold text-gray-900 mb-4">
          Filter Inventory
        </h2>

        <div className="space-y-4">
          {sectionsToRender.map((section) => (
            <div key={section.title} className="outer-wrapper">
              <h3 className="text-base font-semibold text-gray-800 mb-3">{section.title}</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {section.fields.map((field) => {
                  const isLoading = loadingFields.has(field.name as string);
                  const fieldOptions = getOptionsForField(field.name as string);
                  const enabled = isFieldEnabled(field.name);

                  if (field.name === 'country') {
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
                          options={fieldOptions}
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

                  return (
                    <label key={field.name} className="block">
                      <span className="mb-1 block text-xs font-medium text-gray-700">
                        {field.label}
                        {isLoading && <span className="ml-1 text-xs text-blue-600">• Loading...</span>}
                      </span>
                      <MultiSelectDropdown
                        name={field.name as string}
                        value={parseMultiValue(draft[field.name])}
                        placeholder={`Select ${field.label.toLowerCase()}`}
                        options={fieldOptions}
                        onChange={(vals) => handleFieldChange(field.name, vals.join(','))}
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