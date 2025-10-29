import { API_BASE_URL } from '../constants';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type LeadSource = {
  id: number | string;
  name: string;
  slug?: string | null;
  description?: string | null;
  status?: string | number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateLeadSubSourcePayload = {
  lead_source_id: number | string; // parent source id
  name: string; // sub-source name
  description?: string | null;
  status?: string | number;
};

export type LeadSubSource = {
  id: number | string;
  name: string;
  description?: string | null;
  status?: string | number;
  created_at?: string | null;
  lead_source?: LeadSource;
};

const ENDPOINTS = {
  LEAD_SOURCES: '/lead-sources',
  LEAD_SUB_SOURCES: '/lead-sub-sources',
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
    throw new Error(message);
  }
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

// 1) Create Lead Sub-Source (form submit)
export async function createLeadSubSource(
  payload: CreateLeadSubSourcePayload
): Promise<LeadSubSource> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LEAD_SUB_SOURCES}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<LeadSubSource>(res);
}

// 2) Get all Lead Sources for dropdown
export async function fetchLeadSources(): Promise<LeadSource[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.LEAD_SOURCES}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<LeadSource[]>(res);
}


