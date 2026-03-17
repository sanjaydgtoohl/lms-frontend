import React, { useState } from 'react';
import Pagination from '../../components/ui/Pagination';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import MasterHeader from '../../components/ui/MasterHeader';
import { useNavigate } from 'react-router-dom';
import dummyDeviceData from '../../services/DeviceInventory';

export interface DeviceData {
  device_details_id: string;
  device_id: string;
  screen_id: string;
  device_name: string;
  main_category_name: string;
  category_name: string;
  sub_category_name: string;
  location_type: string;
  screen_location: string;
  latitude: string;
  longitude: string;
  width?: string;
  height?: string;
  sq_ft?: string;
  screen_size: string;
  total_sq_ft?: string;
  elevation?: string;
  tilt_degree?: string;
  orientation?: string;
  resolution: string;
  aspect_ratio: string;
  monthly_footfall: string;
  languages?: string;
  state: string;
  city: string;
  zone?: string;
  sub_zone_area?: string;
  pincode?: string;
  arterial_route?: string;
  stretch?: string;
  property?: string;
  touchpoint?: string;
  traffic_direction?: string;
  mode_of_media?: string;
  illumination?: string;
  old_device_image: string;
  device_image: string;
  aws_device_image?: string;
  country: string;
  on_field_screen_count: string;
  monday_start_time: string;
  monday_end_time: string;
  tuesday_start_time: string;
  tuesday_end_time: string;
  wednesday_start_time: string;
  wednesday_end_time: string;
  thursday_start_time: string;
  thursday_end_time: string;
  friday_start_time: string;
  friday_end_time: string;
  saturday_start_time: string;
  saturday_end_time: string;
  sunday_start_time: string;
  sunday_end_time: string;
  daily_impression: string;
  cost_for_impression: string;
  cpi_cost: string;
  facing?: string;
  min_operating_price: string;
  screen_type?: string;
  loop_timing: string;
  slot_timing: string;
  slot_details: string;
  spots_day?: string;
  slot_per_month: string;
  daily_hours_of_loop: string;
  cost_per_spot: string;
  cost_per_audience_imp: string;
  max_traffic?: string;
  status: string;
  default_date: string;
  update_date: string;
  email_id: string;
  second_email_id?: string;
  first_name: string;
  last_name: string;
  admin_flag: string;
  company_name: string;
  user_password: string;
  device_limit: string;
  expiry_date: string;
  manager_name: string;
  access_type: string;
  markup_applicable: string;
  markup_type?: string;
  markup_value?: string;
  code: string;
}

const DeviceInventory: React.FC = () => {
  const navigate = useNavigate();
  const [data] = useState<DeviceData[]>(dummyDeviceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const filteredData = data.filter((item) =>
    item.device_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={() => navigate('/add-device')}
        createButtonLabel="Add Device"
        showBreadcrumb={true}
        showCreateButton={true}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-3 md:px-6 py-3 md:py-4 flex flex-row items-center justify-between gap-3 flex-wrap md:flex-nowrap border-b border-gray-200">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 flex-shrink-0">Device Inventory</h2>
          <SearchBar
            delay={300}
            onSearch={(q: string) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
          />
        </div>

        <Table
          data={paginatedData}
          columns={[
            { key: 'device_details_id', header: 'Device Details ID', render: (item) => item.device_details_id },
            { key: 'device_id', header: 'Device ID', render: (item) => item.device_id },
            { key: 'screen_id', header: 'Screen ID', render: (item) => item.screen_id },
            { key: 'device_name', header: 'Device Name', render: (item) => item.device_name },
            { key: 'main_category_name', header: 'Main Category', render: (item) => item.main_category_name },
            { key: 'category_name', header: 'Category', render: (item) => item.category_name },
            { key: 'sub_category_name', header: 'Sub Category', render: (item) => item.sub_category_name },
            { key: 'location_type', header: 'Location Type', render: (item) => item.location_type },
            { key: 'screen_location', header: 'Screen Location', render: (item) => item.screen_location },
            { key: 'latitude', header: 'Latitude', render: (item) => item.latitude },
            { key: 'longitude', header: 'Longitude', render: (item) => item.longitude },
            { key: 'width', header: 'Width', render: (item) => item.width || '' },
            { key: 'height', header: 'Height', render: (item) => item.height || '' },
            { key: 'sq_ft', header: 'Square Feet', render: (item) => item.sq_ft || '' },
            { key: 'screen_size', header: 'Screen Size', render: (item) => item.screen_size },
            { key: 'total_sq_ft', header: 'Total Square Feet', render: (item) => item.total_sq_ft || '' },
            { key: 'elevation', header: 'Elevation', render: (item) => item.elevation || '' },
            { key: 'tilt_degree', header: 'Tilt Degree', render: (item) => item.tilt_degree || '' },
            { key: 'orientation', header: 'Orientation', render: (item) => item.orientation || '' },
            { key: 'resolution', header: 'Resolution', render: (item) => item.resolution },
            { key: 'aspect_ratio', header: 'Aspect Ratio', render: (item) => item.aspect_ratio },
            { key: 'monthly_footfall', header: 'Monthly Footfall', render: (item) => item.monthly_footfall },
            { key: 'languages', header: 'Languages', render: (item) => item.languages || '' },
            { key: 'state', header: 'State', render: (item) => item.state },
            { key: 'city', header: 'City', render: (item) => item.city },
            { key: 'zone', header: 'Zone', render: (item) => item.zone || '' },
            { key: 'sub_zone_area', header: 'Sub Zone Area', render: (item) => item.sub_zone_area || '' },
            { key: 'pincode', header: 'Pincode', render: (item) => item.pincode || '' },
            { key: 'arterial_route', header: 'Arterial Route', render: (item) => item.arterial_route || '' },
            { key: 'stretch', header: 'Stretch', render: (item) => item.stretch || '' },
            { key: 'property', header: 'Property', render: (item) => item.property || '' },
            { key: 'touchpoint', header: 'Touchpoint', render: (item) => item.touchpoint || '' },
            { key: 'traffic_direction', header: 'Traffic Direction', render: (item) => item.traffic_direction || '' },
            { key: 'mode_of_media', header: 'Mode of Media', render: (item) => item.mode_of_media || '' },
            { key: 'illumination', header: 'Illumination', render: (item) => item.illumination || '' },
            { key: 'old_device_image', header: 'Old Device Image', render: (item) => item.old_device_image },
            { key: 'device_image', header: 'Device Image', render: (item) => (
              <img
                src={item.device_image}
                alt={item.device_name}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
            ) },
            { key: 'aws_device_image', header: 'AWS Device Image', render: (item) => item.aws_device_image || '' },
            { key: 'country', header: 'Country', render: (item) => item.country },
            { key: 'on_field_screen_count', header: 'On Field Screen Count', render: (item) => item.on_field_screen_count },
            { key: 'monday_start_time', header: 'Monday Start Time', render: (item) => item.monday_start_time },
            { key: 'monday_end_time', header: 'Monday End Time', render: (item) => item.monday_end_time },
            { key: 'tuesday_start_time', header: 'Tuesday Start Time', render: (item) => item.tuesday_start_time },
            { key: 'tuesday_end_time', header: 'Tuesday End Time', render: (item) => item.tuesday_end_time },
            { key: 'wednesday_start_time', header: 'Wednesday Start Time', render: (item) => item.wednesday_start_time },
            { key: 'wednesday_end_time', header: 'Wednesday End Time', render: (item) => item.wednesday_end_time },
            { key: 'thursday_start_time', header: 'Thursday Start Time', render: (item) => item.thursday_start_time },
            { key: 'thursday_end_time', header: 'Thursday End Time', render: (item) => item.thursday_end_time },
            { key: 'friday_start_time', header: 'Friday Start Time', render: (item) => item.friday_start_time },
            { key: 'friday_end_time', header: 'Friday End Time', render: (item) => item.friday_end_time },
            { key: 'saturday_start_time', header: 'Saturday Start Time', render: (item) => item.saturday_start_time },
            { key: 'saturday_end_time', header: 'Saturday End Time', render: (item) => item.saturday_end_time },
            { key: 'sunday_start_time', header: 'Sunday Start Time', render: (item) => item.sunday_start_time },
            { key: 'sunday_end_time', header: 'Sunday End Time', render: (item) => item.sunday_end_time },
            { key: 'daily_impression', header: 'Daily Impression', render: (item) => item.daily_impression },
            { key: 'cost_for_impression', header: 'Cost for Impression', render: (item) => item.cost_for_impression },
            { key: 'cpi_cost', header: 'CPI Cost', render: (item) => item.cpi_cost },
            { key: 'facing', header: 'Facing', render: (item) => item.facing || '' },
            { key: 'min_operating_price', header: 'Min Operating Price', render: (item) => item.min_operating_price },
            { key: 'screen_type', header: 'Screen Type', render: (item) => item.screen_type || '' },
            { key: 'loop_timing', header: 'Loop Timing', render: (item) => item.loop_timing },
            { key: 'slot_timing', header: 'Slot Timing', render: (item) => item.slot_timing },
            { key: 'slot_details', header: 'Slot Details', render: (item) => item.slot_details },
            { key: 'spots_day', header: 'Spots Day', render: (item) => item.spots_day || '' },
            { key: 'slot_per_month', header: 'Slot Per Month', render: (item) => item.slot_per_month },
            { key: 'daily_hours_of_loop', header: 'Daily Hours of Loop', render: (item) => item.daily_hours_of_loop },
            { key: 'cost_per_spot', header: 'Cost Per Spot', render: (item) => item.cost_per_spot },
            { key: 'cost_per_audience_imp', header: 'Cost Per Audience Impression', render: (item) => item.cost_per_audience_imp },
            { key: 'max_traffic', header: 'Max Traffic', render: (item) => item.max_traffic || '' },
            { key: 'status', header: 'Status', render: (item) => item.status },
            { key: 'default_date', header: 'Default Date', render: (item) => item.default_date },
            { key: 'update_date', header: 'Update Date', render: (item) => item.update_date },
            { key: 'email_id', header: 'Email ID', render: (item) => item.email_id },
            { key: 'second_email_id', header: 'Second Email ID', render: (item) => item.second_email_id || '' },
            { key: 'first_name', header: 'First Name', render: (item) => item.first_name },
            { key: 'last_name', header: 'Last Name', render: (item) => item.last_name },
            { key: 'admin_flag', header: 'Admin Flag', render: (item) => item.admin_flag },
            { key: 'company_name', header: 'Company Name', render: (item) => item.company_name },
            { key: 'user_password', header: 'User Password', render: (item) => item.user_password },
            { key: 'device_limit', header: 'Device Limit', render: (item) => item.device_limit },
            { key: 'expiry_date', header: 'Expiry Date', render: (item) => item.expiry_date },
            { key: 'manager_name', header: 'Manager Name', render: (item) => item.manager_name },
            { key: 'access_type', header: 'Access Type', render: (item) => item.access_type },
            { key: 'markup_applicable', header: 'Markup Applicable', render: (item) => item.markup_applicable },
            { key: 'markup_type', header: 'Markup Type', render: (item) => item.markup_type || '' },
            { key: 'markup_value', header: 'Markup Value', render: (item) => item.markup_value || '' },
            { key: 'code', header: 'Code', render: (item) => item.code },
          ]}
        />

        <div className="flex justify-between items-center mt-6 px-3 md:px-6 py-3 md:py-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          
        </div>
      </div>
    </div>
  );
};

export default DeviceInventory;