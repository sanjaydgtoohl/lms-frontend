import { apiClient } from '../utils/apiClient';
import type { BriefLogItem, BriefLogListResponse } from '../types/brief';

const ENDPOINTS = {
  LIST: '/briefs/brief-logs',
  DETAIL: (id: string | number) => `/briefs/${id}`,
};

/**
 * Fetch brief logs with optional pagination and filters
 * @param page page number (default 1)
 * @param perPage items per page (default 10)
 * @param filters additional query params
 */
export async function listBriefLogs(
  page = 1,
  perPage = 10,
  filters?: Record<string, any>
): Promise<BriefLogListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (filters) {
    Object.keys(filters).forEach((k) => {
      const v = filters[k];
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  }

  try {
    const res = await apiClient.get<any>(`${ENDPOINTS.LIST}?${params.toString()}`);
    const items = (res.data || []) as BriefLogItem[];
    return { data: items, meta: res.meta };
  } catch (err) {
    console.error('Failed to fetch brief logs:', err);
    return { data: [], meta: undefined };
  }
}

export async function getBriefById(id: string | number): Promise<BriefLogItem | null> {
  try {
    const res = await apiClient.get<any>(ENDPOINTS.DETAIL(id));
    return res.data as BriefLogItem;
  } catch (err) {
    console.error('Failed to fetch brief by id:', err);
    return null;
  }
}


/**
 * Fetch planner statuses for dropdown
 */
export async function getPlannerStatuses(): Promise<{ data: { id: number; name: string }[] }> {
  try {
    const res = await apiClient.get<any>('/planner-statuses');
    return { data: res.data || [] };
  } catch (err) {
    console.error('Failed to fetch planner statuses:', err);
    return { data: [] };
  }
}

export type { BriefLogItem, BriefLogListResponse } from '../types/brief';

export default {
  listBriefLogs,
  getBriefById,
  getPlannerStatuses,
};
