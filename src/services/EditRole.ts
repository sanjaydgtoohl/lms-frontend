import apiClient from '../services/api';

export const updateRoleById = async (
  id: string | number,
  payload: Record<string, string | Blob | Array<string | Blob>>
) => {
  try {
    // The backend expects a POST to /roles/{id} with _method=Put for updates
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (typeof v === 'string' || v instanceof Blob) {
            formData.append(`${key}[]`, v);
          }
        });
      } else if (typeof value === 'string' || value instanceof Blob) {
        formData.append(key, value);
      }
    });
    formData.append('_method', 'Put');
    // Use the public request method of apiClient
    const response = await apiClient.customRequest(`/roles/${id}`, {
      method: 'POST',
      data: formData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
