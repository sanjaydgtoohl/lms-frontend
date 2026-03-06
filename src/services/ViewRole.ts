import apiClient from '../services/api';


export const getRoleById = async (id: string | number) => {
  const response = await apiClient.customRequest(`/roles/${id}`);
  return response.data;
};
 