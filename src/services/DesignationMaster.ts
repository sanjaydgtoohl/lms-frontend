import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

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

const ENDPOINTS = {
  LIST: '/designations',
  DETAIL: (id: string | number) => `/designations/${id}`,
  CREATE: '/designations',
  UPDATE: (id: string | number) => `/designations/${id}`,
  DELETE: (id: string | number) => `/designations/${id}`,
} as const;
async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    // Attach original response data so callers can extract field-level errors
    (error as any).responseData = res;
    try { handleApiError(error, false); } catch {}
    throw error;
  }
  return res.data as T;
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
  const res = await apiClient.get<Designation[]>(`${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`);
  return {
    data: res.data || [],
    meta: (res as any).meta || {},
  };
}

export async function getDesignation(id: string | number): Promise<Designation> {
  const res = await apiClient.get<Designation>(ENDPOINTS.DETAIL(id));
  return handleResponse<Designation>(res);
}

export async function createDesignation(payload: Partial<Designation>): Promise<Designation> {
  const res = await apiClient.post<Designation>(ENDPOINTS.CREATE, payload);
  return handleResponse<Designation>(res);
}

export async function updateDesignation(id: string | number, payload: Partial<Designation>): Promise<Designation> {
  const res = await apiClient.put<Designation>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<Designation>(res);
}

export async function deleteDesignation(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}

