import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  roles?: any[];
  status?: 'Active' | 'Inactive';
  lastLogin?: string;
  created?: string;
  created_at_formatted?: string;
  last_login_at?: string;
}

const ENDPOINTS = {
  LIST: '/users',
  LIST_ATTENDEES: '/users/list',
  DETAIL: (id: string) => `/users/${id}`,
  CREATE: '/users',
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {};
    throw error;
  }
  return res.data as T;
}

export type UserListResponse = {
  data: User[];
  meta?: any;
};

export async function listUsers(page = 1, perPage = 10, search?: string): Promise<UserListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<any>(`${ENDPOINTS.LIST}?${params.toString()}`);
  const normalizeApiDate = (raw?: any) => {
    if (!raw) return '';
    try {
      let s = String(raw).trim();
      // If API returns microseconds (6+ fractional digits) like 2025-12-02T05:38:19.000000Z
      // trim to milliseconds which JS Date understands: keep first 3 fractional digits
      s = s.replace(/\.(\d{3})\d*Z$/, '.$1Z');
      // Some servers may return fractional seconds without a trailing Z, ensure proper ISO
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) s = `${s}Z`;
      const d = new Date(s);
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleString();
    } catch {
      return String(raw);
    }
  };

  const items = (res.data || []).map((it: any, idx: number) => {
    const rawId = it.id ?? idx + 1;
    let idStr = String(rawId);
    if (/^\d+$/.test(idStr)) {
      idStr = `#USR${String(Number(idStr)).padStart(3, '0')}`;
    } else if (!idStr.startsWith('#')) {
      idStr = `#USR${idStr}`;
    }

    const name = it.name ?? it.full_name ?? it.display_name ?? '';
    const email = it.email ?? '';
    // status from API might be number or string; normalize to 'Active' or 'Inactive'
    let status: 'Active' | 'Inactive' = 'Active';
    if (it.status !== undefined && it.status !== null) {
      const statusStr = String(it.status).toLowerCase();
      status = (statusStr === 'inactive' || statusStr === '0' || statusStr === 'false') ? 'Inactive' : 'Active';
    }
    // Preserve all roles array for UI rendering
    let role = '';
    let roles: any[] = Array.isArray(it.roles) ? it.roles : [];
    if (roles.length > 0) {
      role = roles[0].name ?? roles[0] ?? '';
    } else {
      role = it.role ?? it.role_name ?? '';
    }

    const lastLogin = it.last_login_at ?? it.last_login ?? it.lastLogin ?? '';
    const rawCreated = it.created_at ?? it.created ?? '';
    const created = it.created_at_formatted ?? normalizeApiDate(rawCreated);

    return {
      id: String(idStr),
      name,
      email,
      role,
      roles,
      status,
      lastLogin,
      created,
      created_at_formatted: it.created_at_formatted,
      last_login_at: it.last_login_at,
    } as User;
  });

  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function listAttendees(page = 1, perPage = 100, search?: string): Promise<UserListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<any>(`${ENDPOINTS.LIST_ATTENDEES}?${params.toString()}`);
  const normalizeApiDate = (raw?: any) => {
    if (!raw) return '';
    try {
      let s = String(raw).trim();
      // If API returns microseconds (6+ fractional digits) like 2025-12-02T05:38:19.000000Z
      // trim to milliseconds which JS Date understands: keep first 3 fractional digits
      s = s.replace(/\.(\d{3})\d*Z$/, '.$1Z');
      // Some servers may return fractional seconds without a trailing Z, ensure proper ISO
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) s = `${s}Z`;
      const d = new Date(s);
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleString();
    } catch {
      return String(raw);
    }
  };

  const items = (res.data || []).map((it: any, idx: number) => {
    const rawId = it.id ?? idx + 1;
    let idStr = String(rawId);
    if (/^\d+$/.test(idStr)) {
      idStr = `#USR${String(Number(idStr)).padStart(3, '0')}`;
    } else if (!idStr.startsWith('#')) {
      idStr = `#USR${idStr}`;
    }

    const name = it.name ?? it.full_name ?? it.display_name ?? '';
    const email = it.email ?? '';
    // status from API might be number or string; normalize to 'Active' or 'Inactive'
    let status: 'Active' | 'Inactive' = 'Active';
    if (it.status !== undefined && it.status !== null) {
      const statusStr = String(it.status).toLowerCase();
      status = (statusStr === 'inactive' || statusStr === '0' || statusStr === 'false') ? 'Inactive' : 'Active';
    }
    // Preserve all roles array for UI rendering
    let role = '';
    let roles: any[] = Array.isArray(it.roles) ? it.roles : [];
    if (roles.length > 0) {
      role = roles[0].name ?? roles[0] ?? '';
    } else {
      role = it.role ?? it.role_name ?? '';
    }

    const lastLogin = it.last_login_at ?? it.last_login ?? it.lastLogin ?? '';
    const rawCreated = it.created_at ?? it.created ?? '';
    const created = it.created_at_formatted ?? normalizeApiDate(rawCreated);

    return {
      id: String(idStr),
      name,
      email,
      role,
      roles,
      status,
      lastLogin,
      created,
      created_at_formatted: it.created_at_formatted,
      last_login_at: it.last_login_at,
    } as User;
  });

  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function getUser(id: string): Promise<User> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(cleanId));
  return handleResponse<User>(res);
}

export async function createUser(payload: Partial<User>): Promise<User> {
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  return handleResponse<User>(res);
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User> {
  const cleanId = id.replace(/^#/, '');
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), payload);
  return handleResponse<User>(res);
}

export async function deleteUser(id: string): Promise<void> {
  // Extract numeric ID from any decorated format (e.g., #USR005 -> 5)
  const numericId = String(id).replace(/\D/g, '');
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(numericId));
  await handleResponse<unknown>(res);
}
