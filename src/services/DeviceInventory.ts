
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
  params: ListDeviceInventoryParams,
  options?: { includePagination?: boolean }
): Record<string, string | number> {
  const includePagination = options?.includePagination ?? true;
  const query: Record<string, string | number> = {};

  if (includePagination) {
    query.page = params.page ?? 1;
    query.per_page = params.per_page ?? 10;
  }

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

export type DeviceInventoryFilterParams = Omit<ListDeviceInventoryParams, 'page' | 'per_page'>;

export type DeviceInventoryExportKind = 'excel' | 'ppt';

/** Build a filter-only query string shared by Excel and PPT export endpoints. */
export function buildDeviceInventoryExportQuery(
  filters: DeviceInventoryFilterParams = {}
): string {
  const params = buildInventoryQueryParams(
    { ...filters, page: 1, per_page: 10 },
    { includePagination: false }
  );
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** Dedicated export API path for the current filters (Excel or PPT). */
export function buildDeviceInventoryExportPath(
  filters: DeviceInventoryFilterParams,
  kind: DeviceInventoryExportKind
): string {
  const suffix = buildDeviceInventoryExportQuery(filters);
  return kind === 'excel'
    ? `/inventory/export/excel${suffix}`
    : `/inventory/export/ppt${suffix}`;
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
    ppt_download_url: body.ppt_download_url ? String(body.ppt_download_url) : null,
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

export type FetchAllDeviceInventoryProgress = {
  loaded: number;
  total: number;
  page: number;
  pageSize: number;
};

export type FetchAllDeviceInventoryOptions = {
  onProgress?: (progress: FetchAllDeviceInventoryProgress) => void;
};

/** Fetch every page for the given filters (PPT export and other full exports). */
export async function fetchAllDeviceInventoryRows(
  filters: Omit<ListDeviceInventoryParams, 'page' | 'per_page'>,
  options: FetchAllDeviceInventoryOptions = {}
): Promise<DeviceData[]> {
  const { onProgress } = options;
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
    const reportedTotal = Number(res.total_records || 0);
    total = reportedTotal > 0 ? reportedTotal : all.length + rows.length;
    all = all.concat(rows);

    onProgress?.({
      loaded: all.length,
      total,
      page,
      pageSize: EXPORT_PAGE_SIZE,
    });

    if (rows.length === 0) break;
    if (rows.length < EXPORT_PAGE_SIZE && all.length >= total) break;
    page += 1;
    if (page > EXPORT_MAX_PAGES) break;
  }

  return all;
}

const PPT_FETCH_PAGE_SIZE = 100;

/**
 * Stream inventory pages without holding the full result set in memory.
 * Returns total rows processed.
 */
export async function forEachDeviceInventoryPage(
  filters: Omit<ListDeviceInventoryParams, 'page' | 'per_page'>,
  options: {
    pageSize?: number;
    onProgress?: (progress: FetchAllDeviceInventoryProgress) => void;
    onPageRows: (
      rows: DeviceData[],
      progress: FetchAllDeviceInventoryProgress
    ) => void | Promise<void>;
  }
): Promise<number> {
  const pageSize = options.pageSize ?? PPT_FETCH_PAGE_SIZE;
  const { onProgress, onPageRows } = options;
  let page = 1;
  let processed = 0;
  let total = Number.POSITIVE_INFINITY;

  while (processed < total) {
    const res = await listDeviceInventory({
      ...filters,
      page,
      per_page: pageSize,
    });
    const rows = Array.isArray(res.data) ? res.data : [];
    const reportedTotal = Number(res.total_records || 0);
    total = reportedTotal > 0 ? reportedTotal : processed + rows.length;
    processed += rows.length;

    const progress: FetchAllDeviceInventoryProgress = {
      loaded: processed,
      total,
      page,
      pageSize,
    };
    onProgress?.(progress);
    await onPageRows(rows, progress);

    if (rows.length === 0) break;
    if (rows.length < pageSize && processed >= total) break;
    page += 1;
    if (page > EXPORT_MAX_PAGES) break;
  }

  return processed;
}

function resolveSspDownloadPath(downloadUrl: string): string {
  const trimmed = downloadUrl.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed.replace(/^\/+/, '');
}

async function readExportErrorMessage(data: Blob, status?: number): Promise<string> {
  const text = await data.text();
  const trimmed = text.trim();
  const statusSuffix = status ? ` (${status})` : '';

  if (!trimmed) {
    return `Export failed${statusSuffix}.`;
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed) as { message?: string };
      return json.message || `Export failed${statusSuffix}.`;
    } catch {
      return `Export failed${statusSuffix}.`;
    }
  }

  if (trimmed.startsWith('<')) {
    return `Export failed${statusSuffix}. Please try again with narrower filters.`;
  }

  if (trimmed.startsWith('\u0089PNG') || trimmed.startsWith('PNG')) {
    return `Export failed${statusSuffix}. The server returned an unexpected image response.`;
  }

  if (trimmed.length > 240 || /[^\x09\x0A\x0D\x20-\x7E]/.test(trimmed.slice(0, 32))) {
    return `Export failed${statusSuffix}. The server returned an unexpected file response.`;
  }

  return trimmed;
}

function isSuccessfulExportBlob(contentType: string, blob: Blob): boolean {
  const type = contentType.toLowerCase();
  if (type.includes('application/json') || type.includes('text/html')) {
    return false;
  }

  return (
    type.includes('spreadsheet') ||
    type.includes('presentation') ||
    type.includes('octet-stream') ||
    type.includes('zip') ||
    blob.size > 0
  );
}

export async function downloadDeviceInventoryExport(
  downloadUrl: string,
  fallbackFilename: string
): Promise<{ notice?: string }> {
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
    return {};
  }

  try {
    const resp = await sspHttp.get(target, { responseType: 'blob' });
    const contentType = String(resp.headers?.['content-type'] ?? '');
    const blob = resp.data as Blob;

    if (!isSuccessfulExportBlob(contentType, blob)) {
      throw new Error(await readExportErrorMessage(blob, resp.status));
    }

    if (!blob || blob.size === 0) {
      throw new Error('Export file was empty.');
    }

    const filename =
      parseContentDispositionFilename(String(resp.headers?.['content-disposition'] ?? '')) ??
      (contentType.includes('presentation') || fallbackFilename.endsWith('.pptx')
        ? `Device_Inventory_Report_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pptx`
        : defaultDatedXlsxFilename('device-inventory'));

    downloadBlobFile(filename, blob);

    const notice = String(resp.headers?.['x-export-notice'] ?? '').trim();

    return notice ? { notice } : {};
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: Blob; status?: number; headers?: Record<string, string> };
      message?: string;
    };

    if (axiosError.response?.data instanceof Blob) {
      throw new Error(
        await readExportErrorMessage(axiosError.response.data, axiosError.response.status)
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(axiosError.message || 'Export failed.');
  }
}

/** Trigger Excel export for the current inventory filters (dedicated API). */
export async function exportDeviceInventoryExcelFile(
  filters: DeviceInventoryFilterParams
): Promise<void> {
  const path = buildDeviceInventoryExportPath(filters, 'excel');
  await downloadDeviceInventoryExport(path, 'device-inventory.xlsx');
}

/** Trigger PPT export for the current inventory filters (dedicated API). */
export async function exportDeviceInventoryPptFile(
  filters: DeviceInventoryFilterParams
): Promise<void> {
  const path = buildDeviceInventoryExportPath(filters, 'ppt');
  await downloadDeviceInventoryExport(path, 'device-inventory.pptx');
}
