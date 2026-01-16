import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

export type Zone = {
  id: number | string;
  name: string;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

const ENDPOINTS = {
  // Zones (previously 'regions')
  LIST: '/zones',
  DETAIL: (id: string | number) => `/zones/${id}`,
  BRAND_TYPES: {
    LIST: '/brand-types',
    DETAIL: (id: string | number) => `/brand-types/${id}`,
  },
  CITIES: {
    LIST: '/cities/list',
    DETAIL: (id: string | number) => `/cities/${id}`,
  },
  STATES: {
    LIST: '/states/list',
    DETAIL: (id: string | number) => `/states/${id}`,
  },
  COUNTRIES: {
    LIST: '/countries/list',
    DETAIL: (id: string | number) => `/countries/${id}`,
  },
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const message = (res && (res.message || 'Request failed')) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  return res.data as T;
}

export async function listZones(): Promise<Zone[]> {
  const res = await apiClient.get<Zone[]>(ENDPOINTS.LIST);
  const items = await handleResponse<Zone[]>(res);
  return (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    slug: it.slug ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));
}

export async function getZone(id: string | number): Promise<Zone> {
  const res = await apiClient.get<Zone>(ENDPOINTS.DETAIL(id));
  return handleResponse<Zone>(res);
}

// --- City API (used by City dropdown) ---
export type City = {
  id: number | string;
  name: string;
  state_id?: number | string | null;
  country_id?: number | string | null;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

const cityCache: Record<string, City[]> = {};

function buildQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const parts: string[] = [];
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  });
  return parts.length ? `?${parts.join('&')}` : '';
}

export async function listCities(params?: { state_id?: string | number; country_id?: string | number }): Promise<City[]> {
  // Sanitize params: only include numeric IDs to avoid server validation errors (422)
  const safeParams: Record<string, any> = {};
  if (params) {
    if (params.state_id !== undefined && params.state_id !== null && String(params.state_id).match(/^\d+$/)) {
      safeParams.state_id = Number(params.state_id);
    }
    if (params.country_id !== undefined && params.country_id !== null && String(params.country_id).match(/^\d+$/)) {
      safeParams.country_id = Number(params.country_id);
    }
  }

  const cacheKey = JSON.stringify(safeParams || {});
  if (cityCache[cacheKey]) return cityCache[cacheKey];

  const qs = buildQuery(safeParams as Record<string, any>);
  const res = await apiClient.get<City[]>(ENDPOINTS.CITIES.LIST + qs);
  const items = await handleResponse<City[]>(res);
  const normalized = (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    state_id: it.state_id ?? it.state ?? null,
    country_id: it.country_id ?? it.country ?? null,
    slug: it.slug ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));

  cityCache[cacheKey] = normalized;
  return normalized;
}

export async function getCity(id: string | number): Promise<City> {
  const res = await apiClient.get<City>(ENDPOINTS.CITIES.DETAIL(id));
  return handleResponse<City>(res);
}

// --- State API (used by State dropdown) ---
export type State = {
  id: number | string;
  name: string;
  country_id?: number | string | null;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

const stateCache: Record<string, State[]> = {};

export async function listStates(params?: { country_id?: string | number }): Promise<State[]> {
  const cacheKey = JSON.stringify(params || {});
  if (stateCache[cacheKey]) return stateCache[cacheKey];

  const qs = buildQuery(params as Record<string, any>);
  const res = await apiClient.get<State[]>(ENDPOINTS.STATES.LIST + qs);
  const items = await handleResponse<State[]>(res);
  const normalized = (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    country_id: it.country_id ?? it.country ?? null,
    slug: it.slug ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));

  stateCache[cacheKey] = normalized;
  return normalized;
}

export async function getState(id: string | number): Promise<State> {
  const res = await apiClient.get<State>(ENDPOINTS.STATES.DETAIL(id));
  return handleResponse<State>(res);
}

// --- Country API (used by Country dropdown) ---
export type Country = {
  id: number | string;
  name: string;
  code?: string | null;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

const countryCache: Record<string, Country[]> = {};

export async function listCountries(): Promise<Country[]> {
  const cacheKey = 'all_countries';
  if (countryCache[cacheKey]) return countryCache[cacheKey];

  const res = await apiClient.get<Country[]>(ENDPOINTS.COUNTRIES.LIST);
  const items = await handleResponse<Country[]>(res);
  const normalized = (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it.slug || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    code: it.code ?? null,
    slug: it.slug ?? null,
    status: it.status ?? null,
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
    deleted_at: it.deleted_at ?? null,
  }));

  countryCache[cacheKey] = normalized;
  return normalized;
}

export async function getCountry(id: string | number): Promise<Country> {
  const res = await apiClient.get<Country>(ENDPOINTS.COUNTRIES.DETAIL(id));
  return handleResponse<Country>(res);
}

// --- Brand Types API (used by Brand Type dropdown) ---
export type BrandType = {
  id: number | string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

const brandTypeCache: Record<string, BrandType[]> = {};

export async function listBrandTypes(): Promise<BrandType[]> {
  const cacheKey = 'all_brand_types';
  if (brandTypeCache[cacheKey]) return brandTypeCache[cacheKey];

  const res = await apiClient.get<BrandType[]>(ENDPOINTS.BRAND_TYPES.LIST);
  const items = await handleResponse<BrandType[]>(res);
  const normalized = (items || []).map((it: any) => ({
    id: it.id ?? it._id ?? String(it.name || ''),
    name: it.name ?? it.title ?? it.label ?? '',
    created_at: it.created_at ?? null,
    updated_at: it.updated_at ?? null,
  }));

  brandTypeCache[cacheKey] = normalized;
  return normalized;
}

export async function getBrandType(id: string | number): Promise<BrandType> {
  const res = await apiClient.get<BrandType>(ENDPOINTS.BRAND_TYPES.DETAIL(id));
  return handleResponse<BrandType>(res);
}

export default {
  listZones,
  getZone,
  listCountries,
  getCountry,
  listBrandTypes,
  getBrandType,
};
