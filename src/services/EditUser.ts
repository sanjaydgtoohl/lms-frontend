import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

export interface EditUserPayload {
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
  password_confirmation?: string;
  role_ids?: number[];
}

export interface EditUserDetail {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  role_id?: number;
  role?: {
    id: string | number;
    name: string;
    description?: string;
  };
  roles?: Array<{
    id: string | number;
    name: string;
    description?: string;
  }>;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
}

const ENDPOINTS = {
  GET_USER: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res) {
    const error = new Error('No response from server');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }

  // Handle both success and non-success responses
  if (res.success === false) {
    const error = new Error(res.message || 'Request failed');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }

  return res.data as T;
}

/**
 * Fetch user details by ID for editing
 */
export async function getUserForEdit(id: string): Promise<EditUserDetail> {
  try {
    // Extract numeric ID only from any format
    const numericId = String(id).replace(/\D/g, '');

    console.log('Original ID:', id, 'Numeric ID:', numericId);

    const res = await apiClient.get<any>(ENDPOINTS.GET_USER(numericId));
    console.log('API Response:', res);

    const result = handleResponse<EditUserDetail>(res);
    console.log('Parsed result:', result);

    return result;
  } catch (err: any) {
    console.error('Error fetching user for edit:', err);
    const error = new Error(err?.message || 'Failed to fetch user');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }
}

/**
 * Update user details with multiple roles support
 */
export async function updateUserDetails(
  id: string,
  payload: EditUserPayload
): Promise<EditUserDetail> {
  try {
    // Extract numeric ID only from any format
    const numericId = String(id).replace(/\D/g, '');

    console.log('Updating user with ID:', numericId);

    // Build form-data payload
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.password) formData.append('password', payload.password);
    if (payload.password_confirmation) formData.append('password_confirmation', payload.password_confirmation);
    if (payload.role_ids && Array.isArray(payload.role_ids)) {
      payload.role_ids.forEach((roleId) => {
        formData.append('role[]', String(roleId));
      });
    }
    formData.append('_method', 'Put');

    // Use POST for method override
    const res = await apiClient.post<any>(ENDPOINTS.UPDATE_USER(numericId), formData);
    console.log('Update Response:', res);

    return handleResponse<EditUserDetail>(res);
  } catch (err: any) {
    console.error('Error updating user:', err);
    const error = new Error(err?.message || 'Failed to update user');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }
}
