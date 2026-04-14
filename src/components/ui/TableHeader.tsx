// components/PageHeader.tsx
import { Filter, X } from "lucide-react";
import SelectField from "./SelectField";
import React, { useState, useRef, useEffect } from "react";

interface FilterOption {
    key: string;
    label: string;
    options: { value: string; label: string }[];
}

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
    filterOptions?: FilterOption[];
    onFilterChange?: (filters: Record<string, string>) => void;
    appliedFilters?: Record<string, string>;
}

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

    const hasActiveFilters = Object.keys(appliedFilters).length > 0;

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
                                        {Object.keys(appliedFilters).length}
                                    </span>
                                )}
                            </button>

                            {showFilters && (
                                <div className="absolute left-0 sm:right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
                                            {filterOptions.map((filter) => (
                                                <div key={filter.key} className="relative">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        {filter.label}
                                                    </label>

                                                    <div className="relative">
                                                        <SelectField
                                                            name={filter.key}
                                                            value={appliedFilters[filter.key] || ''}
                                                            onChange={(value) =>
                                                                handleFilterChange(filter.key, String(value))
                                                            }
                                                            options={filter.options}
                                                            placeholder={`Search or select ${filter.label}`}
                                                            searchable={true}
                                                            inputClassName="border-gray-200 focus:ring-blue-500 pr-8"
                                                            className="w-full"
                                                        />

                                                        {/* ✅ Remove single filter icon */}
                                                        {appliedFilters[filter.key] && (
                                                            <button
                                                                onClick={() => handleFilterChange(filter.key, '')}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="w-full sm:w-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableHeader;