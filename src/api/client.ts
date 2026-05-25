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

/** Normalize list payloads from varied API response shapes */
export function extractListItems<T = Record<string, unknown>>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.data)) return root.data as T[];
  const nested = root.data as Record<string, unknown> | undefined;
  if (nested) {
    for (const key of ['data', 'items', 'roles', 'users']) {
      if (Array.isArray(nested[key])) return nested[key] as T[];
    }
  }
  for (const key of ['roles', 'users', 'items']) {
    if (Array.isArray(root[key])) return root[key] as T[];
  }
  return [];
}

export interface SelectOption {
  label: string;
  value: string;
}

export function mapToSelectOptions(
  items: Record<string, unknown>[],
  config: { idKeys?: string[]; labelKeys?: string[] }
): SelectOption[] {
  const idKeys = config.idKeys ?? ['id', 'value'];
  const labelKeys = config.labelKeys ?? ['name', 'title', 'label'];
  return items
    .map((it) => {
      const rawId =
        idKeys.map((k) => it[k]).find((v) => v != null && v !== '') ?? '';
      const numeric = String(rawId).replace(/[^0-9]/g, '') || String(rawId);
      const label = labelKeys
        .map((k) => it[k])
        .find((v) => v != null && String(v).trim() !== '');
      return {
        label: String(label ?? ''),
        value: String(numeric),
      };
    })
    .filter((o) => o.label && o.value);
}
