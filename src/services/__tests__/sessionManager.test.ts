import { refreshTokens } from '../sessionManager';
import { postRefreshToken } from '../auth/refreshAccessToken';
import * as http from '../http';
import { getCookie, deleteCookie } from '../../utils/cookies';
import { store } from '../../redux/store';
import { injectAuthStore } from '../../redux/authTokenBridge';

describe('sessionManager.refreshTokens', () => {
  beforeAll(() => {
    injectAuthStore(store);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    deleteCookie('refresh_token');
    deleteCookie('refresh_token_expires');
    deleteCookie('auth_token');
    deleteCookie('auth_token_expires');
  });

  it('uses expires_in from API and stores expiry in Redux', async () => {
    document.cookie = 'refresh_token=test-refresh; Path=/';
    const before = Date.now();

    const mockResp = {
      data: {
        success: true,
        data: {
          token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
        },
      },
    };

    jest.spyOn(http as any, 'post').mockResolvedValue(mockResp);

    await refreshTokens();

    const auth = store.getState().auth;
    expect(auth.token).toBe('new-access-token');
    expect(auth.expiresIn).toBe(3600);
    expect(auth.tokenExpiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000 - 1000);
    expect(getCookie('refresh_token')).toBe('new-refresh-token');
  });
});

describe('postRefreshToken', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends refresh token in Authorization header and body', async () => {
    jest.spyOn(http as any, 'post').mockResolvedValue({ data: { success: true } });

    await postRefreshToken('my-refresh-token');

    expect((http as any).post).toHaveBeenCalledWith(
      '/auth/refresh',
      { refresh_token: 'my-refresh-token' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-refresh-token',
        }),
      })
    );
  });
});
