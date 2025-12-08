import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface MissCampaign {
  id: string;
  brandName: string;
  productName: string;
  source: string;
  subSource: string;
  proof: string;
  dateTime: string;
}

const ENDPOINTS = {
  LIST: '/miss-campaigns',
  DETAIL: (id: string) => `/miss-campaigns/${id}`,
  CREATE: '/miss-campaigns',
  UPDATE: (id: string) => `/miss-campaigns/${id}`,
  DELETE: (id: string) => `/miss-campaigns/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {}
    throw error;
  }
  return res.data as T;
}

export type MissCampaignListResponse = {
  data: MissCampaign[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    }
  }
};

export async function listMissCampaigns(page = 1, perPage = 10, search?: string): Promise<MissCampaignListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<MissCampaign[]>(`${ENDPOINTS.LIST}?${params.toString()}`);
  const items = (res.data || []).map((it: any, idx: number) => {
    const id = it.id ?? `#MC${String(idx + 1).padStart(5, '0')}`;
    // Handle brand name from nested object or flat fields
    const brandName = it.brand?.name ?? 
                     it.brand_name ?? 
                     (it.brand && typeof it.brand === 'object' ? Object.values(it.brand).join(', ') : '') ?? 
                     it.brandName ?? 
                     '';
    const productName = it.name ?? it.product_name ?? it.productName ?? '';
    // Handle source from nested object or flat fields
    const source = it.lead_source?.name ?? 
                  it.lead_source?.source ?? 
                  it.source ?? 
                  (it.lead_source && typeof it.lead_source === 'object' ? Object.values(it.lead_source).join(', ') : '') ?? 
                  '';
    // Handle sub source from nested object or flat fields
    const subSource = it.lead_sub_source?.name ?? 
                     it.lead_sub_source?.subSource ?? 
                     it.sub_source ?? 
                     (it.lead_sub_source && typeof it.lead_sub_source === 'object' ? Object.values(it.lead_sub_source).join(', ') : '') ?? 
                     it.subSource ?? 
                     '';
    const proof = it.image_path ?? it.proof ?? '';
    const dateTime = it.created_at ?? it.date_time ?? it.dateTime ?? '';
    
    return {
      id: String(id),
      brandName,
      productName,
      source,
      subSource,
      proof,
      dateTime,
    } as MissCampaign;
  });

  return {
    data: items,
    meta: (res as any).meta || {},
  };
}

export async function getMissCampaign(id: string): Promise<any> {
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(id));
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {}
    throw error;
  }
  // Return raw data with all fields (including IDs) for editing
  return res.data as any;
}

export async function createMissCampaign(payload: Partial<MissCampaign>): Promise<MissCampaign> {
  const res = await apiClient.post<MissCampaign>(ENDPOINTS.CREATE, payload);
  return handleResponse<MissCampaign>(res);
}

export async function updateMissCampaign(id: string, payload: Partial<MissCampaign>): Promise<MissCampaign> {
  // Use POST with _method: 'PUT' for method spoofing (backend expects this)
  const formData = new FormData();
  // Append all payload fields to formData
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });
  formData.append('_method', 'PUT');
  const res = await apiClient.post<MissCampaign>(ENDPOINTS.UPDATE(id), formData);
  return handleResponse<MissCampaign>(res);
}

export async function deleteMissCampaign(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}
