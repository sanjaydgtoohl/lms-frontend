import { dispatchAuthAction, getAccessToken, getTokenExpiresAt, isAccessTokenValid } from '../../redux/authTokenBridge';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookies';

const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_TOKEN_EXPIRES_KEY = 'refresh_token_expires';

export { getAccessToken, getTokenExpiresAt, isAccessTokenValid };

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function persistAuthTokens(params: {
  token: string;
  expiresIn: number;
  refreshToken?: string | null;
  refreshExpiresIn?: number;
}): void {
  const tokenExpiresAt = Date.now() + params.expiresIn * 1000;

  dispatchAuthAction({
    type: 'auth/setTokens',
    payload: {
      token: params.token,
      tokenExpiresAt,
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
