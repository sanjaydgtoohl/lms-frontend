import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

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


const ENDPOINTS = {
  LIST: '/departments',
  DETAIL: (id: string | number) => `/departments/${id}`,
  CREATE: '/departments',
  UPDATE: (id: string | number) => `/departments/${id}`,
  DELETE: (id: string | number) => `/departments/${id}`,
} as const;

async function handleResponse<T>(res: any, showNotification = true): Promise<T> {
  if (!res || !res.success) {
    const err = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(err, showNotification); } catch {}
    throw err;
  }
  return res.data as T;
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
  const res = await apiClient.get<Department[]>(`${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`);
  return {
    data: res.data || [],
    meta: (res as any).meta || {},
  };
}

export async function getDepartment(id: string | number): Promise<Department> {
  const res = await apiClient.get<Department>(ENDPOINTS.DETAIL(id));
  return handleResponse<Department>(res);
}

export async function createDepartment(payload: Partial<Department>): Promise<Department> {
  const res = await apiClient.post<Department>(ENDPOINTS.CREATE, payload);
  // Suppress global notification for create so callers can handle validation errors inline
  return handleResponse<Department>(res, false);
}

export async function updateDepartment(id: string | number, payload: Partial<Department>): Promise<Department> {
  const res = await apiClient.put<Department>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<Department>(res);
}

export async function deleteDepartment(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}