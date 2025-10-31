import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import type { 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse, 
  User, 
  Course
} from '../types';
import { loginService } from './Login';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshTokenValue: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    this.refreshTokenValue = localStorage.getItem('refresh_token');
  }

  private async handleTokenRefresh() {
    if (!this.refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshTokenValue }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Token refresh failed');
      }

      // Save new tokens
      this.setToken(data.data.token);
      if (data.data.refresh_token) this.setRefreshToken(data.data.refresh_token);

      // Return full auth data so callers can use additional fields
      return {
        token: data.data.token,
        refresh_token: data.data.refresh_token || this.refreshTokenValue,
        token_type: data.data.token_type,
        expires_in: data.data.expires_in,
      } as unknown as AuthResponse;
    } catch (error) {
      // Use centralized handler to clear auth store and redirect to login
      try {
        const authUtils = await import('../utils/auth');
        authUtils.handleTokenExpiration();
      } catch (e) {
        // Fallback: clear local tokens and redirect
        this.clearToken();
        window.location.href = '/login';
      }
      throw error;
    }
  }

  // NOTE: removed unused refreshTokenIfNeeded helper - refresh is handled inline in `request`

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const makeRequest = async (token: string | null) => {
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

  console.debug('[api] making request', endpoint, { hasToken: !!token });
  const response = await fetch(url, config);
  const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || data?.message?.toLowerCase().includes('token expired') || data?.message?.toLowerCase().includes('invalid token')) {
          throw new Error('Token expired');
        }
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    };

    try {
      return await makeRequest(this.token);
    } catch (error) {
      if (error instanceof Error && error.message === 'Token expired' && this.refreshTokenValue) {
        // Try to refresh the token
        console.debug('[api] token expired, attempting refresh');
        try {
          const refreshed = await this.handleTokenRefresh();
          console.debug('[api] token refreshed, retrying original request');
          return await makeRequest(refreshed.token);
        } catch (refreshError) {
          console.warn('[api] refresh failed, expiring session', refreshError);
          try {
            const authUtils = await import('../utils/auth');
            authUtils.handleTokenExpiration();
          } catch (e) {
            this.clearToken();
            window.location.href = '/login';
          }
          throw refreshError;
        }
      }
      throw error;
    }
  }

  // Public refresh method used by stores/components when needed
  async refreshToken(): Promise<AuthResponse> {
    console.debug('[api] explicit refreshToken() called');
    const data = await this.handleTokenRefresh();
    console.debug('[api] explicit refreshToken() result', { token: !!data?.token });
    return data as AuthResponse;
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use the dedicated login service for proper API handling
    const response = await loginService.login(credentials);
    
    if (response.token) {
      this.setToken(response.token);
      if (response.refresh_token) {
        this.setRefreshToken(response.refresh_token);
      }
    }

    return response;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }



  async getProfile(): Promise<User> {
    const response = await this.request<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }

  // Course Methods
  async getCourses(): Promise<Course[]> {
    const response = await this.request<Course[]>(API_ENDPOINTS.COURSES.LIST);
    return response.data;
  }

  async getCourse(id: string): Promise<Course> {
    const response = await this.request<Course>(API_ENDPOINTS.COURSES.DETAIL(id));
    return response.data;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const response = await this.request<Course>(API_ENDPOINTS.COURSES.CREATE, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return response.data;
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const response = await this.request<Course>(API_ENDPOINTS.COURSES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    return response.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await this.request(API_ENDPOINTS.COURSES.DELETE(id), {
      method: 'DELETE',
    });
  }

  async enrollInCourse(id: string): Promise<void> {
    await this.request(API_ENDPOINTS.COURSES.ENROLL(id), {
      method: 'POST',
    });
  }

  // Token Management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  setRefreshToken(token: string): void {
    this.refreshTokenValue = token;
    localStorage.setItem('refresh_token', token);
  }

  clearToken(): void {
    this.token = null;
    this.refreshTokenValue = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.refreshTokenValue;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;