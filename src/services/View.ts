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
  industry?: string;
  mediaType?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
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
    try {
      handleApiError(error);
    } catch (err) {
      console.warn('[handleResponse] handleApiError failed:', err);
    }
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

export async function listMissCampaigns(page = 1, perPage = 10, search?: string, filters?: Record<string, string>): Promise<MissCampaignListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());
  if (filters) {
    const keyMap: Record<string, string> = {
      mediaType: 'media_type',
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        const apiKey = keyMap[key] ?? key;
        params.set(apiKey, value.trim());
      }
    });
  }

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
    const proof = it.image_url ?? it.image_path ?? it.proof ?? '';
    const dateTime = it.created_at ?? it.date_time ?? it.dateTime ?? '';
    const industry = it.industry?.name ?? it.industry ?? it.industry_name ?? '';
    const pincode = it.pincode ?? it.pin_code ?? it.zip_code ?? it.postal_code ?? it.zipcode ?? '';
    const city = it.city?.name ?? it.city ?? '';
    const state = it.state?.name ?? it.state ?? '';
    const country = it.country?.name ?? it.country ?? '';
    const normalizeNestedValue = (raw: any): string => {
      if (typeof raw === 'string') return raw;
      if (typeof raw === 'number') return String(raw);
      if (raw && typeof raw === 'object') {
        const candidate = raw.name ?? raw.label ?? raw.type ?? raw.value ?? raw.title ?? raw.media_type ?? raw.mediaType ?? raw.media;
        if (typeof candidate === 'string' && candidate.trim() !== '') return candidate;
        if (typeof candidate === 'number') return String(candidate);
        // Try any string value in the object if common keys not found
        const firstString = Object.values(raw).find((v) => typeof v === 'string');
        if (typeof firstString === 'string' && firstString.trim() !== '') return firstString;
        const firstNumber = Object.values(raw).find((v) => typeof v === 'number');
        if (typeof firstNumber === 'number') return String(firstNumber);
      }
      return '';
    };

    const mediaType = normalizeNestedValue(
      it.media ?? it.media_type ?? it.mediaType ?? it.media_type_name ?? it.mediaTypeName ?? it.media_type_id
    );

    return {
      id: String(id),
      brandName,
      productName,
      source,
      subSource,
      proof,
      dateTime,
      industry,
      pincode,
      city,
      state,
      country,
      mediaType,
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
    try { handleApiError(error); } catch { 
      // no need to action
    }
    throw error;
  }
  // Return raw data with all fields (including IDs) for editing
  return res.data as any;
}

export async function createMissCampaign(payload: Partial<MissCampaign>): Promise<MissCampaign> {
  const formData = new FormData();
  const mediaTypeValue = payload.mediaType ?? (payload as any).media_type;
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'mediaType' || key === 'media_type') return;
    formData.append(key, value as any);
  });
  if (mediaTypeValue !== undefined && mediaTypeValue !== null && String(mediaTypeValue).trim() !== '') {
    formData.append('media_type', String(mediaTypeValue));
  }
  const res = await apiClient.post<MissCampaign>(ENDPOINTS.CREATE, formData);
  return handleResponse<MissCampaign>(res);
}

export async function updateMissCampaign(id: string, payload: Partial<MissCampaign>): Promise<MissCampaign> {
  // Use POST with _method: 'PUT' for method spoofing (backend expects this)
  const formData = new FormData();
  const mediaTypeValue = payload.mediaType ?? (payload as any).media_type;
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'mediaType' || key === 'media_type') return;
    formData.append(key, value as any);
  });
  if (mediaTypeValue !== undefined && mediaTypeValue !== null && String(mediaTypeValue).trim() !== '') {
    formData.append('media_type', String(mediaTypeValue));
  }
  formData.append('_method', 'PUT');
  const res = await apiClient.post<MissCampaign>(ENDPOINTS.UPDATE(id), formData);
  return handleResponse<MissCampaign>(res);
}

export async function deleteMissCampaign(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}

export type PreLead = MissCampaign;
export type PreLeadListResponse = MissCampaignListResponse;
export const listPreLeads = listMissCampaigns;
export const getPreLead = getMissCampaign;
export const createPreLead = createMissCampaign;
export const updatePreLead = updateMissCampaign;
export const deletePreLead = deleteMissCampaign;
