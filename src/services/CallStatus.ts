import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

// --- Call Status Type ---
export type CallStatus = {
  id: number;
  name: string;
};

// --- Fetch call statuses for dropdown ---
export async function getCallStatuses(): Promise<CallStatus[]> {
  try {
    const res = await apiClient.get<CallStatus[]>('/call-statuses');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch call statuses');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Update call status for a lead ---
export async function updateCallStatus(
  leadId: string | number,
  callStatusId: string | number
): Promise<void> {
  try {
    // API expects POST with _method=Put and call_status_id
    const res = await apiClient.post(`/leads/${leadId}/call-status`, {
      call_status_id: callStatusId,
      _method: 'Put',
    });
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to update call status');
    }
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
