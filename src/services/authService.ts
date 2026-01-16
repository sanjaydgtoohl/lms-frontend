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
    const result = await sessionManager.refreshTokens();
    console.log('[AuthService] Token refreshed successfully');
    return result;
  }

  startSessionFromCookies() {
    return sessionManager.startSessionFromCookies();
  }

  clearSession() {
    return sessionManager.clearSession();
  }

  /**
   * Check if token is missing from cookies and trigger auto-logout if needed.
   * Returns true if token was missing, false otherwise.
   */
  checkAndHandleMissingToken() {
    return sessionManager.checkAndHandleMissingToken();
  }

  /**
   * Clear all auth-related items from local storage
   */
  clearLocalStorage() {
    return sessionManager.clearLocalStorage();
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
