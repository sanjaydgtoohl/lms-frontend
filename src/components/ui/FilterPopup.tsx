import React, { useCallback, useEffect, useId, useState, useRef } from 'react';
import SelectDropdown from './SelectDropdown';
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
  options = {},
}) => {
  const titleId = useId();
  const [draft, setDraft] = useState<LocationFilterValues>(appliedValues);
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set());
  const [allOptions, setAllOptions] = useState<FilterOptions>(options);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize with options from parent or fetch if not provided
  useEffect(() => {
    if (!isOpen) return;

    const loadInitial = async () => {
      try {
        const [countries, modeOfMedia, locationTypes] = await Promise.all([
          fetchCountries(),
          fetchModeOfMedia(),
          fetchLocationTypes(),
        ]);

        setAllOptions((prev) => ({
          ...prev,
          country: countries,
          modeOfMedia,
          locationType: locationTypes,
        }));
      } catch (error) {
        console.warn('Failed to load initial filter options:', error);
      }
    };

    loadInitial();
    setDraft(appliedValues);

  }, [isOpen, appliedValues]);

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

  // UI stores display names in draft, but cascading APIs expect IDs.
  const getSelectedOptionId = useCallback(
    (fieldName: string, selectedValue: string): string | number | undefined => {
      if (!selectedValue) return undefined;
      const fieldOptions = allOptions[fieldName] || [];
      const matched = fieldOptions.find(
        (opt) => opt.name === selectedValue || opt.label === selectedValue || String(opt.id) === selectedValue
      );
      return matched?.id;
    },
    [allOptions]
  );

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
          const countryId = getSelectedOptionId('country', value);
          setFieldLoading('state', true);
          const states = await fetchStates(countryId);
          updateFieldOptions('state', states);
          setFieldLoading('state', false);
        }

        if (fieldName === 'state' && value) {
          const stateId = getSelectedOptionId('state', value);
          setFieldLoading('city', true);
          const cities = await fetchCities(stateId);
          updateFieldOptions('city', cities);
          setFieldLoading('city', false);
        }

        if (fieldName === 'city' && value) {
          const cityId = getSelectedOptionId('city', value);
          setFieldLoading('zoneArea', true);
          setFieldLoading('arterialRoute', true);
          const [zones, arterialRoutes] = await Promise.all([
            fetchZones(cityId),
            fetchArterialRoutes(cityId),
          ]);
          updateFieldOptions('zoneArea', zones);
          updateFieldOptions('arterialRoute', arterialRoutes);
          setFieldLoading('zoneArea', false);
          setFieldLoading('arterialRoute', false);
        }

        if (fieldName === 'zoneArea' && value) {
          const zoneId = getSelectedOptionId('zoneArea', value);
          setFieldLoading('subZoneArea', true);
          const subZones = await fetchSubZones(zoneId);
          updateFieldOptions('subZoneArea', subZones);
          setFieldLoading('subZoneArea', false);
        }

        if (fieldName === 'subZoneArea' && value) {
          const subZoneId = getSelectedOptionId('subZoneArea', value);
          setFieldLoading('pincode', true);
          const pincodes = await fetchPincodes(subZoneId);
          updateFieldOptions('pincode', pincodes);
          setFieldLoading('pincode', false);
        }

        if (fieldName === 'mainCategory' && value) {
          const mainCategoryId = getSelectedOptionId('mainCategory', value) || value;
          setFieldLoading('category', true);
          const categories = await fetchCategories(mainCategoryId);
          updateFieldOptions('category', categories);
          setFieldLoading('category', false);
        }

        if (fieldName === 'category' && value) {
          const categoryId = getSelectedOptionId('category', value);
          setFieldLoading('categorySub', true);
          const subCategories = await fetchSubCategories(categoryId);
          updateFieldOptions('categorySub', subCategories);
          setFieldLoading('categorySub', false);
        }

        if (fieldName === 'modeOfMedia' && value) {
          const modeOfMediaValue = getSelectedOptionId('modeOfMedia', value) || value;
          setFieldLoading('publisher', true);
          const publishers = await fetchPublishers(modeOfMediaValue);
          updateFieldOptions('publisher', publishers);
          setFieldLoading('publisher', false);
        }

        if (fieldName === 'publisher' && value) {
          const publisherValue = getSelectedOptionId('publisher', value) || value;
          setFieldLoading('mainCategory', true);
          const mainCategories = await fetchMainCategories(publisherValue);
          updateFieldOptions('mainCategory', mainCategories);
          setFieldLoading('mainCategory', false);
        }

        if (fieldName === 'locationType' && value) {
          const locationTypeValue = getSelectedOptionId('locationType', value) || value;
          setFieldLoading('orientation', true);
          const orientations = await fetchOrientations(locationTypeValue);
          updateFieldOptions('orientation', orientations);
          setFieldLoading('orientation', false);
        }

        if (fieldName === 'orientation' && value) {
          const orientationValue = getSelectedOptionId('orientation', value) || value;
          setFieldLoading('resolution', true);
          const resolutions = await fetchResolutions(orientationValue);
          updateFieldOptions('resolution', resolutions);
          setFieldLoading('resolution', false);
        }

        if (fieldName === 'resolution' && value) {
          const resolutionValue = getSelectedOptionId('resolution', value) || value;
          setFieldLoading('screenLocation', true);
          const screenLocations = await fetchScreenLocations(resolutionValue);
          updateFieldOptions('screenLocation', screenLocations);
          setFieldLoading('screenLocation', false);
        }

        if (fieldName === 'screenLocation' && value) {
          const screenLocationValue = getSelectedOptionId('screenLocation', value) || value;
          setFieldLoading('stretch', true);
          const stretches = await fetchStretches(screenLocationValue);
          updateFieldOptions('stretch', stretches);
          setFieldLoading('stretch', false);
        }

        if (fieldName === 'stretch' && value) {
          const stretchValue = getSelectedOptionId('stretch', value) || value;
          setFieldLoading('property', true);
          const properties = await fetchProperties(stretchValue);
          updateFieldOptions('property', properties);
          setFieldLoading('property', false);
        }
      } catch (error) {
        console.warn('Cascade fetch error handled gracefully:', error);
        // Errors are silently handled - dropdowns will show empty if API fails
      }
    },
    [draft, getSelectedOptionId, setFieldLoading, updateFieldOptions]
  );

  const handleApply = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraft({
      country: '',
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
                        searchable
                        disabled={isLoading || !enabled}
                        className="w-full"
                        inputClassName="h-10"
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