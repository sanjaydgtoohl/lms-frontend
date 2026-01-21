import { apiClient } from '../utils/apiClient';

export interface LeadItem {
  id: string | number;
  name?: string;
  brand_name?: string;
  brand_id?: number | string;
  contact_person?: string;
  mobile_number?: string[];
  number?: string;
  phone?: string;
  email?: string;
  lead_source?: string;
  lead_sub_source?: string;
  priority_id?: number | string;
  current_assign_user?: number | string;
  [key: string]: any;
}

export type LeadListResponse = {
  data: LeadItem[];
  meta?: any;
};

const ENDPOINTS = {
  LIST: '/leads',
  DETAIL: (id: string | number) => `/leads/${id}`,
};

export async function listLeads(
  page = 1,
  perPage = 15,
  filters?: Record<string, any>
): Promise<LeadListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (filters) {
    Object.keys(filters).forEach((k) => {
      const v = filters[k];
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  }

  const res = await apiClient.get<any[]>(`${ENDPOINTS.LIST}?${params.toString()}`);
  // apiClient already returns a wrapped response with .data and .meta
  const items = (res.data || []) as any[];
  return { data: items as LeadItem[], meta: res.meta };
}

export async function getLeadById(id: string | number): Promise<LeadItem> {
  const res = await apiClient.get<LeadItem>(ENDPOINTS.DETAIL(id));
  return res.data as LeadItem;
}

export async function createLead(payload: Record<string, any>): Promise<LeadItem> {
  const res = await apiClient.post<any>(ENDPOINTS.LIST, payload);
  return res.data as LeadItem;
}

export async function updateLead(id: string | number, payload: Record<string, any>): Promise<LeadItem> {
  const res = await apiClient.put<any>(ENDPOINTS.DETAIL(id), payload);
  return res.data as LeadItem;
}

export async function deleteLead(id: string | number): Promise<void> {
  await apiClient.delete<any>(ENDPOINTS.DETAIL(id));
}

export default {
  listLeads,
  getLeadById,
};

/**
 * Fetch leads by status name or ID (for pages like 'Meeting Done', 'Interested', etc.)
 * @param status Status name (string) or ID (number)
 * @param page Page number (default 1)
 * @param perPage Items per page (default 15)
 * @param extraFilters Any extra filters to apply
 */
export async function listLeadsByStatus(
  status: string | number,
  page = 1,
  perPage = 15,
  extraFilters?: Record<string, any>
): Promise<LeadListResponse> {
  let filters: Record<string, any> = { ...extraFilters };
  if (typeof status === 'number') {
    filters.lead_status_id = status;
  } else {
    filters.lead_status = status;
  }
  return listLeads(page, perPage, filters);
}
