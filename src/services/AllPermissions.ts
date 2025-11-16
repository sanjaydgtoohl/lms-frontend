import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface Permission {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

const ENDPOINTS = {
  LIST: '/permissions',
  DETAIL: (id: string) => `/permissions/${id}`,
  CREATE: '/permissions',
  UPDATE: (id: string) => `/permissions/${id}`,
  DELETE: (id: string) => `/permissions/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {};
    throw error;
  }
  return res.data as T;
}

export type PermissionListResponse = {
  data: Permission[];
  meta?: any;
};

export async function listPermissions(page = 1, perPage = 10, search?: string): Promise<PermissionListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<any>(`${ENDPOINTS.LIST}?${params.toString()}`);
  const items = (res.data || []).map((it: any, idx: number) => {
    // normalize fields returned by API
    const rawId = it.id ?? idx + 1;
    const id = `#PM${String(rawId).padStart(3, '0')}`; // match UI expected format
    const name = it.name ?? it.permission ?? '';
    const display_name = it.display_name ?? it.name ?? it.permission ?? '';
    const description = it.description ?? it.desc ?? '';

    return {
      id: String(id),
      name,
      display_name,
      description,
    } as Permission;
  });

  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function getPermission(id: string): Promise<Permission> {
  // remove leading # if present before sending to backend
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(cleanId));
  return handleResponse<Permission>(res);
}

export async function createPermission(payload: Partial<Permission>): Promise<Permission> {
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  return handleResponse<Permission>(res);
}

export async function updatePermission(id: string, payload: Partial<Permission>): Promise<Permission> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), payload);
  return handleResponse<Permission>(res);
}

export async function deletePermission(id: string): Promise<void> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(cleanId));
  await handleResponse<unknown>(res);
}
