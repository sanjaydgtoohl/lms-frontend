import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface LeadSourceItem {
  id: string;
  source: string;
  subSource?: string;
  dateTime?: string;
}

// Infer a few common API wrappers without hard-coding endpoint constants yet
const ENDPOINTS = {
  // Use proxy in vite.config.ts to inject '/v1'
  LIST: '/lead-sub-sources',
  DETAIL: (id: string) => `/lead-sub-sources/${id}`,
  CREATE: '/lead-sub-sources',
  UPDATE: (id: string) => `/lead-sub-sources/${id}`,
  DELETE: (id: string) => `/lead-sub-sources/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {}
    throw error;
  }
  return res.data as T;
}


export type LeadSourceListResponse = {
  data: LeadSourceItem[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    }
  }
};

export async function listLeadSources(page = 1, perPage = 10): Promise<LeadSourceListResponse> {
  const res = await apiClient.get<LeadSourceItem[]>(`${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`);
  const items = (res.data || []).map((it: any, idx: number) => {
    const id = it.id ?? `LS${String(idx + 1).padStart(3, '0')}`;
    const source = it.lead_source ?? '';
    const subSource = it.name ?? '';
    const rawCreated = it.created_at ?? '';
    let dateTime = '';
    if (rawCreated) {
      // handle common API format like 'DD-MM-YYYY HH:mm:ss' -> convert to ISO
      const m = String(rawCreated).match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}:\d{2}:\d{2})$/);
      if (m) {
        const [, dd, mm, yyyy, time] = m;
        const iso = `${yyyy}-${mm}-${dd}T${time}`;
        const d = new Date(iso);
        dateTime = isNaN(d.getTime()) ? String(rawCreated) : d.toISOString();
      } else {
        const d = new Date(rawCreated);
        dateTime = isNaN(d.getTime()) ? String(rawCreated) : d.toISOString();
      }
    }
    return {
      id: String(id),
      source,
      subSource,
      dateTime,
    } as LeadSourceItem;
  });
  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function getLeadSource(id: string): Promise<LeadSourceItem> {
  const res = await apiClient.get<LeadSourceItem>(ENDPOINTS.DETAIL(id));
  return handleResponse<LeadSourceItem>(res);
}

export async function createLeadSource(payload: Partial<LeadSourceItem>): Promise<LeadSourceItem> {
  const res = await apiClient.post<LeadSourceItem>(ENDPOINTS.CREATE, payload);
  return handleResponse<LeadSourceItem>(res);
}

export async function updateLeadSource(id: string, payload: Partial<LeadSourceItem>): Promise<LeadSourceItem> {
  const res = await apiClient.put<LeadSourceItem>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<LeadSourceItem>(res);
}

export async function deleteLeadSource(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}

// Alias with clearer name for lead sub-source deletion
export async function deleteLeadSubSource(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(String(id)));
  await handleResponse<unknown>(res);
}

export type UpdateLeadSubSourcePayload = {
  name: string;
  description?: string | null;
  status?: string | number;
  lead_source_id: string | number;
};

export async function updateLeadSubSource(
  id: string | number,
  payload: UpdateLeadSubSourcePayload
): Promise<LeadSourceItem> {
  const res = await apiClient.put<LeadSourceItem>(ENDPOINTS.UPDATE(String(id)), payload);
  return handleResponse<LeadSourceItem>(res);
}

/**
 * Fetch lead sub-sources filtered by lead_source_id
 */
export async function listLeadSubSourcesBySourceId(
  sourceId: string | number,
  page = 1,
  perPage = 1000
): Promise<LeadSourceListResponse> {
  const res = await apiClient.get<LeadSourceItem[]>(
    `${ENDPOINTS.LIST}?lead_source_id=${sourceId}&page=${page}&per_page=${perPage}`
  );
  const items = (res.data || []).map((it: any, idx: number) => {
    const id = it.id ?? `LSS${String(idx + 1).padStart(3, '0')}`;
    const source = it.lead_source ?? '';
    const subSource = it.name ?? '';
    const rawCreated = it.created_at ?? '';
    let dateTime = '';
    if (rawCreated) {
      const m = String(rawCreated).match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}:\d{2}:\d{2})$/);
      if (m) {
        const [, dd, mm, yyyy, time] = m;
        const iso = `${yyyy}-${mm}-${dd}T${time}`;
        const d = new Date(iso);
        dateTime = isNaN(d.getTime()) ? String(rawCreated) : d.toISOString();
      } else {
        const d = new Date(rawCreated);
        dateTime = isNaN(d.getTime()) ? String(rawCreated) : d.toISOString();
      }
    }
    return {
      id: String(id),
      source,
      subSource,
      dateTime,
    } as LeadSourceItem;
  });
  return {
    data: items,
    meta: (res as any).meta || {},
  };
}


