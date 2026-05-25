import { ENDPOINTS } from '../constants/endpoints';
import { apiClient, assertSuccess } from './client';
import type { CallStatusOption } from '../types/lead/lead.types';

export type { CallStatusOption };

export interface PriorityOption {
  id: number | string;
  name: string;
  slug?: string;
  [key: string]: unknown;
}

export async function listCallStatuses(): Promise<CallStatusOption[]> {
  const res = await apiClient.get<CallStatusOption[]>(ENDPOINTS.CALL_STATUSES.LIST);
  return (res.data || []) as CallStatusOption[];
}

/** Alias for listCallStatuses — backward compatible */
export const getCallStatuses = listCallStatuses;

export async function listPriorities(): Promise<PriorityOption[]> {
  const res = await apiClient.get<PriorityOption[]>(ENDPOINTS.PRIORITIES.LIST);
  return (res.data || []) as PriorityOption[];
}

/** Alias for listPriorities — backward compatible */
export const getPriorities = listPriorities;

export async function listPrioritiesByCallStatus(
  callStatusId: string | number
): Promise<PriorityOption[]> {
  const res = await apiClient.get<PriorityOption[]>(
    ENDPOINTS.CALL_STATUSES.PRIORITIES(callStatusId)
  );
  return (res.data || []) as PriorityOption[];
}

/** Alias for listPrioritiesByCallStatus — backward compatible */
export const getPrioritiesByCallStatus = listPrioritiesByCallStatus;

export async function updateLeadCallStatus(
  leadId: string | number,
  callStatusId: string | number
): Promise<void> {
  const res = await apiClient.post(ENDPOINTS.LEADS.CALL_STATUS(leadId), {
    call_status_id: callStatusId,
    _method: 'Put',
  });
  await assertSuccess(res);
}

/** Alias for updateLeadCallStatus — backward compatible */
export const updateCallStatus = updateLeadCallStatus;

export async function assignLead(
  leadId: string | number,
  payload: Record<string, unknown>
): Promise<unknown> {
  const res = await apiClient.put(ENDPOINTS.LEADS.ASSIGN(leadId), payload);
  return assertSuccess(res);
}

export async function listBrandsFlat(): Promise<Array<{ id: number | string; name: string }>> {
  const res = await apiClient.get<Array<{ id: number | string; name: string }>>(
    ENDPOINTS.BRANDS.LIST_FLAT
  );
  return (res.data || []) as Array<{ id: number | string; name: string }>;
}

export async function listAgenciesFlat(): Promise<Array<{ id: number | string; name: string }>> {
  const res = await apiClient.get<Array<{ id: number | string; name: string }>>(
    ENDPOINTS.AGENCIES.LIST_FLAT
  );
  return (res.data || []) as Array<{ id: number | string; name: string }>;
}

export async function listChildUsers(
  perPage = 1000
): Promise<Array<{ id: number | string; name: string }>> {
  const res = await apiClient.get<Array<{ id: number | string; name: string }>>(
    `${ENDPOINTS.USERS.CHILD_USERS}?per_page=${perPage}`
  );
  return (res.data || []) as Array<{ id: number | string; name: string }>;
}

export async function listLeadTypes(): Promise<Array<{ id: number | string; name: string }>> {
  const res = await apiClient.get<Array<{ id: number | string; name: string }>>(
    ENDPOINTS.LEAD_TYPES.LIST
  );
  return (res.data || []) as Array<{ id: number | string; name: string }>;
}

export async function createLeadType(payload: {
  name: string;
}): Promise<{ id: number | string; name: string }> {
  const res = await apiClient.post<{ id: number | string; name: string }>(
    ENDPOINTS.LEAD_TYPES.CREATE,
    payload
  );
  return assertSuccess(res);
}
