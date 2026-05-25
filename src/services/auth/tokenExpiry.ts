import { jwtDecode } from 'jwt-decode';

const DEFAULT_ACCESS_TTL_SEC = 3600;
const DEFAULT_REFRESH_TTL_SEC = 7 * 24 * 3600;
/** Refresh this long before access token expires */
export const REFRESH_BEFORE_MS = 5 * 60 * 1000;
/** Treat access token as expired this early (clock skew / API latency) */
export const ACCESS_TOKEN_BUFFER_MS = 60 * 1000;
export const MIN_REFRESH_DELAY_MS = 30 * 1000;

export interface AuthTokenApiData {
  token: string;
  refresh_token?: string;
  refreshToken?: string;
  expires_in?: number | string | null;
  refresh_expires_in?: number | string | null;
  token_type?: string;
}

export function parseExpiresIn(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const seconds = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.floor(seconds);
}

export function parseExpiresInFromJwt(token: string): number | null {
  try {
    const decoded = jwtDecode<{ exp?: number; iat?: number }>(token);
    if (decoded.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      return Math.max(decoded.exp - nowSec, 1);
    }
    if (decoded.iat) {
      return DEFAULT_ACCESS_TTL_SEC;
    }
  } catch {
    // ignore invalid jwt
  }
  return null;
}

/** Resolve access token lifetime in seconds — API expires_in is source of truth, JWT as fallback */
export function resolveAccessExpiresIn(token: string, expiresIn?: unknown): number {
  return (
    parseExpiresIn(expiresIn) ??
    parseExpiresInFromJwt(token) ??
    DEFAULT_ACCESS_TTL_SEC
  );
}

/** Absolute expiry timestamp (ms) from token + expires_in */
export function resolveAccessTokenExpiresAt(token: string, expiresIn?: unknown): number {
  const ttlSec = resolveAccessExpiresIn(token, expiresIn);
  return Date.now() + ttlSec * 1000;
}

export function resolveRefreshExpiresIn(refreshExpiresIn?: unknown): number {
  return parseExpiresIn(refreshExpiresIn) ?? DEFAULT_REFRESH_TTL_SEC;
}

export function normalizeAuthTokenResponse(data: AuthTokenApiData) {
  const expiresIn = resolveAccessExpiresIn(data.token, data.expires_in);
  const refreshExpiresIn = resolveRefreshExpiresIn(data.refresh_expires_in);

  return {
    token: data.token,
    refreshToken: data.refresh_token || data.refreshToken || null,
    expiresIn,
    refreshExpiresIn,
    tokenExpiresAt: Date.now() + expiresIn * 1000,
  };
}

/** When to run the next proactive refresh (ms from now) */
export function getRefreshDelayMs(tokenExpiresAt: number): number {
  const msUntilExpiry = tokenExpiresAt - Date.now();
  if (msUntilExpiry <= 0) return 0;
  return Math.max(msUntilExpiry - REFRESH_BEFORE_MS, MIN_REFRESH_DELAY_MS);
}

export function isTokenExpiresAtValid(tokenExpiresAt: number | null | undefined): boolean {
  if (!tokenExpiresAt) return false;
  return Date.now() < tokenExpiresAt - ACCESS_TOKEN_BUFFER_MS;
}

export function getSecondsUntilExpiry(tokenExpiresAt: number | null | undefined): number {
  if (!tokenExpiresAt) return 0;
  return Math.max(Math.floor((tokenExpiresAt - Date.now()) / 1000), 0);
}
