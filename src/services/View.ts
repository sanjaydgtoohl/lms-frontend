import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';
import { API_BASE_URL } from '../constants';

/** First non-empty trimmed string (API often sends "" or null for missing image fields). */
function firstNonEmptyString(...candidates: unknown[]): string {
  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    const s = typeof v === 'string' ? v.trim() : String(v).trim();
    if (s) return s;
  }
  return '';
}

/**
 * API frequently returns storage paths like `/storage/...` without host; <img src> from Vite then hits the dev server and 404s.
 * Previously proof was used as-is without resolving against API origin.
 */
export function resolveMissCampaignImageSrc(raw: string | undefined | null): string {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (s.startsWith('blob:') || s.startsWith('data:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) {
    return typeof window !== 'undefined'
      ? `${window.location.protocol}${s}`
      : `https:${s}`;
  }
  const path = s.startsWith('/') ? s : `/${s}`;
  const base = String(API_BASE_URL).trim().replace(/\/+$/, '');
  try {
    if (/^https?:\/\//i.test(base)) {
      const u = new URL(base);
      return `${u.origin}${path}`;
    }
  } catch {
    /* noop */
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export interface MissCampaign {
  id: string;
  brandName: string;
  productName: string;
  source: string;
  sourceId?: string;
  subSource: string;
  proof: string;
  dateTime: string;
  industry?: string;
  industryId?: string;
  mediaType?: string;
  mediaTypeId?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
  assignTo?: string;
  assignBy?: string;
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
    total?: number;
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

/* Previously this normalization lived inside listMissCampaigns `.map` as `normalizeNestedValue` — extracted for reuse with GET-by-id mapping. */
function normalizeNestedMissCampaignValue(raw: any): string {
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  if (raw && typeof raw === 'object') {
    const candidate = raw.name ?? raw.label ?? raw.type ?? raw.value ?? raw.title ?? raw.media_type ?? raw.mediaType ?? raw.media;
    if (typeof candidate === 'string' && candidate.trim() !== '') return candidate;
    if (typeof candidate === 'number') return String(candidate);
    const firstString = Object.values(raw).find((v) => typeof v === 'string');
    if (typeof firstString === 'string' && firstString.trim() !== '') return firstString;
    const firstNumber = Object.values(raw).find((v) => typeof v === 'number');
    if (typeof firstNumber === 'number') return String(firstNumber);
  }
  return '';
}

function nestedObjectDisplayValue(raw: any): string {
  if (!raw || typeof raw !== 'object') return '';
  const values = Object.values(raw)
    .filter((v) => typeof v === 'string')
    .map((v) => String(v).trim())
    .filter(Boolean);
  return values.join(', ');
}

/** Maps API miss-campaign payload (list row or GET-by-id) to display/edit-friendly MissCampaign. */
export function mapMissCampaignApiToMissCampaign(it: any, idx?: number): MissCampaign {
  const id =
    it.id ??
    (idx !== undefined ? `#MC${String(idx + 1).padStart(5, '0')}` : '');
  const brandName =
    it.brand?.name ??
    it.brand_name ??
    it.brandName ??
    nestedObjectDisplayValue(it.brand) ??
    '';
  const productName = it.name ?? it.product_name ?? it.productName ?? '';
  const source =
    it.lead_source?.name ??
    it.lead_source?.source ??
    it.source ??
    nestedObjectDisplayValue(it.lead_source) ??
    '';
  const subSource =
    it.lead_sub_source?.name ??
    it.lead_sub_source?.subSource ??
    it.sub_source ??
    it.subSource ??
    nestedObjectDisplayValue(it.lead_sub_source) ??
    '';
  // Previously: const proof = it.image_url ?? it.image_path ?? it.proof ?? '';
  const imageNested =
    it.image && typeof it.image === 'object'
      ? (it.image.url ?? it.image.path ?? it.image.full_url ?? it.image.original_url ?? '')
      : '';
  const mediaFirst =
    Array.isArray(it.media) && it.media.length > 0 && typeof it.media[0] === 'object'
      ? it.media[0]
      : null;
  const proofFromMediaFirst = mediaFirst
    ? firstNonEmptyString(
        mediaFirst.original_url,
        mediaFirst.full_url,
        mediaFirst.url,
        mediaFirst.preview_url,
        mediaFirst.path
      )
    : '';
  const proofFromMediaObject =
    !Array.isArray(it.media) && it.media && typeof it.media === 'object'
      ? firstNonEmptyString(
          it.media.original_url,
          it.media.full_url,
          it.media.url,
          it.media.preview_url,
          it.media.path
        )
      : '';
  const attachmentVal = it.attachment;
  const proofFromAttachment =
    typeof attachmentVal === 'string'
      ? attachmentVal
      : attachmentVal && typeof attachmentVal === 'object'
        ? firstNonEmptyString(
            (attachmentVal as { url?: string }).url,
            (attachmentVal as { path?: string }).path
          )
        : '';

  const proofRaw = firstNonEmptyString(
    it.image_url,
    it.image_path,
    typeof it.image === 'string' ? it.image : '',
    typeof imageNested === 'string' ? imageNested : '',
    proofFromMediaFirst,
    proofFromMediaObject,
    typeof it.media === 'string' ? it.media : '',
    it.proof,
    it.proof_url,
    it.document_url,
    it.file_url,
    it.photo,
    it.attachment_url,
    proofFromAttachment
  );

  const proof = resolveMissCampaignImageSrc(proofRaw);
  const dateTime = it.created_at ?? it.date_time ?? it.dateTime ?? '';
  const industry = it.industry?.name ?? it.industry ?? it.industry_name ?? '';
  const industryId = it.industry?.id ?? it.industry_id ?? it.industryId ?? it.industry?.value ?? '';
  const pincode = it.pincode ?? it.pin_code ?? it.zip_code ?? it.postal_code ?? it.zipcode ?? '';
  const city = it.city?.name ?? it.city ?? '';
  const state = it.state?.name ?? it.state ?? '';
  const country = it.country?.name ?? it.country ?? '';

  const rawAssignTo =
    it.assign_to_name ??
    it.current_assign_user_name ??
    it.assigned_user?.name ??
    (it.current_assign_user && typeof it.current_assign_user === 'object' ? it.current_assign_user.name : '') ??
    '';
  const assignTo = rawAssignTo || (it.assign_to ? normalizeNestedMissCampaignValue(it.assign_to) : '') || '';
  const rawAssignBy = it.assign_by_name ?? it.created_by_user?.name ?? '';
  const assignBy =
    rawAssignBy ||
    (it.assign_by ? normalizeNestedMissCampaignValue(it.assign_by) : '') ||
    (it.created_by ? normalizeNestedMissCampaignValue(it.created_by) : '') ||
    '';

  const sourceId =
    it.lead_source?.id ?? it.lead_source_id ?? it.source_id ?? it.sourceId ?? it.lead_source?.value ?? '';
  const mediaTypeId = it.media?.id ?? it.media_type_id ?? it.mediaTypeId ?? it.media_type?.id ?? '';
  const mediaTypeCandidate =
    it.media_type ??
    it.mediaType ??
    it.media_type_name ??
    it.mediaTypeName ??
    it.media_type_id ??
    (it.media && typeof it.media === 'object'
      ? (it.media.type ?? it.media.name ?? it.media.label ?? it.media.media_type ?? it.media.mediaType)
      : undefined);
  const mediaType = normalizeNestedMissCampaignValue(mediaTypeCandidate);

  return {
    id: String(id),
    brandName,
    productName,
    source,
    sourceId,
    subSource,
    proof,
    dateTime,
    industry,
    industryId,
    pincode,
    city,
    state,
    country,
    assignTo,
    assignBy,
    mediaType,
    mediaTypeId,
  };
}

/* Previously listMissCampaigns used this inline `.map` body (comment preserved — active code now uses mapMissCampaignApiToMissCampaign):
  const items = (res.data || []).map((it: any, idx: number) => {
    const id = it.id ?? `#MC${String(idx + 1).padStart(5, '0')}`;
    const brandName = it.brand?.name ??
      it.brand_name ??
      (it.brand && typeof it.brand === 'object' ? Object.values(it.brand).join(', ') : '') ??
      it.brandName ??
      '';
    const productName = it.name ?? it.product_name ?? it.productName ?? '';
    const source = it.lead_source?.name ??
      it.lead_source?.source ??
      it.source ??
      (it.lead_source && typeof it.lead_source === 'object' ? Object.values(it.lead_source).join(', ') : '') ??
      '';
    const subSource = it.lead_sub_source?.name ??
      it.lead_sub_source?.subSource ??
      it.sub_source ??
      (it.lead_sub_source && typeof it.lead_sub_source === 'object' ? Object.values(it.lead_sub_source).join(', ') : '') ??
      it.subSource ??
      '';
    const proof = it.image_url ?? it.image_path ?? it.proof ?? '';
    const dateTime = it.created_at ?? it.date_time ?? it.dateTime ?? '';
    const industry = it.industry?.name ?? it.industry ?? it.industry_name ?? '';
    const industryId = it.industry?.id ?? it.industry_id ?? it.industryId ?? it.industry?.value ?? '';
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
        const firstString = Object.values(raw).find((v) => typeof v === 'string');
        if (typeof firstString === 'string' && firstString.trim() !== '') return firstString;
        const firstNumber = Object.values(raw).find((v) => typeof v === 'number');
        if (typeof firstNumber === 'number') return String(firstNumber);
      }
      return '';
    };
    const rawAssignTo = it.assign_to_name ?? it.current_assign_user_name ?? it.assigned_user?.name ?? (it.current_assign_user && typeof it.current_assign_user === 'object' ? it.current_assign_user.name : '') ?? '';
    const assignTo = rawAssignTo || (it.assign_to ? normalizeNestedValue(it.assign_to) : '') || '';
    const rawAssignBy = it.assign_by_name ?? it.created_by_user?.name ?? '';
    const assignBy = rawAssignBy || (it.assign_by ? normalizeNestedValue(it.assign_by) : '') || (it.created_by ? normalizeNestedValue(it.created_by) : '') || '';
    const sourceId = it.lead_source?.id ?? it.lead_source_id ?? it.source_id ?? it.sourceId ?? it.lead_source?.value ?? '';
    const mediaTypeId = it.media?.id ?? it.media_type_id ?? it.mediaTypeId ?? it.media_type?.id ?? '';
    const mediaType = normalizeNestedValue(
      it.media ?? it.media_type ?? it.mediaType ?? it.media_type_name ?? it.mediaTypeName ?? it.media_type_id
    );
    return {
      id: String(id),
      brandName,
      productName,
      source,
      sourceId,
      subSource,
      proof,
      dateTime,
      industry,
      industryId,
      pincode,
      city,
      state,
      country,
      assignTo,
      assignBy,
      mediaType,
      mediaTypeId,
    } as MissCampaign;
  });
*/

export async function listMissCampaigns(page = 1, perPage = 10, search?: string, filters?: Record<string, string>): Promise<MissCampaignListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || !value.trim()) return;
      const trimmed = value.trim();

      if (key === 'industry_id') {
        params.set('industry_id', trimmed);
        params.set('industry', trimmed);
      } else if (key === 'lead_source_id') {
        params.set('lead_source_id', trimmed);
        params.set('source', trimmed);
      } else if (key === 'media_type') {
        params.set('media_type', trimmed);
        params.set('media_type_id', trimmed);
      } else {
        params.set(key, trimmed);
      }
    });
  }

  const res = await apiClient.get<MissCampaign[]>(`${ENDPOINTS.LIST}?${params.toString()}`);
  const items = (res.data || []).map((it: any, idx: number) => mapMissCampaignApiToMissCampaign(it, idx));

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

export async function deleteMissCampaign(id: string): Promise<void> {
  const res = await apiClient.delete<unknown>(ENDPOINTS.DELETE(id));
  await handleResponse<unknown>(res);
}

export type PreLead = MissCampaign;
export type PreLeadListResponse = MissCampaignListResponse;
export const listPreLeads = listMissCampaigns;
export const getPreLead = getMissCampaign;
export const deletePreLead = deleteMissCampaign;
