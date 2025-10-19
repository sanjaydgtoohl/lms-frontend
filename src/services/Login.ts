import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import type { LoginCredentials } from '../types';

// API Response structure based on the actual API
export interface LoginApiResponse {
  status_code: number;
  data: {
    token: string;
    token_type: string;
    expires_in: number;
  };
}

// Error response structure
export interface LoginErrorResponse {
  status_code: number;
  message: string;
  details?: any;
}

class LoginService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise with login response data
   */
  async login(credentials: LoginCredentials): Promise<LoginApiResponse['data']> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data: LoginApiResponse | LoginErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as LoginErrorResponse;
        throw new Error(errorData.message || 'Login failed');
      }

      const successData = data as LoginApiResponse;
      
      // Store token in localStorage
      if (successData.data.token) {
        localStorage.setItem('auth_token', successData.data.token);
        localStorage.setItem('token_type', successData.data.token_type);
        localStorage.setItem('expires_in', successData.data.expires_in.toString());
      }

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
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout service error:', error);
    } finally {
      // Always clear local storage regardless of API call success
      this.clearTokens();
    }
  }

  /**
   * Clear all stored authentication tokens
   */
  clearTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expiresIn = localStorage.getItem('expires_in');
    
    if (!token || !expiresIn) {
      return false;
    }

    // Check if token is expired
    const tokenExpiry = parseInt(expiresIn) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime < tokenExpiry;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get token type
   */
  getTokenType(): string | null {
    return localStorage.getItem('token_type');
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): number | null {
    const expiresIn = localStorage.getItem('expires_in');
    return expiresIn ? parseInt(expiresIn) : null;
  }
}

// Create and export a singleton instance
export const loginService = new LoginService(API_BASE_URL);
export default loginService;
