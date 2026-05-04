import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import LeadList from './LeadList';

const STATUS_OPTIONS = ['Meeting Done', 'Meeting Scheduled'] as const;
type MeetingStatus = (typeof STATUS_OPTIONS)[number];

const MeetingDone: React.FC = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<MeetingStatus[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = (status: MeetingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  const leadListFilters = useMemo(() => {
    // Default (none selected) and both selected: show all meeting data
    if (
      selectedStatuses.length === 0 ||
      selectedStatuses.length === STATUS_OPTIONS.length
    ) {
      return {
        filterStatus: 'Meeting Done',
        extraStatuses: ['Meeting Scheduled'],
      };
    }

    return {
      filterStatus: selectedStatuses[0],
      extraStatuses: [] as string[],
    };
  }, [selectedStatuses]);

  return (
    <LeadList
      title="Meeting"
      filterStatus={leadListFilters.filterStatus}
      extraStatuses={leadListFilters.extraStatuses}
      permissionStatus="Meeting Done"
      headerActions={
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`!px-3 !py-2 !border !border-gray-200 !text-sm font-medium transition !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0 ${
              isFilterOpen
                ? '!bg-orange-600 !text-white hover:bg-orange-700'
                : '!bg-white !text-gray-700 hover:!bg-gray-50'
            }`}
          >
            <span className="inline-flex items-center gap-x-2">
              <FiFilter className="h-4 w-4" />
              Filter
            </span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Filter By Status
              </p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((status) => (
                  <label key={status} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-orange-600"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default MeetingDone;
