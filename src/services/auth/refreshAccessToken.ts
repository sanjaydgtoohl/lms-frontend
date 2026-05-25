import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../../constants';
import http from '../http';
import { normalizeAuthTokenResponse, type AuthTokenApiData } from './tokenExpiry';

type RefreshRequestConfig = {
  skipAuth: true;
  headers: Record<string, string>;
};

export async function postRefreshToken(
  refreshToken: string
): Promise<AxiosResponse<{ success: boolean; data?: AuthTokenApiData; message?: string }>> {
  return http.post(
    API_ENDPOINTS.AUTH.REFRESH,
    { refresh_token: refreshToken },
    {
      skipAuth: true,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    } as RefreshRequestConfig
  );
}

export function parseRefreshResponse(
  data: { success?: boolean; data?: AuthTokenApiData } | undefined,
  fallbackRefreshToken: string
) {
  if (!data?.success || !data.data?.token) return null;

  const normalized = normalizeAuthTokenResponse({
    ...data.data,
    refresh_token: data.data.refresh_token || data.data.refreshToken || fallbackRefreshToken,
  });

  return normalized;
}
