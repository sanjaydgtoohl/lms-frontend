import { refreshTokens } from '../sessionManager';
import * as http from '../http';
import { getCookie, deleteCookie } from '../../utils/cookies';

describe('sessionManager.refreshTokens', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    // clear cookies set during tests
    deleteCookie('auth_token');
    deleteCookie('refresh_token');
    deleteCookie('auth_token_expires');
    deleteCookie('refresh_token_expires');
  });

  it('should call refresh endpoint and set cookies when refresh token valid', async () => {
    // Arrange: set a refresh token cookie
    document.cookie = 'refresh_token=test-refresh; Path=/';

    const mockResp = {
      data: {
        success: true,
        data: {
          token: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expires_in: 120, // seconds
          refresh_expires_in: 300,
        },
      },
    };

  jest.spyOn(http as any, 'post').mockResolvedValue(mockResp);

    // Act
    const result = await refreshTokens();

    // Assert
    expect(result).toBeDefined();
    expect(getCookie('auth_token')).toBe('new-access-token');
    expect(getCookie('refresh_token')).toBe('new-refresh-token');
    const expires = getCookie('auth_token_expires');
    expect(expires).not.toBeNull();
  });
});
