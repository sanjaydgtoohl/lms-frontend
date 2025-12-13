import loginService from './Login';
import sessionManager from './sessionManager';
import { getCookie } from '../utils/cookies';

/**
 * Lightweight auth facade that re-exports common authentication operations
 * to provide a single, clear public API for the app to use.
 */
class AuthService {
  async login(credentials: { email: string; password: string }) {
    return loginService.login(credentials);
  }

  async logout() {
    return loginService.logout();
  }

  /**
   * Force-refresh tokens by delegating to sessionManager
   * Returns refreshed token data when successful.
   */
  async refresh() {
    return sessionManager.refreshTokens();
  }

  startSessionFromCookies() {
    return sessionManager.startSessionFromCookies();
  }

  clearSession() {
    return sessionManager.clearSession();
  }

  getAccessToken(): string | null {
    return getCookie('auth_token');
  }

  getRefreshToken(): string | null {
    return getCookie('refresh_token');
  }

  isAuthenticated(): boolean {
    return loginService.isAuthenticated();
  }
}

const authService = new AuthService();
export default authService;
