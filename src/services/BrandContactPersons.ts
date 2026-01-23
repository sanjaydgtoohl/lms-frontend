import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

// API Response Interfaces
export interface ContactPersonRelation {
  id: number;
  name: string;
  email?: string;
}

export interface BrandRelation {
  id: number;
  name: string;
}

export interface UserRelation {
  id: number;
  name: string;
  email: string;
}

export interface RelationItem {
  id: number;
  name: string;
  slug?: string;
}

export interface LocationRelation {
  id: number;
  name: string;
}

export interface ContactPersonRaw {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  email: string | null;
  profile_url: string | null;
  mobile_number: string[];
  type: string;
  status: string;
  comment: string | null;
  brand_id: number;
  created_by: number;
  agency_id: number | null;
  current_assign_user: number;
  priority_id: number;
  lead_status: number;
  designation_id: number;
  department_id: number;
  sub_source_id: number;
  country_id: number;
  state_id: number;
  city_id: number;
  zone_id: number;
  postal_code: string;
  call_status: number;
  call_attempt: number;
  call_status_relation: RelationItem | null;
  lead_status_relation: RelationItem | null;
  brand: BrandRelation;
  agency: BrandRelation | null;
  created_by_user: UserRelation;
  assigned_user: UserRelation;
  priority: RelationItem;
  designation: RelationItem;
  department: RelationItem;
  sub_source: RelationItem;
  country: LocationRelation;
  state: LocationRelation;
  city: LocationRelation;
  zone: LocationRelation;
  status_relation: RelationItem | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ContactPerson {
  id: string;
  uuid: string;
  name: string;
  email: string | null;
  phone: string;
  designation: string;
  department: string;
  brand: string;
  priority: string;
  leadStatus: string;
  callStatus: string;
  assignedUser: string;
  assignedUserEmail: string;
  country: string;
  state: string;
  city: string;
  zone: string;
  postalCode: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  // Keep raw for extended access
  _raw?: ContactPersonRaw;
}

export type ContactPersonsListResponse = {
  data: ContactPerson[];
  meta?: {
    timestamp?: string;
    status_code?: number;
  }
};

const ENDPOINTS = {
  LIST_BY_BRAND: (brandId: string) => `/leads/contact-persons/by-brand/${encodeURIComponent(brandId)}`,
  DETAIL: (id: string) => `/leads/contact-persons/${encodeURIComponent(id)}`,
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

export async function getContactPersonsByBrand(brandId: string): Promise<ContactPersonsListResponse> {
  const res = await apiClient.get<ContactPersonRaw[]>(ENDPOINTS.LIST_BY_BRAND(brandId));
  const json = res;

  if (!json || !json.success) {
    const message = (json as any)?.message || (json as any)?.error || 'Request failed';
    const error = new Error(message);
    (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
    (error as any).responseData = json;
    handleApiError(error);
    throw error;
  }

  const items = (json.data || []).map((raw: ContactPersonRaw): ContactPerson => {
    return {
      id: String(raw.id),
      uuid: raw.uuid,
      name: raw.name || '',
      email: raw.email || null,
      phone: (Array.isArray(raw.mobile_number) && raw.mobile_number.length > 0) ? raw.mobile_number[0] : '',
      designation: raw.designation?.name || '',
      department: raw.department?.name || '',
      brand: raw.brand?.name || '',
      priority: raw.priority?.name || '',
      leadStatus: raw.lead_status_relation?.name || '',
      callStatus: raw.call_status_relation?.name || '',
      assignedUser: raw.assigned_user?.name || '',
      assignedUserEmail: raw.assigned_user?.email || '',
      country: raw.country?.name || '',
      state: raw.state?.name || '',
      city: raw.city?.name || '',
      zone: raw.zone?.name || '',
      postalCode: raw.postal_code || '',
      comment: raw.comment || null,
      createdAt: raw.created_at ? raw.created_at.replace(/ (AM|PM)$/, '') : '',
      updatedAt: raw.updated_at ? raw.updated_at.replace(/ (AM|PM)$/, '') : '',
      _raw: raw,
    };
  });

  return {
    data: items,
    meta: (json.meta as any) || {},
  };
}

export async function getContactPersonDetail(id: string): Promise<ContactPerson> {
  const res = await apiClient.get<ContactPersonRaw>(ENDPOINTS.DETAIL(id));
  const raw = await handleResponse<ContactPersonRaw>(res);

  return {
    id: String(raw.id),
    uuid: raw.uuid,
    name: raw.name || '',
    email: raw.email || null,
    phone: (Array.isArray(raw.mobile_number) && raw.mobile_number.length > 0) ? raw.mobile_number[0] : '',
    designation: raw.designation?.name || '',
    department: raw.department?.name || '',
    brand: raw.brand?.name || '',
    priority: raw.priority?.name || '',
    leadStatus: raw.lead_status_relation?.name || '',
    callStatus: raw.call_status_relation?.name || '',
    assignedUser: raw.assigned_user?.name || '',
    assignedUserEmail: raw.assigned_user?.email || '',
    country: raw.country?.name || '',
    state: raw.state?.name || '',
    city: raw.city?.name || '',
    zone: raw.zone?.name || '',
    postalCode: raw.postal_code || '',
    comment: raw.comment || null,
    createdAt: raw.created_at ? raw.created_at.replace(/ (AM|PM)$/, '') : '',
    updatedAt: raw.updated_at ? raw.updated_at.replace(/ (AM|PM)$/, '') : '',
    _raw: raw,
  };
}
