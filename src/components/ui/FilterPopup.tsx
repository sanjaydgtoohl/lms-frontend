import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

export type LocationFilterValues = {
  state: string;
  city: string;
  zoneArea: string;
  subZoneArea: string;
  pincode: string;
  arterialRoute: string;
  modeOfMedia: string;
  publisher: string;
  mainCategory: string;
  categorySub: string;
  category: string;
  locationType: string;
  orientation: string;
  resolution: string;
  screenLocation: string;
  stretch: string;
  property: string;
};

type FilterPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Values currently applied (used to seed draft when opening) */
  appliedValues: LocationFilterValues;
  onApply: (values: LocationFilterValues) => void;
  onReset: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

const initialDraft = (v: LocationFilterValues): LocationFilterValues => ({
  state: v.state,
  city: v.city,
  zoneArea: v.zoneArea,
  subZoneArea: v.subZoneArea,
  pincode: v.pincode,
  arterialRoute: v.arterialRoute,
  modeOfMedia: v.modeOfMedia,
  publisher: v.publisher,
  mainCategory: v.mainCategory,
  categorySub: v.categorySub,
  category: v.category,
  locationType: v.locationType,
  orientation: v.orientation,
  resolution: v.resolution,
  screenLocation: v.screenLocation,
  stretch: v.stretch,
  property: v.property,
});

const filterSections = [
  {
    title: 'Location',
    fields: [
      { name: 'state', label: 'State', autoComplete: 'address-level1' },
      { name: 'city', label: 'City', autoComplete: 'address-level2' },
      { name: 'zoneArea', label: 'Zone Area' },
      { name: 'subZoneArea', label: 'Sub Zone Area' },
      { name: 'pincode', label: 'Pincode', autoComplete: 'postal-code' },
      { name: 'arterialRoute', label: 'Arterial Route' },
    ],
  },
  {
    title: 'Category',
    fields: [
      { name: 'modeOfMedia', label: 'Mode of Media (Screen Type)' },
      { name: 'publisher', label: 'Publisher' },
      { name: 'mainCategory', label: 'Main Category' },
      { name: 'categorySub', label: 'Category Sub' },
      { name: 'category', label: 'Category' },
    ],
  },
  {
    title: 'Screen',
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

const FilterPopup: React.FC<FilterPopupProps> = ({
  isOpen,
  onClose,
  appliedValues,
  onApply,
  onReset,
  anchorRef,
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<LocationFilterValues>(() => initialDraft(appliedValues));

  useEffect(() => {
    if (!isOpen) return;
    setDraft(initialDraft(appliedValues));
  }, [isOpen, appliedValues]);

  const handleApply = useCallback(() => {
    onApply({
      state: draft.state.trim(),
      city: draft.city.trim(),
      zoneArea: draft.zoneArea.trim(),
      subZoneArea: draft.subZoneArea.trim(),
      pincode: draft.pincode.trim(),
      arterialRoute: draft.arterialRoute.trim(),
      modeOfMedia: draft.modeOfMedia.trim(),
      publisher: draft.publisher.trim(),
      mainCategory: draft.mainCategory.trim(),
      categorySub: draft.categorySub.trim(),
      category: draft.category.trim(),
      locationType: draft.locationType.trim(),
      orientation: draft.orientation.trim(),
      resolution: draft.resolution.trim(),
      screenLocation: draft.screenLocation.trim(),
      stretch: draft.stretch.trim(),
      property: draft.property.trim(),
    });
    onClose();
  }, [draft, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraft({
      state: '',
      city: '',
      zoneArea: '',
      subZoneArea: '',
      pincode: '',
      arterialRoute: '',
      modeOfMedia: '',
      publisher: '',
      mainCategory: '',
      categorySub: '',
      category: '',
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

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen, onClose, anchorRef]);

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

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,80rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-5 shadow-xl ring-1 ring-black/5 max-h-[calc(100vh-3rem)] overflow-y-auto"
    >
      <h2 id={titleId} className="text-base font-semibold text-gray-900 mb-4">
        Filter inventory
      </h2>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {filterSections.slice(0, 2).map((section) => (
            <div key={section.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{section.title}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-700">{field.label}</span>
                    <input
                      type="text"
                      value={draft[field.name as keyof LocationFilterValues]}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [field.name]: e.target.value } as LocationFilterValues))
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      autoComplete={field.autoComplete ?? 'off'}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          {filterSections.slice(2).map((section) => (
            <div key={section.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{section.title}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-700">{field.label}</span>
                    <input
                      type="text"
                      value={draft[field.name as keyof LocationFilterValues]}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [field.name]: e.target.value } as LocationFilterValues))
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      autoComplete={field.autoComplete ?? 'off'}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/15"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
