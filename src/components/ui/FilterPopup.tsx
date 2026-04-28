import React, { useCallback, useEffect, useId, useState, useRef } from 'react';
import SelectDropdown from './SelectDropdown';
import {
  fetchStates,
  fetchCities,
  fetchZones,
  fetchSubZones,
  fetchPincodes,
  fetchArterialRoutes,
  fetchCategories,
  fetchSubCategories,
  fetchAllFilterOptions,
  type LocationOption,
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

    if (Object.keys(options).length === 0) {
      // Fetch initial options if not provided
      const initializeOptions = async () => {
        try {
          const initialOptions = await fetchAllFilterOptions();
          const transformed: FilterOptions = {
            country: initialOptions.countries,
            state: initialOptions.states,
            city: initialOptions.cities,
            zoneArea: initialOptions.zones,
            subZoneArea: initialOptions.subZones,
            pincode: initialOptions.pincodes,
            arterialRoute: initialOptions.arterialRoutes,
            modeOfMedia: initialOptions.modeOfMedia,
            publisher: initialOptions.publishers,
            mainCategory: initialOptions.mainCategories,
            category: initialOptions.categories,
            categorySub: initialOptions.subCategories,
            locationType: initialOptions.locationTypes,
            orientation: initialOptions.orientations,
            resolution: initialOptions.resolutions,
            screenLocation: initialOptions.screenLocations,
            stretch: initialOptions.stretches,
            property: initialOptions.properties,
          };
          setAllOptions(transformed);
        } catch (error) {
          console.warn('Failed to initialize filter options - will use empty dropdowns:', error);
          // Graceful fallback - dropdowns will be empty but UI will still work
        }
      };
      initializeOptions();
    } else {
      setAllOptions(options);
    }

    setDraft(appliedValues);
  }, [isOpen, appliedValues, options]);

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

      if (fieldName === 'category' && value !== draft.category) {
        newDraft.categorySub = '';
      }

      setDraft(newDraft);

      // Fetch dependent field data
      try {
        if (fieldName === 'country' && value) {
          setFieldLoading('state', true);
          const states = await fetchStates(value);
          updateFieldOptions('state', states);
          setFieldLoading('state', false);
        }

        if (fieldName === 'state' && value) {
          setFieldLoading('city', true);
          const cities = await fetchCities(value);
          updateFieldOptions('city', cities);
          setFieldLoading('city', false);
        }

        if (fieldName === 'city' && value) {
          setFieldLoading('zoneArea', true);
          setFieldLoading('arterialRoute', true);
          const [zones, arterialRoutes] = await Promise.all([
            fetchZones(value),
            fetchArterialRoutes(value),
          ]);
          updateFieldOptions('zoneArea', zones);
          updateFieldOptions('arterialRoute', arterialRoutes);
          setFieldLoading('zoneArea', false);
          setFieldLoading('arterialRoute', false);
        }

        if (fieldName === 'zoneArea' && value) {
          setFieldLoading('subZoneArea', true);
          const subZones = await fetchSubZones(value);
          updateFieldOptions('subZoneArea', subZones);
          setFieldLoading('subZoneArea', false);
        }

        if (fieldName === 'subZoneArea' && value) {
          setFieldLoading('pincode', true);
          const pincodes = await fetchPincodes(value);
          updateFieldOptions('pincode', pincodes);
          setFieldLoading('pincode', false);
        }

        if (fieldName === 'mainCategory' && value) {
          setFieldLoading('category', true);
          const categories = await fetchCategories(value);
          updateFieldOptions('category', categories);
          setFieldLoading('category', false);
        }

        if (fieldName === 'category' && value) {
          setFieldLoading('categorySub', true);
          const subCategories = await fetchSubCategories(value);
          updateFieldOptions('categorySub', subCategories);
          setFieldLoading('categorySub', false);
        }
      } catch (error) {
        console.warn('Cascade fetch error handled gracefully:', error);
        // Errors are silently handled - dropdowns will show empty if API fails
      }
    },
    [draft, setFieldLoading, updateFieldOptions]
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Helper to convert LocationOption[] to display format
  const getOptionsForField = (fieldName: string): string[] => {
    const opts = allOptions[fieldName];
    if (!opts) return [];
    if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === 'object') {
      return (opts as LocationOption[]).map((opt: any) => opt.name || opt.label || String(opt.id));
    }
    return (opts as unknown as string[]) || [];
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
        { name: 'mainCategory', label: 'Main Category' },
        { name: 'category', label: 'Category' },
        { name: 'categorySub', label: 'Sub Category' },
        { name: 'modeOfMedia', label: 'Mode of Media' },
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
                        disabled={isLoading}
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