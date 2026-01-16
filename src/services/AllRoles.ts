import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface Role {
  id: string;
  name: string;
  description?: string;
  _realId?: string; // Store the actual backend ID
}

const ENDPOINTS = {
  LIST: '/roles',
  DETAIL: (id: string) => `/roles/${id}`,
  CREATE: '/roles',
  UPDATE: (id: string) => `/roles/${id}`,
  DELETE: (id: string) => `/roles/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {};
    throw error;
  }
  return res.data as T;
}

export type RoleListResponse = {
  data: Role[];
  meta?: any;
};

export async function listRoles(page = 1, perPage = 10, search?: string): Promise<RoleListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<any>(`${ENDPOINTS.LIST}?${params.toString()}`);
  const items = (res.data || []).map((it: any, idx: number) => {
    const realId = it.id; // Store the actual backend ID
    const rawId = it.id ?? idx + 1;
    // If rawId is numeric, format as #RL001, else use the string prefixed if not already
    let idStr = String(rawId);
    if (/^\d+$/.test(idStr)) {
      idStr = `#RL${String(Number(idStr)).padStart(3, '0')}`;
    } else if (!idStr.startsWith('#')) {
      idStr = `#RL${idStr}`;
    }

    const name = it.name ?? it.role ?? it.title ?? '';
    const description = it.description ?? it.desc ?? '';

    return {
      id: String(idStr),
      _realId: String(realId), // Store the real ID
      name,
      description,
    } as Role;
  });

  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function getRole(id: string): Promise<Role> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(cleanId));
  return handleResponse<Role>(res);
}

export async function createRole(payload: Partial<Role>): Promise<Role> {
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  return handleResponse<Role>(res);
}

export async function updateRole(id: string, payload: Partial<Role>): Promise<Role> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), payload);
  return handleResponse<Role>(res);
}

export async function deleteRole(id: string): Promise<void> {
  // If the id has the real ID stored, use it; otherwise clean it
  let apiId = id;
  // This will be called with the display id, so we need to extract the numeric part
  const digits = String(id).replace(/\D/g, '');
  if (digits) {
    apiId = String(Number(digits)); // Remove padding (001 -> 1)
  }
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(apiId));
  await handleResponse<unknown>(res);
}
