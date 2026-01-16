import { API_ENDPOINTS } from '../constants';
import type { LoginCredentials } from '../types';
import { setCookie, deleteCookie, getCookie } from '../utils/cookies';
import sessionManager from './sessionManager';
import http from './http';

// API Response structure based on the actual API
export interface LoginApiResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: {
    token: string;
    refreshToken: string;
    token_type: string;
    expires_in: number;
  };
}

// Error response structure
export interface LoginErrorResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  details?: any;
}

class LoginService {
  constructor() {}

  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise with login response data
   * 
   */
  async login(credentials: LoginCredentials): Promise<LoginApiResponse['data']> {
    try {
      // Use axios http instance so cookies and interceptors are applied consistently.
      const body = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
      }).toString();

      const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data: LoginApiResponse | LoginErrorResponse = response.data;

  if (response.status < 200 || response.status >= 300 || !data.success) {
        const errorData = data as LoginErrorResponse & { errors?: any };
        // Try to extract any detailed errors returned by the API
        const rawDetails = (data as any).errors || (data as any).details || null;
        let detailsStr = '';

        if (rawDetails) {
          if (typeof rawDetails === 'string') {
            detailsStr = rawDetails;
          } else if (Array.isArray(rawDetails)) {
            detailsStr = rawDetails.join('; ');
          } else if (typeof rawDetails === 'object') {
            // flatten object values (arrays or strings) into a single string
            detailsStr = Object.values(rawDetails)
              .flatMap((v: any) => (Array.isArray(v) ? v : [v]))
              .join('; ');
          } else {
            detailsStr = String(rawDetails);
          }
        }

        const fullMessage = detailsStr
          ? `${errorData.message}${detailsStr ? `: ${detailsStr}` : ''}`
          : (errorData.message || 'Login failed');

        const err = new Error(fullMessage);
        // attach raw response for callers who may need it
        (err as any).responseData = data;
        throw err;
      }

      const successData = data as LoginApiResponse;
      // Store tokens in cookies (note: HttpOnly cookies should be set by server for best security)
      const now = Date.now();
      const token = successData.data.token;
      // Accept both refreshToken and refresh_token for compatibility
      const refreshToken = (successData.data as any).refresh_token || (successData.data as any).refreshToken;
      const expiresIn = successData.data.expires_in || 3600;
      setCookie('auth_token', token, { expires: expiresIn, secure: true, sameSite: 'Lax' });
      setCookie('auth_token_expires', String(now + expiresIn * 1000), { expires: expiresIn, secure: true, sameSite: 'Lax' });
      if (refreshToken) {
        const refreshExpiresIn = (successData.data as any).refresh_expires_in || 7 * 24 * 3600;
        setCookie('refresh_token', refreshToken, { expires: refreshExpiresIn, secure: true, sameSite: 'Lax' });
        setCookie('refresh_token_expires', String(now + refreshExpiresIn * 1000), { expires: refreshExpiresIn, secure: true, sameSite: 'Lax' });
      }

      // Start session timer based on cookies
      sessionManager.startSessionFromCookies();

      return successData.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      // Use axios http instance; interceptor will attach auth header if token present
      await http.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout service error:', error);
    } finally {
      // Always clear local storage regardless of API call success
      this.clearTokens();
      sessionManager.clearSession();
    }
  }

  /**
   * Clear all stored authentication tokens
   */
  clearTokens(): void {
    deleteCookie('auth_token');
    deleteCookie('token_type');
    deleteCookie('expires_in');
    deleteCookie('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiresIn = getCookie('auth_token_expires');
    
    if (!token || !expiresIn) {
      return false;
    }

    // expires cookie stores epoch ms as string
    const tokenExpiry = parseInt(expiresIn, 10);
    const currentTime = Date.now();
    return currentTime < tokenExpiry;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    // Read token from cookie
    try {
      // avoid importing cookie utils in many places; simple accessor below
      const name = 'auth_token';
      const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get token type
   */
  getTokenType(): string | null {
    return getCookie('token_type');
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): number | null {
    const expires = getCookie('auth_token_expires');
    return expires ? parseInt(expires, 10) : null;
  }
}

// Create and export a singleton instance
export const loginService = new LoginService();
export default loginService;
