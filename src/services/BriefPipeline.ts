import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

export interface BriefItem {
  id: string;
  briefId?: string;
  briefName?: string;
  brandName?: string;
  productName?: string;
  contactPerson?: string;
  modeOfCampaign?: string;
  mediaType?: string;
  priority?: string;
  budget?: string | number;
  createdBy?: string;
  assignTo?: string;
  status?: string;
  briefDetail?: string;
  submissionDate?: string;
  dateTime?: string;
  _raw?: Record<string, unknown>;
  [key: string]: unknown;
}

const ENDPOINTS = {
  LIST: '/briefs',
  DETAIL: (id: string) => `/briefs/${id}`,
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

  const res = await apiClient.get<BriefItem[]>(ENDPOINTS.LIST + `?${params.toString()}`);
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
    const brandNameVal = raw['brand_name'] ?? raw['brand'] ?? '';
    const productNameVal = raw['product_name'] ?? raw['product'] ?? '';
    const contactPersonVal = raw['contact_person'] ?? raw['contact'] ?? '';
    const modeVal = raw['mode_of_campaign'] ?? raw['mode'] ?? '';
    const mediaTypeVal = raw['media_type'] ?? '';
    const priorityVal = raw['priority'] ?? '';
    const budgetVal = raw['budget'] ?? raw['estimated_budget'] ?? '';
    const createdByVal = raw['created_by'] ?? raw['creator'] ?? '';
    const assignToVal = raw['assign_to'] ?? raw['assigned_to'] ?? '';
    const statusVal = raw['status'] ?? '';
    const detailVal = raw['brief_detail'] ?? raw['detail'] ?? '';
    const submissionVal = raw['submission_date'] ?? raw['submission'] ?? raw['submitted_at'] ?? raw['dateTime'] ?? '';

    return {
      id: String(idVal),
      briefId: String(briefIdVal ?? ''),
      briefName: String(briefNameVal ?? ''),
      brandName: String(brandNameVal ?? ''),
      productName: String(productNameVal ?? ''),
      contactPerson: String(contactPersonVal ?? ''),
      modeOfCampaign: String(modeVal ?? ''),
      mediaType: String(mediaTypeVal ?? ''),
      priority: String(priorityVal ?? ''),
      budget: String(budgetVal ?? ''),
      createdBy: String(createdByVal ?? ''),
      assignTo: String(assignToVal ?? ''),
      status: String(statusVal ?? ''),
      briefDetail: String(detailVal ?? ''),
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
