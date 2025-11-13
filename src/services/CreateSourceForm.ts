import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

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

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const message = (res && (res.message || 'Request failed')) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  return res.data as T;
}

// 1) Create Lead Sub-Source (form submit)
export async function createLeadSubSource(
  payload: CreateLeadSubSourcePayload
): Promise<LeadSubSource> {
  const res = await apiClient.post<LeadSubSource>(ENDPOINTS.LEAD_SUB_SOURCES, payload);
  return handleResponse<LeadSubSource>(res);
}

// 2) Get all Lead Sources for dropdown
export async function fetchLeadSources(): Promise<LeadSource[]> {
  const res = await apiClient.get<LeadSource[]>(ENDPOINTS.LEAD_SOURCES);
  return handleResponse<LeadSource[]>(res);
}


