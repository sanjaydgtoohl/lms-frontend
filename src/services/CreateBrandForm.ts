import { API_BASE_URL } from '../constants';
import { useUiStore } from '../store/ui';

export type Zone = {
  id: number | string;
  name: string;
  slug?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

const ENDPOINTS = {
  LIST: '/regions', // API returns regions (used as Zone dropdown)
  DETAIL: (id: string | number) => `/regions/${id}`,
  CITIES: {
    LIST: '/cities',
    DETAIL: (id: string | number) => `/cities/${id}`,
  },
  STATES: {
    LIST: '/states/all',
    DETAIL: (id: string | number) => `/states/${id}`,
  },
} as const;

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
    const message = (json && (json.message || json.error)) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export async function listZones(): Promise<Zone[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const cacheKey = JSON.stringify(params || {});
  if (cityCache[cacheKey]) return cityCache[cacheKey];

  const qs = buildQuery(params as Record<string, any>);
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CITIES.LIST}${qs}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.CITIES.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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

export async function listStates(): Promise<State[]> {
  const cacheKey = 'all_states';
  if (stateCache[cacheKey]) return stateCache[cacheKey];

  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.STATES.LIST}`, {
    method: 'GET',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.STATES.DETAIL(id)}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<State>(res);
}

export default {
  listZones,
  getZone,
};
