import { handleApiError } from '../utils/apiErrorHandler';
import sspHttp from './sspHttp';

const INVENTORY_ENDPOINT = '/api/inventory';

export type MediaOwner = {
  user_id: string;
  name: string;
};

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
  width?: string | null;
  height?: string | null;
  sq_ft?: string | null;
  screen_size: string;
  total_sq_ft?: string | null;
  elevation?: string | null;
  tilt_degree?: string | null;
  orientation?: string | null;
  resolution: string;
  aspect_ratio: string;
  monthly_footfall: string;
  languages?: string | null;
  state: string;
  city: string;
  zone?: string | null;
  sub_zone_area?: string | null;
  pincode?: string | null;
  arterial_route?: string | null;
  stretch?: string | null;
  property?: string | null;
  touchpoint?: string | null;
  traffic_direction?: string | null;
  mode_of_media?: string | null;
  illumination?: string | null;
  old_device_image?: string | null;
  device_image?: string | null;
  aws_device_image?: string | null;
  country?: string | null;
  on_field_screen_count?: string | null;
  monday_start_time?: string | null;
  monday_end_time?: string | null;
  tuesday_start_time?: string | null;
  tuesday_end_time?: string | null;
  wednesday_start_time?: string | null;
  wednesday_end_time?: string | null;
  thursday_start_time?: string | null;
  thursday_end_time?: string | null;
  friday_start_time?: string | null;
  friday_end_time?: string | null;
  saturday_start_time?: string | null;
  saturday_end_time?: string | null;
  sunday_start_time?: string | null;
  sunday_end_time?: string | null;
  daily_impression?: string | null;
  cost_for_impression?: string | null;
  cpi_cost?: string | null;
  facing?: string | null;
  min_operating_price?: string | null;
  screen_type?: string | null;
  loop_timing?: string | null;
  slot_timing?: string | null;
  slot_details?: string | null;
  spots_day?: string | null;
  slot_per_month?: string | null;
  daily_hours_of_loop?: string | null;
  cost_per_spot?: string | null;
  cost_per_audience_imp?: string | null;
  max_traffic?: string | null;
  status?: string | null;
  default_date?: string | null;
  update_date?: string | null;
  email_id?: string | null;
  second_email_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  admin_flag?: string | null;
  company_name?: string | null;
  user_password?: string | null;
  device_limit?: string | null;
  expiry_date?: string | null;
  manager_name?: string | null;
  access_type?: string | null;
  markup_applicable?: string | null;
  markup_type?: string | null;
  markup_value?: string | null;
  code?: string | null;
  media_owner?: MediaOwner | null;
}

export type DeviceInventoryResponse = {
  status: boolean;
  message: string;
  total_records: number;
  current_page: number;
  per_page: number;
  data: DeviceData[];
};

export type ListDeviceInventoryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  state?: string;
  city?: string;
  country?: string;
};



export async function listDeviceInventory(
  params: ListDeviceInventoryParams = {}
): Promise<DeviceInventoryResponse> {
  try {
    const resp = await sspHttp.get(INVENTORY_ENDPOINT, {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        ...(params.search ? { search: params.search } : {}),
        ...(params.state ? { state: params.state } : {}),
        ...(params.city ? { city: params.city } : {}),
        ...(params.country ? { country: params.country } : {}),
      },
    });

    const json = resp.data as DeviceInventoryResponse;
    if (!json || json.status !== true) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (resp as any)?.status;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }

    return json;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

const EXPORT_PAGE_SIZE = 500;
const EXPORT_MAX_PAGES = 2000;

/** Fetch every page for the given filters (for CSV export). */
export async function fetchAllDeviceInventoryRows(
  filters: Pick<ListDeviceInventoryParams, 'search' | 'state' | 'city' | 'country'>
): Promise<DeviceData[]> {
  let page = 1;
  let all: DeviceData[] = [];
  let total = Number.POSITIVE_INFINITY;

  while (all.length < total) {
    const res = await listDeviceInventory({
      ...filters,
      page,
      per_page: EXPORT_PAGE_SIZE,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    total = Number(res.total_records || 0);
    all = all.concat(rows);
    if (rows.length === 0) break;
    page += 1;
    if (page > EXPORT_MAX_PAGES) break;
  }

  return all;
}