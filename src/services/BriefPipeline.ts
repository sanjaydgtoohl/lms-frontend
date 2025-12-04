import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

export interface Priority {
  id?: number | string;
  name?: string;
}

export interface AssignedUser {
  id?: number | string;
  name?: string;
  email?: string;
}

export interface ContactPerson {
  id?: number | string;
  name?: string;
  email?: string;
}

export interface CreatedByUser {
  id?: number | string;
  name?: string;
  email?: string;
}

export interface BriefStatus {
  id?: number | string;
  name?: string;
}

export interface BriefItem {
  id: string;
  briefId?: string;
  briefName?: string;
  brandName?: string;
  productName?: string;
  contactPerson?: string | ContactPerson;
  modeOfCampaign?: string;
  mediaType?: string;
  priority?: string | Priority;
  budget?: string | number;
  createdBy?: string | CreatedByUser;
  assignTo?: string | AssignedUser;
  status?: string;
  brief_status?: BriefStatus;
  briefDetail?: string;
  comment?: string;
  submissionDate?: string;
  dateTime?: string;
  _raw?: Record<string, unknown>;
  [key: string]: unknown;
}

const ENDPOINTS = {
  LIST: '/briefs',
  DETAIL: (id: string) => `/briefs/${id}`,
  CREATE: '/briefs',
  UPDATE: (id: string) => `/briefs/${id}`,
  DELETE: (id: string) => `/briefs/${id}`,
} as const;


export type BriefListResponse = {
  data: BriefItem[];
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

export async function listBriefs(page = 1, perPage = 10, search?: string): Promise<BriefListResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  if (search && String(search).trim()) params.set('search', String(search).trim());

  const res = await apiClient.get<any>(ENDPOINTS.LIST + `?${params.toString()}`);
  const json = res;
  if (!json || !json.success) {
    const message = (json && (json.message || 'Request failed')) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }

  const items = (json.data || []).map((it: unknown, idx: number) => {
    const raw = it as Record<string, unknown>;
    const idVal = raw['id'] ?? raw['uuid'] ?? raw['code'] ?? `BRF${String(idx + 1).padStart(4, '0')}`;
    const briefNameVal = raw['brief_name'] ?? raw['name'] ?? '';
    const briefIdVal = raw['brief_id'] ?? raw['code'] ?? String(idVal);
    // Handle brand_name which might be an object {id, name} or a string
    const brandRaw = raw['brand_name'] ?? raw['brand'] ?? '';
    const brandNameVal = typeof brandRaw === 'object' && brandRaw !== null && 'name' in brandRaw 
      ? (brandRaw as any).name 
      : String(brandRaw);
    const productNameVal = raw['product_name'] ?? raw['product'] ?? '';
    const contactPersonRaw = raw['contact_person'] ?? raw['contact'] ?? '';
    const contactPersonVal = typeof contactPersonRaw === 'object' && contactPersonRaw !== null 
      ? contactPersonRaw 
      : String(contactPersonRaw);
    const modeVal = raw['mode_of_campaign'] ?? raw['mode'] ?? '';
    const mediaTypeVal = raw['media_type'] ?? '';
    const priorityRaw = raw['priority'] ?? '';
    const priorityVal = typeof priorityRaw === 'object' && priorityRaw !== null 
      ? priorityRaw 
      : String(priorityRaw);
    const budgetVal = raw['budget'] ?? raw['estimated_budget'] ?? '';
    const createdByRaw = raw['created_by_user'] ?? raw['created_by'] ?? raw['creator'] ?? '';
    const createdByVal = typeof createdByRaw === 'object' && createdByRaw !== null 
      ? createdByRaw 
      : String(createdByRaw);
    const assignToRaw = raw['assign_to'] ?? raw['assigned_to'] ?? raw['assigned_user'] ?? '';
    const assignToVal = typeof assignToRaw === 'object' && assignToRaw !== null 
      ? assignToRaw 
      : String(assignToRaw);
    const statusVal = raw['status'] ?? '';
    const briefStatusRaw = raw['brief_status'] ?? raw['status_object'] ?? '';
    const briefStatusVal = typeof briefStatusRaw === 'object' && briefStatusRaw !== null 
      ? briefStatusRaw 
      : {};
    const detailVal = raw['brief_detail'] ?? raw['detail'] ?? '';
    const commentVal = raw['comment'] ?? '';
    const submissionVal = raw['submission_date'] ?? raw['submission'] ?? raw['submitted_at'] ?? raw['dateTime'] ?? '';

    return {
      id: String(idVal),
      briefId: String(briefIdVal ?? ''),
      briefName: String(briefNameVal ?? ''),
      brandName: String(brandNameVal ?? ''),
      productName: String(productNameVal ?? ''),
      contactPerson: contactPersonVal,
      modeOfCampaign: String(modeVal ?? ''),
      mediaType: String(mediaTypeVal ?? ''),
      priority: priorityVal,
      budget: String(budgetVal ?? ''),
      createdBy: createdByVal,
      assignTo: assignToVal,
      status: String(statusVal ?? ''),
      brief_status: briefStatusVal as BriefStatus,
      briefDetail: String(detailVal ?? ''),
      comment: String(commentVal ?? ''),
      submissionDate: String(submissionVal ?? ''),
      dateTime: String(raw['created_at'] ?? raw['date_time'] ?? raw['dateTime'] ?? ''),
      _raw: raw,
    } as BriefItem;
  });

  return {
    data: items,
    meta: (json.meta as any) || {},
  };
}

export async function getBrief(id: string): Promise<BriefItem> {
  const res = await apiClient.get<any>(ENDPOINTS.DETAIL(id));
  const json = res;
  if (!json || !json.success) {
    const message = (json && (json.message || 'Request failed')) || 'Request failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  const raw = json.data as Record<string, unknown>;

  // Normalize single item similar to listBriefs mapping
  const idVal = raw['id'] ?? raw['uuid'] ?? raw['code'] ?? id;
  const briefNameVal = raw['brief_name'] ?? raw['name'] ?? '';
  const briefIdVal = raw['brief_id'] ?? raw['code'] ?? String(idVal);
  const brandRaw = raw['brand_name'] ?? raw['brand'] ?? '';
  const brandNameVal = typeof brandRaw === 'object' && brandRaw !== null && 'name' in brandRaw
    ? (brandRaw as any).name
    : String(brandRaw);
  const productNameVal = raw['product_name'] ?? raw['product'] ?? '';
  const contactPersonRaw = raw['contact_person'] ?? raw['contact'] ?? '';
  const contactPersonVal = typeof contactPersonRaw === 'object' && contactPersonRaw !== null
    ? contactPersonRaw
    : String(contactPersonRaw);
  const modeVal = raw['mode_of_campaign'] ?? raw['mode'] ?? '';
  const mediaTypeVal = raw['media_type'] ?? '';
  const priorityRaw = raw['priority'] ?? '';
  const priorityVal = typeof priorityRaw === 'object' && priorityRaw !== null
    ? priorityRaw
    : String(priorityRaw);
  const budgetVal = raw['budget'] ?? raw['estimated_budget'] ?? '';
  const createdByRaw = raw['created_by_user'] ?? raw['created_by'] ?? raw['creator'] ?? '';
  const createdByVal = typeof createdByRaw === 'object' && createdByRaw !== null
    ? createdByRaw
    : String(createdByRaw);
  const assignToRaw = raw['assign_to'] ?? raw['assigned_to'] ?? raw['assigned_user'] ?? '';
  const assignToVal = typeof assignToRaw === 'object' && assignToRaw !== null
    ? assignToRaw
    : String(assignToRaw);
  const statusVal = raw['status'] ?? '';
  const briefStatusRaw = raw['brief_status'] ?? raw['status_object'] ?? '';
  const briefStatusVal = typeof briefStatusRaw === 'object' && briefStatusRaw !== null
    ? briefStatusRaw
    : {};
  const detailVal = raw['brief_detail'] ?? raw['detail'] ?? '';
  const commentVal = raw['comment'] ?? '';
  const submissionVal = raw['submission_date'] ?? raw['submission'] ?? raw['submitted_at'] ?? raw['dateTime'] ?? '';

  return {
    id: String(idVal),
    briefId: String(briefIdVal ?? ''),
    briefName: String(briefNameVal ?? ''),
    brandName: String(brandNameVal ?? ''),
    productName: String(productNameVal ?? ''),
    contactPerson: contactPersonVal,
    modeOfCampaign: String(modeVal ?? ''),
    mediaType: String(mediaTypeVal ?? ''),
    priority: priorityVal,
    budget: String(budgetVal ?? ''),
    createdBy: createdByVal,
    assignTo: assignToVal,
    status: String(statusVal ?? ''),
    brief_status: briefStatusVal as BriefStatus,
    briefDetail: String(detailVal ?? ''),
    comment: String(commentVal ?? ''),
    submissionDate: String(submissionVal ?? ''),
    dateTime: String(raw['created_at'] ?? raw['date_time'] ?? raw['dateTime'] ?? ''),
    _raw: raw,
  } as BriefItem;
}

export async function createBrief(payload: Partial<BriefItem>): Promise<BriefItem> {
  const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
  const json = res;
  if (!json || !json.success) {
    const message = (json && (json.message || 'Create failed')) || 'Create failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  // normalize single item response
  const items = (json.data ? [json.data] : []) as unknown[];
  const first = items[0] as Record<string, unknown> | undefined;
  return (first && (await listBriefs(1, 1)).data[0]) ?? ({ id: String(first?.['id'] ?? first?.['_id'] ?? ''), _raw: first } as BriefItem);
}

export async function updateBrief(id: string, payload: Partial<BriefItem>): Promise<BriefItem> {
  const res = await apiClient.put<any>(ENDPOINTS.UPDATE(id), payload);
  const json = res;
  if (!json || !json.success) {
    const message = (json && (json.message || 'Update failed')) || 'Update failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
  return ({ id: String(id), ...(json.data || {}) } as BriefItem);
}

export async function deleteBrief(id: string): Promise<void> {
  const res = await apiClient.delete<any>(ENDPOINTS.DELETE(id));
  const json = res;
  if (!json || !json.success) {
    const message = (json && (json.message || 'Delete failed')) || 'Delete failed';
    try { useUiStore.getState().pushError(message); } catch {}
    throw new Error(message);
  }
}

export default {
  listBriefs,
  getBrief,
  createBrief,
  updateBrief,
  deleteBrief,
};
