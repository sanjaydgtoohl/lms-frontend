import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

export type CreateMissCampaignPayload = {
  // form fields used by the Create UI
  productName?: string; // will map to `name`
  name?: string;
  brandId?: string | number;
  brand_id?: string | number;
  brandName?: string | number; // sometimes UI sends id in this field
  source?: string | number; // will map to lead_source_id
  lead_source_id?: string | number;
  subSource?: string | number; // will map to lead_sub_source_id
  lead_sub_source_id?: string | number;
  image?: File | null; // file object
  [key: string]: any;
};

const ENDPOINTS = {
  CREATE: '/miss-campaigns',
  UPDATE: (id: string | number) => `/miss-campaigns/${id}`,
} as const;

async function handleResponse<T>(res: any): Promise<T> {
  if (!res || !res.success) {
    const error = new Error((res && (res.message || 'Request failed')) || 'Request failed');
    try { handleApiError(error); } catch {}
    throw error;
  }
  return res.data as T;
}

/**
 * Create miss campaign using multipart/form-data (supports image upload)
 */
export async function createMissCampaign(payload: CreateMissCampaignPayload): Promise<any> {
  try {
    const form = new FormData();

    // Name / product
    const nameVal = payload.productName ?? payload.name ?? '';
    if (nameVal !== undefined) form.append('name', String(nameVal));

    // Brand id - prefer explicit numeric id fields
    const brandVal = payload.brand_id ?? payload.brandId ?? payload.brandName;
    if (brandVal !== undefined && brandVal !== null && String(brandVal) !== '') {
      form.append('brand_id', String(brandVal));
    }

    // Lead source and sub source ids
    const leadSource = payload.lead_source_id ?? payload.source;
    if (leadSource !== undefined && leadSource !== null && String(leadSource) !== '') {
      form.append('lead_source_id', String(leadSource));
    }

    const leadSubSource = payload.lead_sub_source_id ?? payload.subSource;
    if (leadSubSource !== undefined && leadSubSource !== null && String(leadSubSource) !== '') {
      form.append('lead_sub_source_id', String(leadSubSource));
    }

    // If image file provided, append using the API key expected by server
    const file = payload.image ?? payload.image_path ?? payload.imagePath;
    if (file instanceof File) {
      form.append('image_path', file);
    }

    // append any extra simple fields
    if (payload.status !== undefined) form.append('status', String(payload.status));

    const res = await apiClient.post(ENDPOINTS.CREATE, form);
    return handleResponse<any>(res);
  } catch (error) {
    try { handleApiError(error as Error); } catch {}
    throw error;
  }
}

/**
 * Update miss campaign using multipart/form-data (supports image upload)
 */
export async function updateMissCampaignWithForm(id: string | number, payload: CreateMissCampaignPayload): Promise<any> {
  try {
    const form = new FormData();

    const nameVal = payload.productName ?? payload.name;
    if (nameVal !== undefined) form.append('name', String(nameVal));

    const brandVal = payload.brand_id ?? payload.brandId ?? payload.brandName;
    if (brandVal !== undefined && brandVal !== null && String(brandVal) !== '') {
      form.append('brand_id', String(brandVal));
    }

    const leadSource = payload.lead_source_id ?? payload.source;
    if (leadSource !== undefined && leadSource !== null && String(leadSource) !== '') {
      form.append('lead_source_id', String(leadSource));
    }

    const leadSubSource = payload.lead_sub_source_id ?? payload.subSource;
    if (leadSubSource !== undefined && leadSubSource !== null && String(leadSubSource) !== '') {
      form.append('lead_sub_source_id', String(leadSubSource));
    }

    const file = payload.image ?? payload.image_path ?? payload.imagePath;
    if (file instanceof File) {
      form.append('image_path', file);
    }

    if (payload.status !== undefined) form.append('status', String(payload.status));

    const res = await apiClient.put(ENDPOINTS.UPDATE(id), form);
    return handleResponse<any>(res);
  } catch (error) {
    try { handleApiError(error as Error); } catch {}
    throw error;
  }
}

export default {
  createMissCampaign,
  updateMissCampaignWithForm,
};
