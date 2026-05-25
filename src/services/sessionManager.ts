import { getTokenExpiresAt } from './auth/tokenStorage';
import {
  clearAuthTokens,
  getRefreshToken,
  persistAuthTokens,
} from './auth/tokenStorage';
import { parseRefreshResponse, postRefreshToken } from './auth/refreshAccessToken';
import { getRefreshDelayMs } from './auth/tokenExpiry';

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

  const timeout = getRefreshDelayMs(expiresAt);

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

    const resp = await postRefreshToken(refreshToken);
    const parsed = parseRefreshResponse(resp.data, refreshToken);

    if (!parsed) {
      throw new Error('Refresh failed');
    }

    persistAuthTokens({
      token: parsed.token,
      expiresIn: parsed.expiresIn,
      tokenExpiresAt: parsed.tokenExpiresAt,
      refreshToken: parsed.refreshToken,
      refreshExpiresIn: parsed.refreshExpiresIn,
    });

    scheduleRefresh();
    return resp.data?.data;
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
