import { API_ENDPOINTS } from '../constants';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import http from './http';

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

  const expires = getCookie('auth_token_expires');
  if (!expires) return;

  const expiryMs = parseInt(expires, 10);
  const now = Date.now();

  // schedule 5 minutes (300000 ms) before expiry
  const msBeforeRefresh = expiryMs - now - 5 * 60 * 1000;

  const timeout = Math.max(msBeforeRefresh, 0);

  refreshTimer = window.setTimeout(async () => {
    try {
      await refreshTokens();
    } catch (err) {
      // refresh failed — clear session (http interceptor will redirect)
      deleteCookie('auth_token');
      deleteCookie('refresh_token');
      deleteCookie('auth_token_expires');
      deleteCookie('refresh_token_expires');
      window.location.href = '/login';
    }
  }, timeout);
}

export async function refreshTokens() {
  if (refreshInProgress) return;
  refreshInProgress = true;
  try {
    const refreshToken = getCookie('refresh_token');
    console.log('[sessionManager] refresh_token cookie:', refreshToken);
    if (!refreshToken) throw new Error('No refresh token');

    // If backend expects token in header, uncomment below and comment body
    // const resp = await http.post(API_ENDPOINTS.AUTH.REFRESH, {}, {
    //   headers: { Authorization: `Bearer ${refreshToken}` }
    // });

    // Default: send in body
    const resp = await http.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const data = resp.data;
    if (data && data.success && data.data) {
      const now = Date.now();
      const access = data.data.token;
      const refresh = data.data.refreshToken;
      const expiresIn = data.data.expires_in;
      const refreshExpiresIn = data.data.refresh_expires_in || null;

      if (access) {
        setCookie('auth_token', access, { expires: expiresIn, secure: true, sameSite: 'Lax' });
        setCookie('auth_token_expires', String(now + expiresIn * 1000), { expires: expiresIn, secure: true, sameSite: 'Lax' });
      }
      if (refresh) {
        const rExp = refreshExpiresIn || 7 * 24 * 3600;
        setCookie('refresh_token', refresh, { expires: rExp, secure: true, sameSite: 'Lax' });
        setCookie('refresh_token_expires', String(now + rExp * 1000), { expires: rExp, secure: true, sameSite: 'Lax' });
      }

      // reschedule
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
  deleteCookie('auth_token');
  deleteCookie('refresh_token');
  deleteCookie('auth_token_expires');
  deleteCookie('refresh_token_expires');
}

export function startSessionFromCookies() {
  // If auth token exists, schedule the refresh
  const token = getCookie('auth_token');
  if (token) scheduleRefresh();
}

export default {
  scheduleRefresh,
  refreshTokens,
  clearSession,
  startSessionFromCookies,
};
