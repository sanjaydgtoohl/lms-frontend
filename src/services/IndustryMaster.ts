import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

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

const ENDPOINTS = {
  LIST: '/industries',
  DETAIL: (id: string | number) => `/industries/${id}`,
  CREATE: '/industries',
  UPDATE: (id: string | number) => `/industries/${id}`,
  DELETE: (id: string | number) => `/industries/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    // Attach original response so callers (UI) can extract field-level validation messages
    (error as any).responseData = res;
    try { handleApiError(error, false); } catch {}
    throw error;
  }
  return res.data as T;
}


export type IndustryListResponse = {
  data: Industry[];
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

export async function listIndustries(page = 1, perPage = 10): Promise<IndustryListResponse> {
  const res = await apiClient.get<Industry[]>(`${ENDPOINTS.LIST}?page=${page}&per_page=${perPage}`);
  return {
    data: res.data || [],
    meta: (res as any).meta || {},
  };
}

export async function getIndustry(id: string | number): Promise<Industry> {
  const res = await apiClient.get<Industry>(ENDPOINTS.DETAIL(id));
  return handleResponse<Industry>(res);
}

export async function createIndustry(payload: Partial<Industry>): Promise<Industry> {
  const res = await apiClient.post<Industry>(ENDPOINTS.CREATE, payload);
  return handleResponse<Industry>(res);
}

export async function updateIndustry(id: string | number, payload: Partial<Industry>): Promise<Industry> {
  const res = await apiClient.put<Industry>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<Industry>(res);
}

export async function deleteIndustry(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}


