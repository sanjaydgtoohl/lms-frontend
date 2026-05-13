import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';
import type { ContactPersonsListResponse, ContactPerson, ContactPersonRaw } from '../types/agency';


const ENDPOINTS = {
  LIST_BY_AGENCY: (agencyId: string) => `/leads/contact-persons/by-agency/${encodeURIComponent(agencyId)}`,
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

export async function getContactPersonsByAgency(agencyId: string): Promise<ContactPersonsListResponse> {
  const res = await apiClient.get<ContactPersonRaw[]>(ENDPOINTS.LIST_BY_AGENCY(agencyId));
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
      phone: (raw.mobile_number && raw.mobile_number.length > 0) ? raw.mobile_number[0] : '',
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
      createdAt: raw.created_at || '',
      updatedAt: raw.updated_at || '',
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
    phone: (raw.mobile_number && raw.mobile_number.length > 0) ? raw.mobile_number[0] : '',
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
    createdAt: raw.created_at || '',
    updatedAt: raw.updated_at || '',
    _raw: raw,
  };
}
