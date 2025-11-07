import { API_BASE_URL } from '../constants';
import { useUiStore } from '../store/ui';

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

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (json && (json.message || json.error)) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  // Accept either envelope { success, data } or raw array/object
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    const message = (json && (json.message || json.error)) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  const items = (json.data || []).map((it: any, idx: number) => {
    const id = it.id ?? `LS${String(idx + 1).padStart(3, '0')}`;
    const source = it.lead_source ?? '';
    const subSource = it.name ?? '';
    const dateTime = it.created_at ?? '';
    return {
      id: String(id),
      source,
      subSource,
      dateTime,
    } as LeadSourceItem;
  });
  return {
    data: items,
    meta: json.meta || {},
  };
}

export async function getLeadSource(id: string): Promise<LeadSourceItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<LeadSourceItem>(res);
}

export async function createLeadSource(payload: Partial<LeadSourceItem>): Promise<LeadSourceItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadSourceItem>(res);
}

export async function updateLeadSource(id: string, payload: Partial<LeadSourceItem>): Promise<LeadSourceItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadSourceItem>(res);
}

export async function deleteLeadSource(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}

// Alias with clearer name for lead sub-source deletion
export async function deleteLeadSubSource(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(String(id))}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(String(id))}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadSourceItem>(res);
}


