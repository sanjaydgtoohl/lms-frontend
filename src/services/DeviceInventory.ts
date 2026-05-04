
import { handleApiError } from '../utils/apiErrorHandler';
import sspHttp from './sspHttp';
import type {
  DeviceData,
  DeviceInventoryResponse,
  ListDeviceInventoryParams,
} from '../types/inventory.types';

export type { DeviceData };

const INVENTORY_ENDPOINT = '/inventory';

export async function listDeviceInventory(
  params: ListDeviceInventoryParams = {}
): Promise<DeviceInventoryResponse> {
  try {
    // Convert to POST request with body instead of GET with query params
    const requestBody = {
      page: params.page ?? 1,
      per_page: params.per_page ?? 10,
      ...(params.search ? { search: params.search } : {}),
      ...(params.state ? { state: params.state } : {}),
      ...(params.city ? { city: params.city } : {}),
      ...(params.country ? { country: params.country } : {}),
      ...(params.zone ? { zone: params.zone } : {}),
      ...(params.subZoneArea ? { sub_zone_area: params.subZoneArea } : {}),
      ...(params.pincode ? { pincode: params.pincode } : {}),
      ...(params.arterialRoute ? { arterial_route: params.arterialRoute } : {}),
      ...(params.modeOfMedia ? { mode_of_media: params.modeOfMedia } : {}),
      ...(params.publisher ? { publisher: params.publisher } : {}),
      ...(params.mainCategory ? { main_category_name: params.mainCategory } : {}),
      ...(params.categorySub ? { sub_category_name: params.categorySub } : {}),
      ...(params.category ? { category_name: params.category } : {}),
      ...(params.locationType ? { location_type: params.locationType } : {}),
      ...(params.orientation ? { orientation: params.orientation } : {}),
      ...(params.resolution ? { resolution: params.resolution } : {}),
      ...(params.screenLocation ? { screen_location: params.screenLocation } : {}),
      ...(params.stretch ? { stretch: params.stretch } : {}),
      ...(params.property ? { property: params.property } : {}),
    };

    const resp = await sspHttp.get(INVENTORY_ENDPOINT, { params: requestBody });

    const json = resp.data as DeviceInventoryResponse;
    if (!json || json.status !== true) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (resp as any)?.status;
      (error as any).responseData = json;
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
  filters: Omit<ListDeviceInventoryParams, 'page' | 'per_page'>
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