import http from './http';
import { API_BASE_URL } from '../constants';

// Fetch call statuses for dropdown
export const fetchCallStatuses = async () => {
  try {
    const response = await http.get(`${API_BASE_URL}/call-statuses`);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: response.data?.message || 'Unknown error' };
  } catch (error: any) {
    return { data: [], error: error?.response?.data?.message || error.message || 'Network error' };
  }
};
