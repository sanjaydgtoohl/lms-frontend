import { apiClient, type ApiResponse as ClientApiResponse } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';
import type { ApiResponse } from '../types/common/api.types';

export { apiClient };
export type { ApiResponse, ClientApiResponse };

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function buildPaginationQuery(
  page: number,
  perPage: number,
  extra?: Record<string, unknown>
): string {
  return buildQuery({ page, per_page: perPage, ...extra });
}

export async function assertSuccess<T>(
  res: ClientApiResponse<T> | null | undefined,
  showNotification = true
): Promise<T> {
  if (!res?.success) {
    const error = new Error(res?.message || 'Request failed');
    (error as Error & { responseData?: unknown }).responseData = res;
    try {
      handleApiError(error, showNotification);
    } catch {
      // handleApiError may throw after showing toast
    }
    throw error;
  }
  return res.data as T;
}

export async function getData<T>(path: string): Promise<T> {
  const res = await apiClient.get<T>(path);
  return assertSuccess(res);
}

export async function postData<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<T>(path, body);
  return assertSuccess(res);
}

export async function putData<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<T>(path, body);
  return assertSuccess(res);
}

export async function patchData<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiClient.patch<T>(path, body);
  return assertSuccess(res);
}

export async function deleteData(path: string): Promise<void> {
  const res = await apiClient.delete<unknown>(path);
  await assertSuccess(res);
}

export function normalizeApiDate(raw?: unknown): string {
  if (!raw) return '';
  try {
    let s = String(raw).trim();
    s = s.replace(/\.(\d{3})\d*Z$/, '.$1Z');
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) s = `${s}Z`;
    const d = new Date(s);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleString();
  } catch {
    return String(raw);
  }
}

export function stripIdPrefix(id: string): string {
  return id.replace(/^#/, '');
}

export function extractNumericId(id: string): string {
  return String(id).replace(/\D/g, '');
}
