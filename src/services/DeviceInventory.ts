
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
    excel_download_url: body.excel_download_url ? String(body.excel_download_url) : null,
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

function resolveSspDownloadPath(downloadUrl: string): string {
  const trimmed = downloadUrl.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed.replace(/^\/+/, '');
}

/** Download an inventory export file from the SSP API using auth headers. */
export async function downloadDeviceInventoryExport(
  downloadUrl: string,
  fallbackFilename: string
): Promise<void> {
  const { downloadBlobFile, defaultDatedXlsxFilename, parseContentDispositionFilename } =
    await import('../utils/downloadFile');

  const target = resolveSspDownloadPath(downloadUrl);
  const isAbsolute = target.startsWith('http://') || target.startsWith('https://');

  if (isAbsolute) {
    const resp = await fetch(target);
    if (!resp.ok) {
      throw new Error(`Failed to download export (${resp.status})`);
    }
    const blob = await resp.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Export file was empty.');
    }
    const filename =
      parseContentDispositionFilename(resp.headers.get('content-disposition')) ??
      fallbackFilename;
    downloadBlobFile(filename, blob);
    return;
  }

  try {
    const resp = await sspHttp.get(target, { responseType: 'blob' });
    const contentType = String(resp.headers?.['content-type'] ?? '');

    if (contentType.includes('application/json')) {
      const text = await (resp.data as Blob).text();
      try {
        const json = JSON.parse(text) as { message?: string };
        throw new Error(json.message || 'Export failed.');
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== 'Export failed.') {
          throw parseError;
        }
        throw new Error(text || 'Export failed.');
      }
    }

    const blob = resp.data as Blob;
    if (!blob || blob.size === 0) {
      throw new Error('Export file was empty.');
    }

    const filename =
      parseContentDispositionFilename(String(resp.headers?.['content-disposition'] ?? '')) ??
      (contentType.includes('presentation') || fallbackFilename.endsWith('.pptx')
        ? `Device_Inventory_Report_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pptx`
        : defaultDatedXlsxFilename('device-inventory'));

    downloadBlobFile(filename, blob);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: Blob; status?: number; headers?: Record<string, string> };
    };

    if (axiosError.response?.data instanceof Blob) {
      const text = await axiosError.response.data.text();
      try {
        const json = JSON.parse(text) as { message?: string };
        throw new Error(json.message || `Export failed (${axiosError.response.status ?? ''})`.trim());
      } catch (parseError) {
        if (parseError instanceof Error && !parseError.message.startsWith('Export failed')) {
          throw parseError;
        }
      }
    }

    throw error;
  }
}
