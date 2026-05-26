// components/PageHeader.tsx
import { Filter, X } from 'lucide-react';
import SelectField from './SelectField';
import MultiSelectDropdown from './MultiSelectDropdown';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface FilterOption {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    isMulti?: boolean;
}

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
    filterOptions?: FilterOption[];
    onFilterChange?: (filters: Record<string, string>) => void;
    appliedFilters?: Record<string, string>;
    filterExtras?: React.ReactNode;
    extraFilterActive?: boolean;
}

const parseFilterValues = (value?: string): string[] =>
    value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

const serializeFilterValues = (values: string[]): string =>
    values.filter(Boolean).join(',');

type PanelPosition = { top: number; left: number; width: number };

const TableHeader: React.FC<PageHeaderProps> = ({
    title,
    children,
    filterOptions = [],
    onFilterChange,
    appliedFilters = {},
    filterExtras,
    extraFilterActive = false,
}) => {
    const filterRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [panelStyle, setPanelStyle] = useState<PanelPosition | null>(null);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...appliedFilters };
        if (value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        onFilterChange?.(newFilters);
    };

    const clearFilters = () => {
        onFilterChange?.({});
    };

    const updatePanelPosition = useCallback(() => {
        const anchor = filterRef.current;
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const panelWidth = Math.min(320, window.innerWidth - 16);
        const gap = 8;
        let left = rect.right - panelWidth;
        left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

        setPanelStyle({
            top: rect.bottom + gap,
            left,
            width: panelWidth,
        });
    }, []);

    useEffect(() => {
        if (!showFilters) return;

        updatePanelPosition();

        const onScrollOrResize = () => updatePanelPosition();
        window.addEventListener('resize', onScrollOrResize);
        window.addEventListener('scroll', onScrollOrResize, true);

        return () => {
            window.removeEventListener('resize', onScrollOrResize);
            window.removeEventListener('scroll', onScrollOrResize, true);
        };
    }, [showFilters, updatePanelPosition]);

    useEffect(() => {
        if (!showFilters) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                filterRef.current?.contains(target) ||
                panelRef.current?.contains(target)
            ) {
                return;
            }
            setShowFilters(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setShowFilters(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showFilters]);

    const hasColumnFilters = Object.keys(appliedFilters).some(
        (key) => parseFilterValues(appliedFilters[key]).length > 0
    );

    const columnFilterCount = Object.values(appliedFilters).reduce(
        (count, value) => count + (parseFilterValues(value).length > 0 ? 1 : 0),
        0
    );

    const hasActiveFilters = hasColumnFilters || extraFilterActive;
    const activeFilterCount = columnFilterCount + (extraFilterActive ? 1 : 0);
    const showFilterButton = filterOptions.length > 0 || Boolean(filterExtras);

    const filterPanel =
        showFilters && panelStyle
            ? createPortal(
                  <div
                      ref={panelRef}
                      role="dialog"
                      aria-label="Table filters"
                      className="fixed z-[9999]"
                      style={{
                          top: panelStyle.top,
                          left: panelStyle.left,
                          width: panelStyle.width,
                      }}
                  >
                      <div className="flex max-h-[min(70vh,28rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
                          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                              {hasColumnFilters && (
                                  <button
                                      type="button"
                                      onClick={clearFilters}
                                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
                                  >
                                      <X className="h-3.5 w-3.5" />
                                      Clear all
                                  </button>
                              )}
                          </div>

                          <div className="space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
                              {filterExtras && (
                                  <div
                                      className={
                                          filterOptions.length > 0
                                              ? 'border-b border-gray-100 pb-4'
                                              : ''
                                      }
                                  >
                                      {filterExtras}
                                  </div>
                              )}

                              {filterOptions.map((filter) => {
                                  const isMulti = Boolean(filter.isMulti);
                                  const selectedValues = parseFilterValues(
                                      appliedFilters[filter.key]
                                  );

                                  return (
                                      <div key={filter.key} className="space-y-1.5">
                                          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                              {filter.label}
                                          </label>

                                          <div className="relative">
                                              {isMulti ? (
                                                  <MultiSelectDropdown
                                                      name={filter.key}
                                                      value={selectedValues}
                                                      onChange={(vals) =>
                                                          handleFilterChange(
                                                              filter.key,
                                                              serializeFilterValues(vals)
                                                          )
                                                      }
                                                      options={filter.options}
                                                      placeholder={`Select ${filter.label}`}
                                                      inputClassName="!min-h-9 border-gray-200 text-sm focus:ring-orange-400/30"
                                                      className="w-full"
                                                      horizontalScroll
                                                  />
                                              ) : (
                                                  <>
                                                      <SelectField
                                                          name={filter.key}
                                                          value={appliedFilters[filter.key] || ''}
                                                          onChange={(value) => {
                                                              const single = Array.isArray(value)
                                                                  ? (value[0] ?? '')
                                                                  : value;
                                                              handleFilterChange(
                                                                  filter.key,
                                                                  String(single)
                                                              );
                                                          }}
                                                          options={filter.options}
                                                          placeholder={`Select ${filter.label}`}
                                                          searchable={false}
                                                          isMulti={false}
                                                          autoCloseOnSelect={true}
                                                          inputClassName="!min-h-9 border-gray-200 text-sm pr-8 focus:ring-orange-400/30"
                                                          className="w-full"
                                                      />

                                                      {appliedFilters[filter.key] && (
                                                          <button
                                                              type="button"
                                                              onClick={() =>
                                                                  handleFilterChange(filter.key, '')
                                                              }
                                                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                                                              aria-label={`Clear ${filter.label}`}
                                                          >
                                                              <X className="h-4 w-4" />
                                                          </button>
                                                      )}
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  </div>,
                  document.body
              )
            : null;

    return (
        <div className="lms-table-header relative z-20 overflow-visible border-b border-gray-200 bg-slate-50/80 px-3 py-3 md:px-5 md:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-gray-900 shrink-0 md:text-lg">
                    {title}
                </h2>

                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {showFilterButton && (
                        <div className="relative shrink-0" ref={filterRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowFilters((open) => {
                                        if (!open) updatePanelPosition();
                                        return !open;
                                    });
                                }}
                                className={`inline-flex h-9 items-center gap-2 !rounded-lg !border !px-3 !py-0 text-sm font-medium !shadow-none transition-colors focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-orange-400/40 ${
                                    hasActiveFilters
                                        ? '!border-orange-300 !bg-orange-50 !text-orange-700'
                                        : '!border-gray-200 !bg-white !text-gray-700 hover:!bg-gray-50'
                                }`}
                                aria-expanded={showFilters}
                                aria-haspopup="dialog"
                            >
                                <Filter className="h-4 w-4 shrink-0" />
                                <span>Filters</span>
                                {hasActiveFilters && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-semibold leading-none text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    {children && (
                        <div className="min-w-0 w-full sm:w-auto sm:min-w-[12rem] sm:max-w-xs">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {filterPanel}
        </div>
    );
};

export default TableHeader;
