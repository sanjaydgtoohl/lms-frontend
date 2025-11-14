import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export type Agency = {
  id: number | string;
  name: string;
  slug?: string | null;
  is_parent?: number | null;
  agency_type?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  agency_group?: any | null;
};

const ENDPOINTS = {
  LIST: '/agencies',
  DETAIL: (id: string | number) => `/agencies/${id}`,
  CREATE: '/agencies',
  UPDATE: (id: string | number) => `/agencies/${id}`,
  DELETE: (id: string | number) => `/agencies/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  const json = res;
  if (!json || !json.success) {
    const message = (json as any)?.message || (json as any)?.error || 'Request failed';
    const error = new Error(message);
    (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }
  return json.data as T;
}

export type AgencyListResponse = {
  data: Agency[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
  };
};

export async function listAgencies(page = 1, perPage = 10): Promise<AgencyListResponse> {
  try {
    const res = await apiClient.get<Agency[]>(ENDPOINTS.LIST + `?page=${page}&per_page=${perPage}`);
    const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }
    return {
      data: json.data || [],
      meta: (json.meta as any) || {},
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getAgency(id: string | number): Promise<Agency> {
  const res = await apiClient.get<Agency>(ENDPOINTS.DETAIL(id));
  return handleResponse<Agency>(res);
}

export async function createAgency(payload: Partial<Agency>): Promise<Agency> {
  const res = await apiClient.post<Agency>(ENDPOINTS.CREATE, payload);
  return handleResponse<Agency>(res);
}

export async function updateAgency(id: string | number, payload: Partial<Agency>): Promise<Agency> {
  const res = await apiClient.put<Agency>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<Agency>(res);
}

export async function deleteAgency(id: string | number): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}
