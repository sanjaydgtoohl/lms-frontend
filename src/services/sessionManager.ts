import { API_ENDPOINTS } from '../constants';
import http from './http';
import { getTokenExpiresAt } from './auth/tokenStorage';
import {
  clearAuthTokens,
  getRefreshToken,
  persistAuthTokens,
} from './auth/tokenStorage';

let refreshTimer: number | null = null;
let refreshInProgress = false;

function clearTimer() {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export async function scheduleRefresh() {
  clearTimer();

  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return;

  const msBeforeRefresh = expiresAt - Date.now() - 5 * 60 * 1000;
  const timeout = Math.max(msBeforeRefresh, 0);

  refreshTimer = window.setTimeout(async () => {
    try {
      await refreshTokens();
    } catch {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:force-logout'));
      }
    }
  }, timeout);
}

export async function refreshTokens() {
  if (refreshInProgress) return;
  refreshInProgress = true;

  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const resp = await http.post(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken },
      { skipAuth: true } as any
    );

    const data = resp.data;
    if (data && data.success && data.data) {
      const access = data.data.token;
      const refresh =
        (data.data as any).refresh_token ||
        (data.data as any).refreshToken ||
        refreshToken;
      const expiresIn = data.data.expires_in || 3600;
      const refreshExpiresIn = (data.data as any).refresh_expires_in || 7 * 24 * 3600;

      if (access) {
        persistAuthTokens({
          token: access,
          expiresIn,
          refreshToken: refresh,
          refreshExpiresIn,
        });
      }

      scheduleRefresh();
      return data.data;
    }

    throw new Error('Refresh failed');
  } finally {
    refreshInProgress = false;
  }
}

export function clearSession() {
  clearTimer();
}

export function clearAuthSession() {
  clearTimer();
  clearAuthTokens();
}

export function startSessionFromCookies() {
  scheduleRefresh();
}

export function checkAndHandleMissingToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:force-logout'));
    }
    return true;
  }
  return false;
}

export default {
  scheduleRefresh,
  refreshTokens,
  clearSession,
  clearAuthSession,
  startSessionFromCookies,
  checkAndHandleMissingToken,
};
