import { API_BASE_URL } from '../constants';
import { useUiStore } from '../store/ui';

export type Industry = {
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
  LIST: '/industries',
  DETAIL: (id: string | number) => `/industries/${id}`,
  CREATE: '/industries',
  UPDATE: (id: string | number) => `/industries/${id}`,
  DELETE: (id: string | number) => `/industries/${id}`,
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

export async function listIndustries(): Promise<Industry[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<Industry[]>(res);
}

export async function getIndustry(id: string | number): Promise<Industry> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<Industry>(res);
}

export async function createIndustry(payload: Partial<Industry>): Promise<Industry> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Industry>(res);
}

export async function updateIndustry(id: string | number, payload: Partial<Industry>): Promise<Industry> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Industry>(res);
}

export async function deleteIndustry(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}


