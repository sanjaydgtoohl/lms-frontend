import { API_BASE_URL } from '../constants';
import { useUiStore } from '../store/ui';

export type Department = {
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
  LIST: '/departments',
  DETAIL: (id: string | number) => `/departments/${id}`,
  CREATE: '/departments',
  UPDATE: (id: string | number) => `/departments/${id}`,
  DELETE: (id: string | number) => `/departments/${id}`,
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
    // Push error to global UI store
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export type DepartmentListResponse = {
  data: Department[];
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

export async function listDepartments(page = 1, perPage = 10): Promise<DepartmentListResponse> {
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
  return {
    data: json.data || [],
    meta: json.meta || {},
  };
}

export async function getDepartment(id: string | number): Promise<Department> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<Department>(res);
}

export async function createDepartment(payload: Partial<Department>): Promise<Department> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Department>(res);
}

export async function updateDepartment(id: string | number, payload: Partial<Department>): Promise<Department> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Department>(res);
}

export async function deleteDepartment(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}