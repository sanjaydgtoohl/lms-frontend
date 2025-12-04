import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

const ENDPOINTS = {
  CREATE: '/users',
  UPDATE: (id: string) => `/users/${id}`,
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
 * Create a new user
 * payload expected to contain fields like firstName, lastName, email, phone, role, status
 */
export async function createUser(payload: Record<string, any>): Promise<any> {
  // Normalize role fields: backend expects `role_id` to be an array
  const body = { ...payload } as Record<string, any>;
  if (Array.isArray(body.role_ids) && !body.role_id) {
    body.role_id = body.role_ids.map((r: any) => Number(r));
    delete body.role_ids;
  } else if (body.role_id && !Array.isArray(body.role_id)) {
    body.role_id = [Number(body.role_id)];
  } else if (body.roles && Array.isArray(body.roles) && !body.role_id) {
    body.role_id = body.roles.map((r: any) => Number(r));
    delete body.roles;
  }

  const res = await apiClient.post<any>(ENDPOINTS.CREATE, body);
  return handleResponse<any>(res);
}

/**
 * Update an existing user by id
 */
export async function updateUser(id: string, payload: Record<string, any>): Promise<any> {
  const cleanId = String(id).replace(/^#/, '');
  // Normalize role fields for update as well
  const body = { ...payload } as Record<string, any>;
  if (Array.isArray(body.role_ids) && !body.role_id) {
    body.role_id = body.role_ids.map((r: any) => Number(r));
    delete body.role_ids;
  } else if (body.role_id && !Array.isArray(body.role_id)) {
    body.role_id = [Number(body.role_id)];
  } else if (body.roles && Array.isArray(body.roles) && !body.role_id) {
    body.role_id = body.roles.map((r: any) => Number(r));
    delete body.roles;
  }

  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), body);
  return handleResponse<any>(res);
}

export default {
  createUser,
  updateUser,
};
