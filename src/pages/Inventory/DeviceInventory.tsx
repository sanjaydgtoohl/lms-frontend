/**
 * @file DeviceInventory.tsx
 * @description Device inventory list with filters, export, and detail view.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import FilterPopup from '../../components/ui/FilterPopup';
import ExportCsvButton from '../../components/ui/ExportCsvButton';
import MasterHeader from '../../components/ui/MasterHeader';
import PPTExport from '../../components/ui/PPTExport';
import {
  fetchAllDeviceInventoryRows,
  listDeviceInventory,
  type DeviceData,
} from '../../services/DeviceInventory';
import { DEVICE_INVENTORY_CSV_COLUMNS } from './deviceInventoryCsv';
import {
  DEFAULT_APPLIED_LOCATION,
} from './deviceInventoryConfig.ts';
import { buildDeviceTableColumns } from './deviceInventoryColumns.tsx';
import DeviceDetailModal from './DeviceDetailModal';

const ITEMS_PER_PAGE = 10;

const DeviceInventory: React.FC = () => {
  const filterAnchorRef = useRef<HTMLButtonElement>(null);
  const [data, setData] = useState<DeviceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedLocation, setAppliedLocation] = useState(DEFAULT_APPLIED_LOCATION);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null);

  const getInventoryFilters = useCallback(
    () => ({
      search: searchQuery.trim() || undefined,
      country: appliedLocation.country.trim() || undefined,
      state: appliedLocation.state.trim() || undefined,
      city: appliedLocation.city.trim() || undefined,
      zone: appliedLocation.zoneArea.trim() || undefined,
      subZoneArea: appliedLocation.subZoneArea.trim() || undefined,
      pincode: appliedLocation.pincode.trim() || undefined,
      arterialRoute: appliedLocation.arterialRoute.trim() || undefined,
      modeOfMedia: appliedLocation.modeOfMedia.trim() || undefined,
      publisher: appliedLocation.publisher.trim() || undefined,
      mainCategory: appliedLocation.mainCategory.trim() || undefined,
      categorySub: appliedLocation.categorySub.trim() || undefined,
      category: appliedLocation.category.trim() || undefined,
      locationType: appliedLocation.locationType.trim() || undefined,
      orientation: appliedLocation.orientation.trim() || undefined,
      resolution: appliedLocation.resolution.trim() || undefined,
      screenLocation: appliedLocation.screenLocation.trim() || undefined,
      stretch: appliedLocation.stretch.trim() || undefined,
      property: appliedLocation.property.trim() || undefined,
    }),
    [searchQuery, appliedLocation]
  );

  const hasActiveLocationFilter = useMemo(
    () =>
      Object.entries(appliedLocation).some(([key, value]) => {
        if (key === 'country' && value.trim() === DEFAULT_APPLIED_LOCATION.country) {
          return false;
        }
        return Boolean(value.trim());
      }),
    [appliedLocation]
  );

  const exportFetchRows = useCallback(
    () => fetchAllDeviceInventoryRows(getInventoryFilters()),
    [getInventoryFilters]
  );

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    return pages > 0 ? pages : 1;
  }, [totalItems]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await listDeviceInventory({
          page: currentPage,
          per_page: ITEMS_PER_PAGE,
          ...getInventoryFilters(),
        });
        if (!alive) return;
        setData(Array.isArray(res.data) ? res.data : []);
        setTotalItems(Number(res.total_records || 0));
      } catch {
        if (!alive) return;
        setData([]);
        setTotalItems(0);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [currentPage, getInventoryFilters]);

  const handleViewDetails = useCallback((item: DeviceData) => {
    setSelectedDevice(item);
  }, []);

  const columns = useMemo(
    () => buildDeviceTableColumns(handleViewDetails),
    [handleViewDetails]
  );

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={() => undefined}
        createButtonLabel="Add Device"
        showBreadcrumb
        showCreateButton={false}
        breadcrumbItems={[{ label: 'Device Inventory', path: '/inventory/device' }]}
      />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-3 md:flex-nowrap md:px-6 md:py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 md:text-base">Device Inventory</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {totalItems > 0
                ? `${totalItems.toLocaleString()} devices found`
                : 'Browse and filter available inventory devices'}
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
            <PPTExport fetchRows={exportFetchRows} />
            <ExportCsvButton<DeviceData>
              fetchRows={exportFetchRows}
              columns={DEVICE_INVENTORY_CSV_COLUMNS}
              filenamePrefix="device-inventory"
              aria-label="Export filtered data as CSV"
            />
            <div className="relative w-full min-w-0 sm:w-auto">
              <SearchBar
                delay={300}
                placeholder="Search devices"
                filterSlot={
                  <button
                    ref={filterAnchorRef}
                    type="button"
                    onClick={() => setFilterOpen((open) => !open)}
                    aria-expanded={filterOpen}
                    aria-haspopup="dialog"
                    aria-label="Filter devices"
                    className={`flex h-full min-h-[2.5rem] items-center justify-center px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                      hasActiveLocationFilter
                        ? 'text-[var(--brand-primary,#007b83)]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Filter className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  </button>
                }
                onSearch={(query) => {
                  setSearchQuery(query);
                  setCurrentPage(1);
                }}
              />
              <FilterPopup
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                appliedValues={appliedLocation}
                onApply={(values) => {
                  setAppliedLocation(values);
                  setCurrentPage(1);
                }}
                onReset={() => {
                  setAppliedLocation(DEFAULT_APPLIED_LOCATION);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <Table
          data={data}
          loading={loading}
          columns={columns}
          compact
          keyExtractor={(item, idx) =>
            `${item.device_details_id || item.device_id || 'row'}-${idx}`
          }
        />

        <div className="px-3 py-3 md:px-6 md:py-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(Math.min(totalPages, Math.max(1, page)))}
          />
        </div>
      </div>

      <DeviceDetailModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </div>
  );
};

export default DeviceInventory;
