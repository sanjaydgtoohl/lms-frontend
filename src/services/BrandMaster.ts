import { API_BASE_URL } from '../constants';
import { handleApiError } from '../utils/apiErrorHandler';

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

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error((json && (json.message || json.error)) || 'Request failed');
    (error as any).statusCode = res.status;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
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

  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}?${params.toString()}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error((json && (json.message || json.error)) || 'Request failed');
    (error as any).statusCode = res.status;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }

  const items = (json.data || []).map((it: unknown, idx: number) => {
    const raw = it as Record<string, unknown>;
    const idVal = raw['id'] ?? raw['uuid'] ?? raw['code'] ?? `BR${String(idx + 1).padStart(3, '0')}`;
    const nameVal = raw['name'] ?? raw['brand_name'] ?? '';
    const agencyRaw = raw['agency'];
    const agencyNameVal = raw['agency_name'] ?? (agencyRaw && typeof agencyRaw === 'object' && 'name' in (agencyRaw as Record<string, unknown>) ? String((agencyRaw as Record<string, unknown>)['name']) : agencyRaw ?? '');
    const brandTypeVal = raw['brand_type'] ?? raw['type'] ?? '';
    const contactPersonVal = raw['contact_person'] ?? raw['contact'] ?? '';
    const industryVal = raw['industry'] ?? '';
    const countryVal = raw['country'] ?? '';
    const stateVal = raw['state'] ?? '';
    const cityVal = raw['city'] ?? '';
    const zoneVal = raw['zone'] ?? '';
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
    meta: json.meta || {},
  };
}

export async function getBrand(id: string): Promise<BrandItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(encodeURIComponent(id))}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<BrandItem>(res);
}

export async function createBrand(payload: Partial<BrandItem>): Promise<BrandItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<BrandItem>(res);
}

export async function updateBrand(id: string, payload: Partial<BrandItem>): Promise<BrandItem> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE(encodeURIComponent(id))}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<BrandItem>(res);
}

export async function deleteBrand(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DELETE(encodeURIComponent(id))}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await handleResponse<unknown>(res);
}
