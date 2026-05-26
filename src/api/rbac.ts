import { ENDPOINTS } from '../constants/endpoints';
import { apiClient, assertSuccess, buildPaginationQuery, stripIdPrefix } from './client';
import type { ApiMeta } from '../types/common/api.types';

export interface Role {
  id: string;
  name: string;
  description?: string;
  _realId?: string;
}

export type RoleListResponse = {
  data: Role[];
  meta?: ApiMeta & Record<string, unknown>;
};

export interface Permission {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

export type PermissionListResponse = {
  data: Permission[];
  meta?: ApiMeta & Record<string, unknown>;
};

export async function listRoles(
  page = 1,
  perPage = 10,
  search?: string
): Promise<RoleListResponse> {
  const query = buildPaginationQuery(page, perPage, search?.trim() ? { search } : undefined);
  const res = await apiClient.get<Record<string, unknown>[]>(`${ENDPOINTS.ROLES.LIST}${query}`);
  const items = (res.data || []).map((it, idx) => {
    const realId = it.id;
    const rawId = it.id ?? idx + 1;
    let idStr = String(rawId);
    if (/^\d+$/.test(idStr)) {
      idStr = `#RL${String(Number(idStr)).padStart(3, '0')}`;
    } else if (!idStr.startsWith('#')) {
      idStr = `#RL${idStr}`;
    }
    return {
      id: idStr,
      _realId: String(realId),
      name: String(it.name ?? it.role ?? it.title ?? ''),
      description: String(it.description ?? it.desc ?? ''),
    } as Role;
  });
  return { data: items, meta: res.meta };
}

export async function getRole(id: string): Promise<Role> {
  const res = await apiClient.get<Role>(ENDPOINTS.ROLES.DETAIL(stripIdPrefix(id)));
  return assertSuccess(res);
}

export async function createRole(payload: Partial<Role>): Promise<Role> {
  const res = await apiClient.post<Role>(ENDPOINTS.ROLES.CREATE, payload);
  return assertSuccess(res);
}

export async function updateRole(id: string, payload: Partial<Role>): Promise<Role> {
  const res = await apiClient.put<Role>(ENDPOINTS.ROLES.UPDATE(stripIdPrefix(id)), payload);
  return assertSuccess(res);
}

export async function deleteRole(id: string): Promise<void> {
  const apiId = stripIdPrefix(id).replace(/^ROLE/i, '');
  const res = await apiClient.delete(ENDPOINTS.ROLES.DELETE(apiId));
  await assertSuccess(res);
}

function normalizePermissionId(id: string): string {
  const clean = stripIdPrefix(id).replace(/^PM/i, '');
  return clean;
}

export async function listPermissions(
  page = 1,
  perPage = 10,
  search?: string
): Promise<PermissionListResponse> {
  const query = buildPaginationQuery(page, perPage, search?.trim() ? { search } : undefined);
  const res = await apiClient.get<Record<string, unknown>[]>(
    `${ENDPOINTS.PERMISSIONS.LIST}${query}`
  );
  const items = (res.data || []).map((it, idx) => {
    const rawId = it.id ?? idx + 1;
    const id = `#PM${String(rawId).padStart(3, '0')}`;
    return {
      id: String(id),
      name: String(it.name ?? it.permission ?? ''),
      display_name: String(it.display_name ?? it.name ?? it.permission ?? ''),
      description: String(it.description ?? it.desc ?? ''),
    } as Permission;
  });
  return { data: items, meta: res.meta };
}

export async function getPermission(id: string): Promise<Permission> {
  const res = await apiClient.get<Permission>(
    ENDPOINTS.PERMISSIONS.DETAIL(normalizePermissionId(id))
  );
  return assertSuccess(res);
}

export async function createPermission(payload: Partial<Permission>): Promise<Permission> {
  const res = await apiClient.post<Permission>(ENDPOINTS.PERMISSIONS.CREATE, payload);
  return assertSuccess(res);
}

export async function updatePermission(id: string, payload: Partial<Permission>): Promise<Permission> {
  const res = await apiClient.put<Permission>(
    ENDPOINTS.PERMISSIONS.UPDATE(normalizePermissionId(id)),
    payload
  );
  return assertSuccess(res);
}

export async function deletePermission(id: string): Promise<void> {
  const res = await apiClient.delete(ENDPOINTS.PERMISSIONS.DELETE(normalizePermissionId(id)));
  await assertSuccess(res);
}

export async function getPermissionTree(): Promise<unknown> {
  const res = await apiClient.get(ENDPOINTS.ROLES.PERMISSION_TREE);
  return assertSuccess(res);
}

/** Permission tree nodes for role create/edit screens */
export async function listPermissionTreeNodes(): Promise<unknown[]> {
  const data = await getPermissionTree();
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const nested = (data as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

export async function listParentPermissions(): Promise<Permission[]> {
  const res = await apiClient.get<Permission[]>(ENDPOINTS.PERMISSIONS.LIST_FLAT);
  return (res.data || []) as Permission[];
}

export async function fetchParentPermissions(): Promise<{
  data: Permission[];
  error: string | null;
}> {
  try {
    const res = await apiClient.get<Permission[]>(ENDPOINTS.PERMISSIONS.LIST_FLAT);
    return { data: (res.data || []) as Permission[], error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { data: [], error: message };
  }
}

export async function getSidebarPermissions(): Promise<unknown> {
  const res = await apiClient.get(ENDPOINTS.PERMISSIONS.SIDEBAR);
  return assertSuccess(res);
}

// Type aliases for shared rbac.types
export type { PermissionRecord, RoleRecord } from '../types/user/rbac.types';
