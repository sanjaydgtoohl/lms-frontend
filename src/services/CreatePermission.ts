import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface PermissionPayload {
  displayName: string;
  name: string;
  url?: string;
  parentPermission?: string | null;
  description: string;
  order?: string | number;
}

export interface PermissionDetail extends PermissionPayload {
  id: string;
  slug?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const ENDPOINTS = {
  CREATE: '/permissions',
  DETAIL: (id: string) => `/permissions/${id}`,
  UPDATE: (id: string) => `/permissions/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {};
    throw error;
  }
  return res.data as T;
}

/**
 * Create a new permission
 */
export async function createPermission(payload: PermissionPayload): Promise<PermissionDetail> {
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  return handleResponse<PermissionDetail>(res);
}

/**
 * Get permission by ID
 */
export async function getPermissionDetail(id: string): Promise<PermissionDetail> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(cleanId));
  return handleResponse<PermissionDetail>(res);
}

/**
 * Update an existing permission
 */
export async function updatePermission(id: string, payload: Partial<PermissionPayload>): Promise<PermissionDetail> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), payload);
  return handleResponse<PermissionDetail>(res);
}
