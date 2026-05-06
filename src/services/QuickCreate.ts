import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

export type QuickOption = {
  id: string;
  name: string;
};

const toList = <T = any>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const toOption = (item: any): QuickOption => ({
  id: String(item?.id ?? ''),
  name: String(item?.name ?? ''),
});

async function getList(endpoint: string): Promise<QuickOption[]> {
  try {
    const res = await apiClient.get<any>(endpoint);
    return toList<any>(res?.data).map(toOption).filter((it) => it.id && it.name);
  } catch (error) {
    handleApiError(error, false);
    throw error;
  }
}

async function listSubSourcesBySource(sourceId: string | number): Promise<QuickOption[]> {
  const selectedSourceId = String(sourceId);
  try {
    const res = await apiClient.get<any>('/lead-sub-sources/list');
    const rows = toList<any>(res?.data);
    const toSourceId = (item: any): string => String(
      item?.lead_source_id ??
      item?.source_id ??
      item?.leadSourceId ??
      item?.lead_source?.id ??
      item?.source?.id ??
      item?.lead_source ??
      item?.source ??
      ''
    );

    const mappedAll = rows.map(toOption).filter((it) => it.id && it.name);
    const mappedBySource = rows
      .filter((item: any) => toSourceId(item) === selectedSourceId)
      .map(toOption)
      .filter((it) => it.id && it.name);

    // Prefer strict source-based list; fallback to all when API omits source mapping.
    return mappedBySource.length > 0 ? mappedBySource : mappedAll;
  } catch (error) {
    handleApiError(error, false);
    throw error;
  }
}

async function createItem(endpoint: string, payload: Record<string, any>): Promise<QuickOption> {
  try {
    const res = await apiClient.post<any>(endpoint, payload);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to create item');
    }
    return toOption(res.data);
  } catch (error) {
    handleApiError(error, false);
    throw error;
  }
}

export const quickCreateApi = {
  listLeadTypes: () => getList('/lead-types/list'),
  createLeadType: (name: string) => createItem('/lead-types', { name }),
  listDepartments: () => getList('/departments?page=1&per_page=1000'),
  createDepartment: (name: string) => createItem('/departments', { name }),
  listBrands: () => getList('/brands/list'),
  createBrand: (name: string) => createItem('/brands/name', { name }),
  listSources: () => getList('/lead-sources'),
  createSource: (name: string) => createItem('/lead-sources', { name }),
  listSubSourcesBySource,
  createSubSource: (sourceId: string | number, name: string) =>
    createItem('/lead-sub-sources/name', {
      lead_source_id: sourceId,
      name,
      status: 1,
    }),
  createSubSourceStandalone: (name: string) =>
    createItem('/lead-sub-sources/name', {
      name,
      status: 1,
    }),
  createAgency: (name: string) => createItem('/agencies/name', { name }),
};

