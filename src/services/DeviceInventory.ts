
import { handleApiError } from '../utils/apiErrorHandler';
import sspHttp from './sspHttp';
import type {
  DeviceData,
  DeviceInventoryResponse,
  ListDeviceInventoryParams,
} from '../types/inventory.types';

export type { DeviceData };

const INVENTORY_ENDPOINT = '/inventory';

function buildInventoryQueryParams(
  params: ListDeviceInventoryParams
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
  };

  const append = (key: string, value?: string) => {
    const trimmed = value?.trim();
    if (trimmed) query[key] = trimmed;
  };

  append('search', params.search);
  append('country', params.country);
  append('state', params.state);
  append('city', params.city);
  append('zone', params.zone);
  append('sub_zone_area', params.subZoneArea);
  append('pincode', params.pincode);
  append('arterial_route', params.arterialRoute);
  append('mode_of_media', params.modeOfMedia);
  append('publisher', params.publisher);
  append('main_category_name', params.mainCategory);
  append('sub_category_name', params.categorySub);
  append('category_name', params.category);
  append('location_type', params.locationType);
  append('orientation', params.orientation);
  append('resolution', params.resolution);
  append('screen_location', params.screenLocation);
  append('stretch', params.stretch);
  append('property', params.property);

  return query;
}

function normalizeInventoryResponse(json: unknown): DeviceInventoryResponse {
  const body = (json || {}) as Record<string, unknown>;
  const ok = body.status === true || body.success === true;

  if (!ok) {
    const message = String(body.message || body.error || 'Request failed');
    const error = new Error(message);
    (error as Error & { responseData?: unknown }).responseData = json;
    throw error;
  }

  const meta = (body.meta || {}) as Record<string, unknown>;
  const pagination = (meta.pagination || {}) as Record<string, unknown>;
  const rows = Array.isArray(body.data) ? (body.data as DeviceData[]) : [];

  return {
    status: true,
    message: String(body.message || ''),
    total_records: Number(
      body.total_records ?? pagination.total ?? meta.total ?? rows.length
    ),
    current_page: Number(body.current_page ?? pagination.page ?? 1),
    per_page: Number(body.per_page ?? pagination.limit ?? pagination.per_page ?? 10),
    data: rows,
  };
}

export async function listDeviceInventory(
  params: ListDeviceInventoryParams = {}
): Promise<DeviceInventoryResponse> {
  try {
    const resp = await sspHttp.get(INVENTORY_ENDPOINT, {
      params: buildInventoryQueryParams(params),
    });

    return normalizeInventoryResponse(resp.data);
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
