import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export interface BrandItem {
  id: string;
  name: string;
  agencyName?: string;
  brandType?: string;
  contactPerson?: string;
  industry?: string;
  country?: string;
  state?: string;
  city?: string;
  zone?: string;
  pinCode?: string;
  dateTime?: string;
  [key: string]: unknown;
}

const ENDPOINTS = {
  LIST: '/brands',
  DETAIL: (id: string) => `/brands/${id}`,
  CREATE: '/brands',
  UPDATE: (id: string) => `/brands/${id}`,
  DELETE: (id: string) => `/brands/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }
  return json.data as T;
}

export type BrandListResponse = {
  data: BrandItem[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }
  }
};

export async function listBrands(page = 1, perPage = 10, search?: string): Promise<BrandListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());
  const res = await apiClient.get<BrandItem[]>(ENDPOINTS.LIST + `?${params.toString()}`);
  const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }

  const items = (json.data || []).map((it: unknown, idx: number) => {
    const raw = it as Record<string, unknown>;
    const idVal = raw['id'] ?? raw['uuid'] ?? raw['code'] ?? `BR${String(idx + 1).padStart(3, '0')}`;
    const nameVal = raw['name'] ?? raw['brand_name'] ?? '';
    const agencyRaw = raw['agency'];
    const agenciesRaw = raw['agencies'];
    const agencyNameVal = raw['agency_name'] ?? 
      (Array.isArray(agenciesRaw) && agenciesRaw.length > 0 ? (agenciesRaw[0] as any)?.name ?? '' : '') ??
      (agencyRaw && typeof agencyRaw === 'object' && 'name' in (agencyRaw as Record<string, unknown>) ? String((agencyRaw as Record<string, unknown>)['name']) : agencyRaw ?? '');
    const brandTypeVal = (raw['brand_type'] as any)?.name ?? raw['type'] ?? '';
    const contactPersonVal = raw['contact_person'] ?? raw['contact'] ?? '';
    const industryVal = (raw['industry'] as any)?.name ?? '';
    const countryVal = (raw['country'] as any)?.name ?? '';
    const stateVal = (raw['state'] as any)?.name ?? '';
    const cityVal = (raw['city'] as any)?.name ?? '';
    const zoneVal = (raw['zone'] as any)?.name ?? '';
    const pinCodeVal = raw['pin_code'] ?? raw['postal_code'] ?? raw['postalCode'] ?? '';
    const dateTimeVal = raw['created_at'] ?? raw['date_time'] ?? raw['dateTime'] ?? '';

    return {
      id: String(idVal),
      name: String(nameVal ?? ''),
      agencyName: String(agencyNameVal ?? ''),
      brandType: String(brandTypeVal ?? ''),
      contactPerson: String(contactPersonVal ?? ''),
      industry: String(industryVal ?? ''),
      country: String(countryVal ?? ''),
      state: String(stateVal ?? ''),
      city: String(cityVal ?? ''),
      zone: String(zoneVal ?? ''),
      pinCode: String(pinCodeVal ?? ''),
      dateTime: String(dateTimeVal ?? ''),
      // keep original raw object for callers that need extra fields
      _raw: raw,
    } as BrandItem;
  });

  return {
    data: items,
    meta: (json.meta as any) || {},
  };
}

export async function getBrand(id: string): Promise<BrandItem> {
  const res = await apiClient.get<BrandItem>(ENDPOINTS.DETAIL(encodeURIComponent(id)));
  return handleResponse<BrandItem>(res);
}

export async function createBrand(payload: Partial<BrandItem>): Promise<BrandItem> {
  const res = await apiClient.post<BrandItem>(ENDPOINTS.CREATE, payload);
  return handleResponse<BrandItem>(res);
}

export async function updateBrand(id: string, payload: Partial<BrandItem>): Promise<BrandItem> {
  const res = await apiClient.put<BrandItem>(ENDPOINTS.UPDATE(encodeURIComponent(id)), payload);
  return handleResponse<BrandItem>(res);
}

export async function deleteBrand(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(encodeURIComponent(id)));
  await handleResponse<unknown>(res);
}
