import { refreshTokens } from '../sessionManager';
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

  it('should call refresh endpoint, store access token in Redux, and refresh token in cookies', async () => {
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
    expect(store.getState().auth.token).toBe('new-access-token');
    expect(getCookie('refresh_token')).toBe('new-refresh-token');
    expect(getCookie('auth_token')).toBeNull();
  });
});
