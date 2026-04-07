import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type LocationFilterValues = {
  state: string;
  city: string;
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
});

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
  const stateInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<LocationFilterValues>(() => initialDraft(appliedValues));
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;
    setDraft(initialDraft(appliedValues));
  }, [isOpen, appliedValues.state, appliedValues.city]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    setPosition({
      top: rect.bottom + gap,
      left: rect.left, // Fixed left position
    });
  }, [isOpen, anchorRef]);

  const handleApply = useCallback(() => {
    onApply({
      state: draft.state.trim(),
      city: draft.city.trim(),
    });
    onClose();
  }, [draft, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraft({ state: '', city: '' });
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

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => stateInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed z-50 w-[min(100vw-2rem,20rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg ring-1 ring-black/5"
      style={{
        top: position.top,
        left: position.left,
        transition: 'none', // Ensure no CSS transitions are applied
      }}
    >
      <h2 id={titleId} className="text-sm font-semibold text-gray-900 mb-3">
        Filter by location
      </h2>
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">State</span>
          <input
            ref={stateInputRef}
            type="text"
            value={draft.state}
            onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))}
            placeholder="Enter state"
            autoComplete="address-level1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">City</span>
          <input
            type="text"
            value={draft.city}
            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
            placeholder="Enter city"
            autoComplete="address-level2"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          className="rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          style={{ backgroundColor: 'oklch(0.705 0.213 47.604)' }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
