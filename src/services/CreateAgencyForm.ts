import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

export type AgencyType = {
  id: number | string;
  name: string;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type GroupAgency = {
  id: number | string;
  name: string;
  slug?: string | null;
  description?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type AgencyClient = {
  id: number | string;
  name: string;
  slug?: string | null;
  description?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

const ENDPOINTS = {
  LIST: '/agency-types',
  DETAIL: (id: string | number) => `/agency-types/${id}`,
  GROUP_AGENCIES: {
    // The backend exposes agencies under `/agencies` (not `agency-groups`).
    // Using the correct route fixes creation failures where requests hit the wrong endpoint.
    LIST: '/agencies',
    DETAIL: (id: string | number) => `/agencies/${id}`,
    CREATE: '/agencies',
    UPDATE: (id: string | number) => `/agencies/${id}`,
    DELETE: (id: string | number) => `/agencies/${id}`,
  },
  AGENCY_CLIENTS: {
    // backend exposes a dedicated list route for brands
    LIST: '/brands/list', // clients mapped to brands; use `/brands/list` for full list
    DETAIL: (id: string | number) => `/brands/${id}`,
    CREATE: '/brands',
    UPDATE: (id: string | number) => `/brands/${id}`,
    DELETE: (id: string | number) => `/brands/${id}`,
  },
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  // resp is ApiResponse<T>
  if (!res || !res.success) {
    const message = (res && (res.message || 'Request failed')) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  return res.data as T;
}

export async function listAgencyTypes(): Promise<AgencyType[]> {
  const res = await apiClient.get<AgencyType[]>(ENDPOINTS.LIST);
  const items = await handleResponse<AgencyType[]>(res);
  // Normalize common shape just in case API differs
  return items.map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    slug: it.slug ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));
}

export async function getAgencyType(id: string | number): Promise<AgencyType> {
  const res = await apiClient.get<AgencyType>(ENDPOINTS.DETAIL(id));
  return handleResponse<AgencyType>(res);
}

// Group Agency API Functions
export async function listGroupAgencies(): Promise<GroupAgency[]> {
  const res = await apiClient.get<GroupAgency[]>(ENDPOINTS.GROUP_AGENCIES.LIST);
  const items = await handleResponse<GroupAgency[]>(res);
  return items.map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? '',
    slug: it.slug ?? null,
    description: it.description ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));
}

export async function getGroupAgency(id: string | number): Promise<GroupAgency> {
  const res = await apiClient.get<GroupAgency>(ENDPOINTS.GROUP_AGENCIES.DETAIL(id));
  return handleResponse<GroupAgency>(res);
}

// Accept either JSON-compatible payload or FormData (multipart) to support
// backends that expect form-data arrays (e.g. name[], type[], client[0][]).
export async function createGroupAgency(payload: any): Promise<GroupAgency> {
  const res = await apiClient.post<GroupAgency>(ENDPOINTS.GROUP_AGENCIES.CREATE, payload);
  return handleResponse<GroupAgency>(res);
}

export async function updateGroupAgency(id: string | number, payload: Partial<GroupAgency>): Promise<GroupAgency> {
  const res = await apiClient.put<GroupAgency>(ENDPOINTS.GROUP_AGENCIES.UPDATE(id), payload);
  return handleResponse<GroupAgency>(res);
}

export async function deleteGroupAgency(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.GROUP_AGENCIES.DELETE(id));
  await handleResponse<unknown>(res);
}

// Agency Client (Brand) API Functions
export async function listAgencyClients(): Promise<AgencyClient[]> {
  const res = await apiClient.get<AgencyClient[]>(ENDPOINTS.AGENCY_CLIENTS.LIST);
  const items = await handleResponse<AgencyClient[]>(res);
  return items.map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? '',
    slug: it.slug ?? null,
    description: it.description ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));
}

export async function getAgencyClient(id: string | number): Promise<AgencyClient> {
  const res = await apiClient.get<AgencyClient>(ENDPOINTS.AGENCY_CLIENTS.DETAIL(id));
  return handleResponse<AgencyClient>(res);
}

export async function createAgencyClient(payload: Partial<AgencyClient>): Promise<AgencyClient> {
  const res = await apiClient.post<AgencyClient>(ENDPOINTS.AGENCY_CLIENTS.CREATE, payload);
  return handleResponse<AgencyClient>(res);
}

export async function updateAgencyClient(id: string | number, payload: Partial<AgencyClient>): Promise<AgencyClient> {
  const res = await apiClient.put<AgencyClient>(ENDPOINTS.AGENCY_CLIENTS.UPDATE(id), payload);
  return handleResponse<AgencyClient>(res);
}

export async function deleteAgencyClient(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.AGENCY_CLIENTS.DELETE(id));
  await handleResponse<unknown>(res);
}
