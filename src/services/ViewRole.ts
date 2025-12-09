import apiClient from '../services/api';

export const getRoleById = async (id: string | number) => {
  try {
    // Remove extra /v1 if base URL already includes it
    const response = await apiClient["request"](`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
