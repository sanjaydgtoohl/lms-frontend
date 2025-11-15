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
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  return handleResponse<any>(res);
}

/**
 * Update an existing user by id
 */
export async function updateUser(id: string, payload: Record<string, any>): Promise<any> {
  const cleanId = String(id).replace(/^#/, '');
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(cleanId), payload);
  return handleResponse<any>(res);
}

export default {
  createUser,
  updateUser,
};
