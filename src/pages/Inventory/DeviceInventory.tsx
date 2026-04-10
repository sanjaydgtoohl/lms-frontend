import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import FilterPopup from '../../components/ui/FilterPopup';
import ExportCsvButton from '../../components/ui/ExportCsvButton';
import MasterHeader from '../../components/ui/MasterHeader';
import PPTExport from '../../components/ui/PPTExport';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllDeviceInventoryRows,
  listDeviceInventory,
  type DeviceData,
} from '../../services/DeviceInventory';
import { DEVICE_INVENTORY_CSV_COLUMNS } from './deviceInventoryCsv';

const DeviceInventory: React.FC = () => {
  const navigate = useNavigate();
  const filterAnchorRef = useRef<HTMLButtonElement>(null);
  const [data, setData] = useState<DeviceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedLocation, setAppliedLocation] = useState({ state: '', city: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasActiveLocationFilter = Boolean(appliedLocation.state.trim() || appliedLocation.city.trim());

  const exportFetchRows = useCallback(
    () =>
      fetchAllDeviceInventoryRows({
        search: searchQuery?.trim() ? searchQuery.trim() : undefined,
        state: appliedLocation.state.trim() || undefined,
        city: appliedLocation.city.trim() || undefined,
      }),
    [searchQuery, appliedLocation.state, appliedLocation.city]
  );

  const exportCurrentPageRows = useCallback(
    () => Promise.resolve(data),
    [data]
  );

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalItems / itemsPerPage);
    return pages > 0 ? pages : 1;
  }, [totalItems, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    const next = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(next);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listDeviceInventory({
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery?.trim() ? searchQuery.trim() : undefined,
          state: appliedLocation.state.trim() || undefined,
          city: appliedLocation.city.trim() || undefined,
        });
        if (!alive) return;
        setData(Array.isArray(res.data) ? res.data : []);
        setTotalItems(Number(res.total_records || 0));
      } catch {
        if (!alive) return;
        setData([]);
        setTotalItems(0);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentPage, itemsPerPage, searchQuery, appliedLocation.state, appliedLocation.city]);

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={() => navigate('/add-device')}
        createButtonLabel="Add Device"
        showBreadcrumb={true}
        showCreateButton={false}
        breadcrumbItems={[{ label: 'Device Inventory', path: '/inventory/device' }]}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-3 md:px-6 py-3 md:py-4 flex flex-row items-center justify-between gap-3 flex-wrap md:flex-nowrap border-b border-gray-200">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 flex-shrink-0">Device Inventory</h2>
          <div className="flex w-full min-w-0 items-center justify-end gap-2 sm:w-auto">
            <PPTExport fetchRows={exportCurrentPageRows} />
            <ExportCsvButton<DeviceData>
              fetchRows={exportFetchRows}
              columns={DEVICE_INVENTORY_CSV_COLUMNS.filter(col => col.key !== 'user_password')}
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
                  aria-label="Filter by state and city"
                  className={`flex h-full min-h-[2.5rem] items-center justify-center px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                    hasActiveLocationFilter
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Filter className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                </button>
              }
              onSearch={(q: string) => {
                setSearchQuery(q);
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
                setAppliedLocation({ state: '', city: '' });
                setCurrentPage(1);
              }}
              anchorRef={filterAnchorRef}
            />
            </div>
          </div>
        </div>

        <Table
          data={data}
          loading={loading}
          keyExtractor={(it: DeviceData, idx: number) => `${it.device_details_id || it.device_id || 'row'}-${idx}`}
          columns={[
            { key: 'device_details_id', header: 'device_details_id', render: (item) => item.device_details_id },
            { key: 'device_id', header: 'device_id', render: (item) => item.device_id },
            { key: 'screen_id', header: 'screen_id', render: (item) => item.screen_id },
            { key: 'device_name', header: 'device_name', render: (item) => item.device_name },
            { key: 'main_category_name', header: 'main_category_name', render: (item) => item.main_category_name },
            { key: 'category_name', header: 'category_name', render: (item) => item.category_name },
            { key: 'sub_category_name', header: 'sub_category_name', render: (item) => item.sub_category_name },
            { key: 'location_type', header: 'location_type', render: (item) => item.location_type },
            { key: 'screen_location', header: 'screen_location', render: (item) => item.screen_location },
            { key: 'latitude', header: 'latitude', render: (item) => item.latitude },
            { key: 'longitude', header: 'longitude', render: (item) => item.longitude },
            { key: 'width', header: 'width', render: (item) => item.width || '' },
            { key: 'height', header: 'height', render: (item) => item.height || '' },
            { key: 'sq_ft', header: 'sq_ft', render: (item) => item.sq_ft || '' },
            { key: 'screen_size', header: 'screen_size', render: (item) => item.screen_size },
            { key: 'total_sq_ft', header: 'total_sq_ft', render: (item) => item.total_sq_ft || '' },
            { key: 'elevation', header: 'elevation', render: (item) => item.elevation || '' },
            { key: 'tilt_degree', header: 'tilt_degree', render: (item) => item.tilt_degree || '' },
            { key: 'orientation', header: 'orientation', render: (item) => item.orientation || '' },
            { key: 'resolution', header: 'resolution', render: (item) => item.resolution },
            { key: 'aspect_ratio', header: 'aspect_ratio', render: (item) => item.aspect_ratio },
            { key: 'monthly_footfall', header: 'monthly_footfall', render: (item) => item.monthly_footfall },
            { key: 'languages', header: 'languages', render: (item) => item.languages || '' },
            { key: 'state', header: 'state', render: (item) => item.state },
            { key: 'city', header: 'city', render: (item) => item.city },
            { key: 'zone', header: 'zone', render: (item) => item.zone || '' },
            { key: 'sub_zone_area', header: 'sub_zone_area', render: (item) => item.sub_zone_area || '' },
            { key: 'pincode', header: 'pincode', render: (item) => item.pincode || '' },
            { key: 'arterial_route', header: 'arterial_route', render: (item) => item.arterial_route || '' },
            { key: 'stretch', header: 'stretch', render: (item) => item.stretch || '' },
            { key: 'property', header: 'property', render: (item) => item.property || '' },
            { key: 'touchpoint', header: 'touchpoint', render: (item) => item.touchpoint || '' },
            { key: 'traffic_direction', header: 'traffic_direction', render: (item) => item.traffic_direction || '' },
            { key: 'mode_of_media', header: 'mode_of_media', render: (item) => item.mode_of_media || '' },
            { key: 'illumination', header: 'illumination', render: (item) => item.illumination || '' },
            { key: 'old_device_image', header: 'Old Device Image', render: (item) => (
              <img
                src={item.old_device_image || undefined}
                alt="Old Device"
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
            ) },
            { key: 'device_image', header: 'Device Image', render: (item) => (
              <img
                src={item.device_image || undefined}
                alt="Device"
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
            ) },
            { key: 'aws_device_image', header: 'AWS Device Image', render: (item) => (
              <a href={item.aws_device_image || undefined} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.aws_device_image || undefined}
                  alt="AWS Device"
                  className="w-16 h-16 object-cover rounded-md border border-gray-200"
                />
              </a>
            ) },
            { key: 'country', header: 'Country', render: (item) => (
              <span className="text-sm text-gray-700">{item.country || 'N/A'}</span>
            ) },
            { key: 'on_field_screen_count', header: 'On Field Screen Count', render: (item) => (
              <span className="text-sm text-gray-700">{item.on_field_screen_count || 'N/A'}</span>
            ) },
            { key: 'monday_start_time', header: 'monday_start_time', render: (item) => item.monday_start_time || '' },
            { key: 'monday_end_time', header: 'monday_end_time', render: (item) => item.monday_end_time || '' },
            { key: 'tuesday_start_time', header: 'tuesday_start_time', render: (item) => item.tuesday_start_time || '' },
            { key: 'tuesday_end_time', header: 'tuesday_end_time', render: (item) => item.tuesday_end_time || '' },
            { key: 'wednesday_start_time', header: 'wednesday_start_time', render: (item) => item.wednesday_start_time || '' },
            { key: 'wednesday_end_time', header: 'wednesday_end_time', render: (item) => item.wednesday_end_time || '' },
            { key: 'thursday_start_time', header: 'thursday_start_time', render: (item) => item.thursday_start_time || '' },
            { key: 'thursday_end_time', header: 'thursday_end_time', render: (item) => item.thursday_end_time || '' },
            { key: 'friday_start_time', header: 'friday_start_time', render: (item) => item.friday_start_time || '' },
            { key: 'friday_end_time', header: 'friday_end_time', render: (item) => item.friday_end_time || '' },
            { key: 'saturday_start_time', header: 'saturday_start_time', render: (item) => item.saturday_start_time || '' },
            { key: 'saturday_end_time', header: 'saturday_end_time', render: (item) => item.saturday_end_time || '' },
            { key: 'sunday_start_time', header: 'sunday_start_time', render: (item) => item.sunday_start_time || '' },
            { key: 'sunday_end_time', header: 'sunday_end_time', render: (item) => item.sunday_end_time || '' },
            { key: 'daily_impression', header: 'daily_impression', render: (item) => item.daily_impression || '' },
            { key: 'cost_for_impression', header: 'cost_for_impression', render: (item) => item.cost_for_impression || '' },
            { key: 'cpi_cost', header: 'cpi_cost', render: (item) => item.cpi_cost || '' },
            { key: 'facing', header: 'facing', render: (item) => item.facing || '' },
            { key: 'min_operating_price', header: 'min_operating_price', render: (item) => item.min_operating_price || '' },
            { key: 'screen_type', header: 'screen_type', render: (item) => item.screen_type || '' },
            { key: 'loop_timing', header: 'loop_timing', render: (item) => item.loop_timing || '' },
            { key: 'slot_timing', header: 'slot_timing', render: (item) => item.slot_timing || '' },
            { key: 'slot_details', header: 'slot_details', render: (item) => item.slot_details || '' },
            { key: 'spots_day', header: 'spots_day', render: (item) => item.spots_day || '' },
            { key: 'slot_per_month', header: 'slot_per_month', render: (item) => item.slot_per_month || '' },
            { key: 'daily_hours_of_loop', header: 'daily_hours_of_loop', render: (item) => item.daily_hours_of_loop || '' },
            { key: 'cost_per_spot', header: 'cost_per_spot', render: (item) => item.cost_per_spot || '' },
            { key: 'cost_per_audience_imp', header: 'cost_per_audience_imp', render: (item) => item.cost_per_audience_imp || '' },
            { key: 'max_traffic', header: 'max_traffic', render: (item) => item.max_traffic || '' },
            { key: 'status', header: 'status', render: (item) => item.status || '' },
            { key: 'default_date', header: 'default_date', render: (item) => item.default_date || '' },
            { key: 'update_date', header: 'update_date', render: (item) => item.update_date || '' },
            { key: 'email_id', header: 'email_id', render: (item) => item.email_id || '' },
            { key: 'second_email_id', header: 'second_email_id', render: (item) => item.second_email_id || '' },
            { key: 'first_name', header: 'first_name', render: (item) => item.first_name || '' },
            { key: 'last_name', header: 'last_name', render: (item) => item.last_name || '' },
            { key: 'admin_flag', header: 'admin_flag', render: (item) => item.admin_flag || '' },
            { key: 'company_name', header: 'company_name', render: (item) => item.company_name || '' },
            { key: 'user_password', header: 'user_password', render: () => '••••••••' },
            { key: 'device_limit', header: 'device_limit', render: (item) => item.device_limit || '' },
            { key: 'expiry_date', header: 'expiry_date', render: (item) => item.expiry_date || '' },
            { key: 'manager_name', header: 'manager_name', render: (item) => item.manager_name || '' },
            { key: 'access_type', header: 'access_type', render: (item) => item.access_type || '' },
            { key: 'markup_applicable', header: 'markup_applicable', render: (item) => item.markup_applicable || '' },
            { key: 'markup_type', header: 'markup_type', render: (item) => item.markup_type || '' },
            { key: 'markup_value', header: 'markup_value', render: (item) => item.markup_value || '' },
            { key: 'code', header: 'code', render: (item) => item.code || '' },
            { key: 'media_owner', header: 'media_owner', render: (item) => item.media_owner?.name || '' },
          ]}
        />

        <div className="flex justify-between items-center mt-6 px-3 md:px-6 py-3 md:py-4">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          
        </div>
      </div>
    </div>
  );
};

export default DeviceInventory;