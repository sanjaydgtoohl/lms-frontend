import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

export interface PermissionEditPayload {
  display_name: string;
  name: string;
  url?: string;
  is_parent?: number | null;
  description: string;
  icon_text?: string;
  order?: string | number;
  status?: string;
  icon_file?: File | null;
}

export interface PermissionEditDetail {
  id: string;
  display_name: string;
  name: string;
  url: string;
  is_parent: string | number | null;
  description: string;
  icon_text: string;
  order?: string | number;
  icon_file?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const ENDPOINTS = {
  GET_PERMISSION: (id: string) => `/permissions/${id}`,
  UPDATE_PERMISSION: (id: string) => `/permissions/${id}`,
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
 * Fetch permission details by ID for editing
 */
export async function getPermissionForEdit(id: string): Promise<PermissionEditDetail> {
  try {
    // Remove # and PM prefix, keep only numeric ID
    // Examples: "PM001" -> "1", "#PM001" -> "1", "1" -> "1"
    let cleanId = String(id).replace(/^#/, '').trim();
    cleanId = cleanId.replace(/^PM/, '');
    
    console.log('Original ID:', id, 'Clean ID:', cleanId);
    
    const res = await apiClient.get<any>(ENDPOINTS.GET_PERMISSION(cleanId));
    console.log('API Response:', res);
    
    const result = handleResponse<PermissionEditDetail>(res);
    console.log('Parsed result:', result);
    
    return result;
  } catch (err: any) {
    console.error('Error fetching permission for edit:', err);
    const error = new Error(err?.message || 'Failed to fetch permission');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }
}

/**
 * Update permission with multipart form data (for file upload)
 */
export async function updatePermissionWithFile(
  id: string,
  payload: PermissionEditPayload
): Promise<PermissionEditDetail> {
  try {
    // Remove # and PM prefix, keep only numeric ID
    let cleanId = String(id).replace(/^#/, '').trim();
    cleanId = cleanId.replace(/^PM/, '');
    
    console.log('Updating permission with ID:', cleanId);
    
    // Use FormData for multipart upload if icon file is present
    if (payload.icon_file) {
      const formData = new FormData();
      formData.append('display_name', payload.display_name);
      formData.append('name', payload.name);
      formData.append('url', payload.url || '');
      formData.append('is_parent', String(payload.is_parent || ''));
      formData.append('description', payload.description);
      formData.append('icon_text', payload.icon_text || '');
      formData.append('status', payload.status || '1');
      if (payload.order !== undefined) formData.append('order', String(payload.order));
      formData.append('icon_file', payload.icon_file);
      formData.append('_method', 'PUT'); // For Laravel method spoofing if needed

      const res = await apiClient.post<any>(
        ENDPOINTS.UPDATE_PERMISSION(cleanId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return handleResponse<PermissionEditDetail>(res);
    } else {
      // Standard JSON update without file
      const res = await apiClient.put<any>(ENDPOINTS.UPDATE_PERMISSION(cleanId), payload);
      return handleResponse<PermissionEditDetail>(res);
    }
  } catch (err: any) {
    console.error('Error updating permission:', err);
    const error = new Error(err?.message || 'Failed to update permission');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }
}

/**
 * Update permission (JSON only, no file upload)
 */
export async function updatePermissionOnly(
  id: string,
  payload: Omit<PermissionEditPayload, 'icon_file'>
): Promise<PermissionEditDetail> {
  try {
    // Remove # and PM prefix, keep only numeric ID
    let cleanId = String(id).replace(/^#/, '').trim();
    cleanId = cleanId.replace(/^PM/, '');
    
    const res = await apiClient.put<any>(ENDPOINTS.UPDATE_PERMISSION(cleanId), payload);
    return handleResponse<PermissionEditDetail>(res);
  } catch (err: any) {
    console.error('Error updating permission:', err);
    const error = new Error(err?.message || 'Failed to update permission');
    try {
      handleApiError(error);
    } catch {}
    throw error;
  }
}
