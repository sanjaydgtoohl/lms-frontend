import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

// --- Priority Type ---
export type Priority = {
  id: number;
  name: string;
  slug: string;
};

// --- Fetch priorities for dropdown ---
export async function getPriorities(): Promise<Priority[]> {
  try {
    const res = await apiClient.get<Priority[]>('/priorities');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch priorities');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch priorities by call status id ---
export async function getPrioritiesByCallStatus(callStatusId: string | number): Promise<Priority[]> {
  try {
    const res = await apiClient.get<Priority[]>(`/call-statuses/${callStatusId}/priorities`);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch priorities by call status');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
