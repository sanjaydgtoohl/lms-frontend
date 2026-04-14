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
  pincode?: string;
  city?: string | number;
  city_id?: string | number;
  state?: string | number;
  state_id?: string | number;
  country?: string | number;
  country_id?: string | number;
  mediaType?: string;
  media_type?: string;
  media_type_id?: string | number;
  media_type_name?: string;
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
    try { handleApiError(error); } catch {
      //no need to action
    }
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

    // Media type helper
    if (payload.mediaType !== undefined && payload.mediaType !== null && String(payload.mediaType) !== '') {
      form.append('media_type', String(payload.mediaType));
      if (!Number.isNaN(Number(payload.mediaType))) {
        form.append('media_type_id', String(payload.mediaType));
      }
    }
    if (payload.media_type !== undefined && payload.media_type !== null && String(payload.media_type) !== '') {
      form.append('media_type', String(payload.media_type));
      if (!Number.isNaN(Number(payload.media_type))) {
        form.append('media_type_id', String(payload.media_type));
      }
    }
    if (payload.media_type_id !== undefined && payload.media_type_id !== null && String(payload.media_type_id) !== '') {
      form.append('media_type_id', String(payload.media_type_id));
    }
    if (payload.media_type_name !== undefined && payload.media_type_name !== null && String(payload.media_type_name) !== '') {
      form.append('media_type_name', String(payload.media_type_name));
    }

    const knownKeys = new Set([
      'productName', 'name', 'brandId', 'brand_id', 'brandName', 'source', 'lead_source_id',
      'subSource', 'lead_sub_source_id', 'image', 'image_path', 'imagePath', 'status', 'mediaType', 'media_type', 'media_type_id', 'media_type_name'
    ]);

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (knownKeys.has(key)) return;
      if (key === 'mediaType' || key === 'media_type') return;
      if (key === 'image' || key === 'image_path' || key === 'imagePath') return;
      form.append(key, String(value));
    });

    if (payload.status !== undefined) form.append('status', String(payload.status));

    const res = await apiClient.post(ENDPOINTS.CREATE, form);
    return handleResponse<any>(res);
  } catch (error) {
    try { handleApiError(error as Error); } catch {
      //no need to action
    }
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

    if (payload.mediaType !== undefined && payload.mediaType !== null && String(payload.mediaType) !== '') {
      form.append('media_type', String(payload.mediaType));
      if (!Number.isNaN(Number(payload.mediaType))) {
        form.append('media_type_id', String(payload.mediaType));
      }
    }
    if (payload.media_type !== undefined && payload.media_type !== null && String(payload.media_type) !== '') {
      form.append('media_type', String(payload.media_type));
      if (!Number.isNaN(Number(payload.media_type))) {
        form.append('media_type_id', String(payload.media_type));
      }
    }
    if (payload.media_type_id !== undefined && payload.media_type_id !== null && String(payload.media_type_id) !== '') {
      form.append('media_type_id', String(payload.media_type_id));
    }
    if (payload.media_type_name !== undefined && payload.media_type_name !== null && String(payload.media_type_name) !== '') {
      form.append('media_type_name', String(payload.media_type_name));
    }

    const knownKeys = new Set([
      'productName', 'name', 'brandId', 'brand_id', 'brandName', 'source', 'lead_source_id',
      'subSource', 'lead_sub_source_id', 'image', 'image_path', 'imagePath', 'status', 'mediaType', 'media_type', 'media_type_id', 'media_type_name'
    ]);

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (knownKeys.has(key)) return;
      if (key === 'mediaType' || key === 'media_type') return;
      if (key === 'image' || key === 'image_path' || key === 'imagePath') return;
      form.append(key, String(value));
    });

    if (payload.status !== undefined) form.append('status', String(payload.status));
    if (!form.has('_method')) form.append('_method', 'PUT');

    const res = await apiClient.post(ENDPOINTS.UPDATE(id), form);
    return handleResponse<any>(res);
  } catch (error) {
    try { handleApiError(error as Error); } catch {
      //no need to action
    }
    throw error;
  }
}

export const createPreLead = createMissCampaign;
export const updatePreLeadWithForm = updateMissCampaignWithForm;

export default {
  createMissCampaign,
  updateMissCampaignWithForm,
  createPreLead,
  updatePreLeadWithForm,
};
