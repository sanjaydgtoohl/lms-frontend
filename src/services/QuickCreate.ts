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
  id: String(
    item?.id ??
    item?.lead_sub_source_id ??
    item?.sub_source_id ??
    item?.value ??
    ''
  ),
  name: String(
    item?.name ??
    item?.sub_source ??
    item?.subSource ??
    item?.title ??
    item?.label ??
    ''
  ),
});

async function getList(endpoint: string): Promise<QuickOption[]> {
  try {
    const res = await apiClient.get<any>(endpoint);
    if (!res || res.success === false) {
      throw new Error(res?.message || 'Failed to fetch list');
    }
    return toList<any>(res?.data).map(toOption).filter((it) => it.id && it.name);
  } catch (error) {
    handleApiError(error, false);
    throw error;
  }
}

async function listSubSourcesBySource(sourceId: string | number): Promise<QuickOption[]> {
  const selectedSourceId = String(sourceId);
  try {
    const res = await apiClient.get<any>('/lead-sub-sources');
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

    // Prefer strict source-based list. Fall back to all only if payload has no source linkage fields at all.
    const hasSourceMapping = rows.some((item: any) => Boolean(toSourceId(item)));
    return mappedBySource.length > 0 ? mappedBySource : (hasSourceMapping ? [] : mappedAll);
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

async function createSubSourceForPreLead(sourceId: string | number, name: string): Promise<QuickOption> {
  const payload = {
    lead_source_id: sourceId,
    name,
    status: 1,
  };
  try {
    return await createItem('/lead-sub-sources', payload);
  } catch (error: any) {
    const status = Number(error?.response?.status ?? error?.status ?? 0);
    const message = String(
      error?.response?.data?.message ??
      error?.message ??
      ''
    ).toLowerCase();
    const isMethodNotAllowed =
      status === 405 ||
      status === 501 ||
      message.includes('method not allowed') ||
      message.includes('not implemented') ||
      message.includes('route not found');

    if (!isMethodNotAllowed) {
      throw error;
    }

    // Some environments expose custom create route
    return createItem('/lead-sub-sources/name', payload);
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
  listSourcesForPreLead: () => getList('/lead-sources/list'),
  createSource: (name: string) => createItem('/lead-sources', { name }),
  listSubSourcesBySource,
  listSubSourcesBySourceForPreLead: (sourceId: string | number) =>
    getList(`/lead-sub-sources/by-source/${String(sourceId)}`),
  createSubSource: (sourceId: string | number, name: string) =>
    createItem('/lead-sub-sources/name', {
      lead_source_id: sourceId,
      name,
      status: 1,
    }),
  createSubSourceForPreLead,
  createSubSourceStandalone: (name: string) =>
    createItem('/lead-sub-sources/name', {
      name,
      status: 1,
    }),
  createAgency: (name: string) => createItem('/agencies/name', { name }),
};

