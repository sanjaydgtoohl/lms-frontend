import http from './http';
import { API_BASE_URL } from '../constants';

// Fetch priorities for dropdown
export const fetchPriorities = async () => {
  try {
    const response = await http.get(`${API_BASE_URL}/priorities`);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: response.data?.message || 'Unknown error' };
  } catch (error: any) {
    return { data: [], error: error?.response?.data?.message || error.message || 'Network error' };
  }
};

// Fetch priorities by call status id
export const fetchPrioritiesByCallStatus = async (callStatusId: string) => {
  try {
    const response = await http.get(`${API_BASE_URL}/call-statuses/${callStatusId}/priorities`);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: response.data?.message || 'Unknown error' };
  } catch (error: any) {
    return { data: [], error: error?.response?.data?.message || error.message || 'Network error' };
  }
};
