import { apiClient } from '../utils/apiClient';

export const fetchParentPermissions = async () => {
  try {
    const res = await apiClient.get<any>('/permissions/list');
    // res.data expected to be an array of { id: number, display_name: string, ... }
    return { data: res.data || [], error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};
