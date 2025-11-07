import { API_BASE_URL } from '../constants';
import { handleApiError } from '../utils/apiErrorHandler';

export type Designation = {
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
  LIST: '/designations',
  DETAIL: (id: string | number) => `/designations/${id}`,
  CREATE: '/designations',
  UPDATE: (id: string | number) => `/designations/${id}`,
  DELETE: (id: string | number) => `/designations/${id}`,
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
    const error = new Error((json && (json.message || json.error)) || 'Request failed');
    (error as any).statusCode = res.status;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export type DesignationListResponse = {
  data: Designation[];
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

export async function listDesignations(page = 1, perPage = 10): Promise<DesignationListResponse> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error((json && (json.message || json.error)) || 'Request failed');
    (error as any).statusCode = res.status;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }
  return {
    data: json.data || [],
    meta: json.meta || {},
  };
}

export async function getDesignation(id: string | number): Promise<Designation> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<Designation>(res);
}

export async function createDesignation(payload: Partial<Designation>): Promise<Designation> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Designation>(res);
}

export async function updateDesignation(id: string | number, payload: Partial<Designation>): Promise<Designation> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Designation>(res);
}

export async function deleteDesignation(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}

