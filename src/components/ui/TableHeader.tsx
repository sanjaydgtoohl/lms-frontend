// components/PageHeader.tsx
import { Filter, X } from "lucide-react";
import SelectField from "./SelectField";
import MultiSelectDropdown from "./MultiSelectDropdown";
import React, { useState, useRef, useEffect } from "react";

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
}

const parseFilterValues = (value?: string): string[] =>
    value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

const serializeFilterValues = (values: string[]): string =>
    values.filter(Boolean).join(',');

const TableHeader: React.FC<PageHeaderProps> = ({
    title,
    children,
    filterOptions = [],
    onFilterChange,
    appliedFilters = {}
}) => {
    const filterRef = useRef<HTMLDivElement>(null);
    const [showFilters, setShowFilters] = useState(false);
    
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            ) {
                setShowFilters(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const hasActiveFilters = Object.keys(appliedFilters).some(
        (key) => parseFilterValues(appliedFilters[key]).length > 0
    );

    const activeFilterCount = Object.values(appliedFilters).reduce(
        (count, value) => count + (parseFilterValues(value).length > 0 ? 1 : 0),
        0
    );

    const hasMultiselectFilters = filterOptions.some((filter) => filter.isMulti);

    return (
        <div className="bg-gray-50 px-3 md:px-5 py-3 md:py-4 border-b border-gray-200">
            <div className="flex flex-row items-center justify-between gap-3 flex-wrap md:flex-nowrap">
                <h2 className="text-sm md:text-base font-semibold text-gray-900 shrink-0">
                    {title}
                </h2>

                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    {filterOptions.length > 0 && (
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border! border-gray-200! transition-colors ${hasActiveFilters
                                    ? 'bg-orange-50 border-orange-300! text-orange-600'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="bg-orange-600 text-white text-xs w-5 leading-none flex justify-center items-center aspect-square rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {showFilters && (
                                <div className={`absolute left-0 sm:right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${hasMultiselectFilters ? 'w-80' : 'w-64'}`}>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                                >
                                                    <X className="w-5 h-5  mr-1" />
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {filterOptions.map((filter) => {
                                                const isMulti = Boolean(filter.isMulti);
                                                const selectedValues = parseFilterValues(appliedFilters[filter.key]);

                                                return (
                                                <div key={filter.key} className="relative">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                                inputClassName="border-gray-200 focus:ring-blue-500"
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
                                                                        handleFilterChange(filter.key, String(single));
                                                                    }}
                                                                    options={filter.options}
                                                                    placeholder={`Select ${filter.label}`}
                                                                    searchable={false}
                                                                    isMulti={false}
                                                                    autoCloseOnSelect={true}
                                                                    inputClassName="border-gray-200 focus:ring-blue-500 pr-8"
                                                                    className="w-full"
                                                                />

                                                                {appliedFilters[filter.key] && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleFilterChange(filter.key, '')}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <X className="w-4 h-4" />
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
                                </div>
                            )}
                        </div>
                    )}

                    <div className="w-full sm:w-auto flex items-center gap-3 flex-wrap justify-end">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableHeader;