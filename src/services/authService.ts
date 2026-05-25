import loginService from './Login';
import sessionManager from './sessionManager';
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
} from './auth/tokenStorage';

class AuthService {
  async login(credentials: { email: string; password: string }) {
    return loginService.login(credentials);
  }

  async logout() {
    return loginService.logout();
  }

  async refresh() {
    return sessionManager.refreshTokens();
  }

  startSessionFromCookies() {
    return sessionManager.startSessionFromCookies();
  }

  clearSession() {
    return sessionManager.clearSession();
  }

  checkAndHandleMissingToken() {
    return sessionManager.checkAndHandleMissingToken();
  }

  getAccessToken(): string | null {
    return getAccessToken();
  }

  getRefreshToken(): string | null {
    return getRefreshToken();
  }

  isAuthenticated(): boolean {
    return isAccessTokenValid() || Boolean(getRefreshToken());
  }
}

const authService = new AuthService();
export default authService;
