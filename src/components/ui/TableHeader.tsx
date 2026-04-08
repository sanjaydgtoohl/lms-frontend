// components/PageHeader.tsx
import React, { useState } from "react";
import { Filter, X } from "lucide-react";

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
}

const TableHeader: React.FC<PageHeaderProps> = ({
    title,
    children,
    filterOptions = [],
    onFilterChange
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...activeFilters };
        if (value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        setActiveFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        onFilterChange?.({});
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className="bg-gray-50 px-3 md:px-5 py-3 md:py-4 border-b border-gray-200">
            <div className="flex flex-row items-center justify-between gap-3 flex-wrap md:flex-nowrap">
                <h2 className="text-sm md:text-base font-semibold text-gray-900 flex-shrink-0">
                    {title}
                </h2>

                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    {filterOptions.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                    hasActiveFilters
                                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {Object.keys(activeFilters).length}
                                    </span>
                                )}
                            </button>

                            {showFilters && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {filterOptions.map((filter) => (
                                                <div key={filter.key}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        {filter.label}
                                                    </label>
                                                    <select
                                                        value={activeFilters[filter.key] || ''}
                                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                                    >
                                                        <option value="">All {filter.label}</option>
                                                        {filter.options.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
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