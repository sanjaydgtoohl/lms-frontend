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

  it('should refresh with Bearer header and store access token in Redux', async () => {
    document.cookie = 'refresh_token=test-refresh; Path=/';

    const mockResp = {
      data: {
        success: true,
        data: {
          token: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expires_in: 120,
          refresh_expires_in: 300,
        },
      },
    };

    jest.spyOn(http as any, 'post').mockResolvedValue(mockResp);

    const result = await refreshTokens();

    expect(result).toBeDefined();
    expect((http as any).post).toHaveBeenCalledWith(
      '/auth/refresh',
      { refresh_token: 'test-refresh' },
      expect.objectContaining({
        skipAuth: true,
        headers: expect.objectContaining({
          Authorization: 'Bearer test-refresh',
        }),
      })
    );
    expect(store.getState().auth.token).toBe('new-access-token');
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
