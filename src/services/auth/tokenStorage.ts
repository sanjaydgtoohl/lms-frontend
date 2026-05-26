import { dispatchAuthAction, getAccessToken, getTokenExpiresAt, isAccessTokenValid } from '../../redux/authTokenBridge';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookies';
import {
  getSecondsUntilExpiry,
  normalizeAuthTokenResponse,
  type AuthTokenApiData,
} from './tokenExpiry';

const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_TOKEN_EXPIRES_KEY = 'refresh_token_expires';

export { getAccessToken, getTokenExpiresAt, isAccessTokenValid, getSecondsUntilExpiry };
export type { AuthTokenApiData };
export { normalizeAuthTokenResponse };

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function persistAuthTokensFromApi(data: AuthTokenApiData): ReturnType<typeof normalizeAuthTokenResponse> {
  const normalized = normalizeAuthTokenResponse(data);
  persistAuthTokens(normalized);
  return normalized;
}

export function persistAuthTokens(params: {
  token: string;
  expiresIn: number;
  tokenExpiresAt: number;
  refreshToken?: string | null;
  refreshExpiresIn?: number;
}): void {
  dispatchAuthAction({
    type: 'auth/setTokens',
    payload: {
      token: params.token,
      tokenExpiresAt: params.tokenExpiresAt,
      expiresIn: params.expiresIn,
    },
  });

  if (params.refreshToken) {
    const refreshExpiresIn = params.refreshExpiresIn ?? 7 * 24 * 3600;
    const refreshExpiresAt = Date.now() + refreshExpiresIn * 1000;
    setCookie(REFRESH_TOKEN_KEY, params.refreshToken, {
      expires: refreshExpiresIn,
      secure: true,
      sameSite: 'Lax',
    });
    setCookie(REFRESH_TOKEN_EXPIRES_KEY, String(refreshExpiresAt), {
      expires: refreshExpiresIn,
      secure: true,
      sameSite: 'Lax',
    });
  }
}

export function clearAuthTokens(): void {
  dispatchAuthAction({ type: 'auth/forceLogout' });
  deleteCookie(REFRESH_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_EXPIRES_KEY);
  deleteCookie('auth_token');
  deleteCookie('auth_token_expires');
}
