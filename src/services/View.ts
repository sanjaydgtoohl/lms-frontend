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
    const brandName = it.brand?.name ?? it.brand_name ?? it.brandName ?? '';
    const productName = it.name ?? it.product_name ?? it.productName ?? '';
    const source = it.lead_source?.name ?? it.source ?? '';
    const subSource = it.lead_sub_source?.name ?? it.sub_source ?? it.subSource ?? '';
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

export async function getMissCampaign(id: string): Promise<MissCampaign> {
  const res = await apiClient.get<MissCampaign>(ENDPOINTS.DETAIL(id));
  return handleResponse<MissCampaign>(res);
}

export async function createMissCampaign(payload: Partial<MissCampaign>): Promise<MissCampaign> {
  const res = await apiClient.post<MissCampaign>(ENDPOINTS.CREATE, payload);
  return handleResponse<MissCampaign>(res);
}

export async function updateMissCampaign(id: string, payload: Partial<MissCampaign>): Promise<MissCampaign> {
  const res = await apiClient.put<MissCampaign>(ENDPOINTS.UPDATE(id), payload);
  return handleResponse<MissCampaign>(res);
}

export async function deleteMissCampaign(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}
