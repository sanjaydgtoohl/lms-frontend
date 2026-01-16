// Update call status for a lead
export const updateCallStatus = async (leadId: string | number, callStatusId: string | number) => {
  try {
    // API expects POST with _method=Put and call_status_id
    const response = await http.post(
      `${API_BASE_URL}/leads/${leadId}/call-status`,
      {
        call_status_id: callStatusId,
        _method: 'Put',
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
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
