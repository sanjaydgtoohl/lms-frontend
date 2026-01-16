import { apiClient } from '../utils/apiClient';

export interface BriefStatusItem {
  id: number | string;
  name: string;
  uuid?: string;
  [key: string]: any;
}

export interface BriefStatusResponse {
  success?: boolean;
  message?: string;
  data?: BriefStatusItem[];
  meta?: any;
}

/**
 * Fetch all brief statuses from API
 * Endpoint: GET /api/v1/brief-statuses
 */
export const fetchBriefStatuses = async (): Promise<BriefStatusItem[]> => {
  try {
    const res = await apiClient.get<BriefStatusResponse>('/brief-statuses');
    // Handle both data.data and direct array response
    const statuses = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return statuses;
  } catch (err) {
    console.error('Failed to fetch brief statuses:', err);
    return [];
  }
};

/**
 * Get status names array suitable for dropdown options
 */
export const getBriefStatusNames = async (): Promise<string[]> => {
  const statuses = await fetchBriefStatuses();
  return statuses.map(s => s.name);
};

/**
 * Update brief status by brief ID and status ID
 * Endpoint: PUT /api/v1/briefs/:id/update-status?brief_status_id=:status_id
 */
export const updateBriefStatus = async (briefId: string | number, briefStatusId: string | number): Promise<any> => {
  try {
    const query = `?brief_status_id=${encodeURIComponent(String(briefStatusId))}`;
    const path = `/briefs/${briefId}/update-status${query}`;
    const res = await apiClient.put<any>(path);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error('Failed to update brief status:', err);
    throw err;
  }
};

export default fetchBriefStatuses;
