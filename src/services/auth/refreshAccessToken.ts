import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../../constants';
import http from '../http';

export interface RefreshTokenPayload {
  token: string;
  refresh_token?: string;
  refreshToken?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

type RefreshRequestConfig = {
  skipAuth: true;
  headers: Record<string, string>;
};

/**
 * Call POST /auth/refresh.
 * Backend expects refresh token in Authorization header (Bearer).
 * Body includes refresh_token for compatibility with validation rules.
 */
export async function postRefreshToken(
  refreshToken: string
): Promise<AxiosResponse<{ success: boolean; data?: RefreshTokenPayload; message?: string }>> {
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
  data: { success?: boolean; data?: RefreshTokenPayload } | undefined,
  fallbackRefreshToken: string
): { accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number } | null {
  if (!data?.success || !data.data?.token) return null;

  const payload = data.data;
  return {
    accessToken: payload.token,
    refreshToken: payload.refresh_token || payload.refreshToken || fallbackRefreshToken,
    expiresIn: payload.expires_in || 3600,
    refreshExpiresIn: payload.refresh_expires_in || 7 * 24 * 3600,
  };
}
