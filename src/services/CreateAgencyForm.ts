import { API_BASE_URL } from '../constants';
import { useUiStore } from '../store/ui';

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

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

const ENDPOINTS = {
  LIST: '/agency-types',
  DETAIL: (id: string | number) => `/agency-types/${id}`,
  GROUP_AGENCIES: {
    LIST: '/agency-groups',
    DETAIL: (id: string | number) => `/agency-groups/${id}`,
    CREATE: '/agency-groups',
    UPDATE: (id: string | number) => `/agency-groups/${id}`,
    DELETE: (id: string | number) => `/agency-groups/${id}`,
  },
  AGENCY_CLIENTS: {
    LIST: '/brands', // Assuming clients are brands in your API
    DETAIL: (id: string | number) => `/brands/${id}`,
    CREATE: '/brands',
    UPDATE: (id: string | number) => `/brands/${id}`,
    DELETE: (id: string | number) => `/brands/${id}`,
  },
} as const;

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
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export async function listAgencyTypes(): Promise<AgencyType[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<AgencyType>(res);
}

// Group Agency API Functions
export async function listGroupAgencies(): Promise<GroupAgency[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.GROUP_AGENCIES.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.GROUP_AGENCIES.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<GroupAgency>(res);
}

export async function createGroupAgency(payload: Partial<GroupAgency>): Promise<GroupAgency> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.GROUP_AGENCIES.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<GroupAgency>(res);
}

export async function updateGroupAgency(id: string | number, payload: Partial<GroupAgency>): Promise<GroupAgency> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.GROUP_AGENCIES.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<GroupAgency>(res);
}

export async function deleteGroupAgency(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.GROUP_AGENCIES.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}

// Agency Client (Brand) API Functions
export async function listAgencyClients(): Promise<AgencyClient[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENCY_CLIENTS.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENCY_CLIENTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<AgencyClient>(res);
}

export async function createAgencyClient(payload: Partial<AgencyClient>): Promise<AgencyClient> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENCY_CLIENTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AgencyClient>(res);
}

export async function updateAgencyClient(id: string | number, payload: Partial<AgencyClient>): Promise<AgencyClient> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENCY_CLIENTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<AgencyClient>(res);
}

export async function deleteAgencyClient(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.AGENCY_CLIENTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}
