import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import type { 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse, 
  User, 
  Course
} from '../types';
import { authService } from '.';
import http from './http';
import { handleApiError } from '../utils/apiErrorHandler';

class ApiClient {
    // Public method to allow custom requests
    async customRequest<T>(endpoint: string, options: { method?: string; data?: any } = {}): Promise<ApiResponse<T>> {
      return this.request<T>(endpoint, options);
    }
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private resolveUrl(endpoint: string): string {
    if (/^https?:\/\//.test(endpoint)) {
      return endpoint;
    }
    const normalizedBase = this.baseURL.replace(/\/$/, '');
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${normalizedBase}${normalizedEndpoint}`;
  }

  private async request<T>(endpoint: string, options: { method?: string; data?: any } = {}): Promise<ApiResponse<T>> {
    try {
      const method = (options.method || 'GET').toUpperCase();
      const url = this.resolveUrl(endpoint);
      const resp = await http.request({ url, method, data: options.data });
      const data = resp.data as ApiResponse<T>;

      if (!data || !data.success) {
        throw new Error((data && (data as any).message) || 'API Error');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      handleApiError(error, false);
      throw error;
    }
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use the dedicated authService for proper API handling
    const response = await authService.login(credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        data: userData,
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

  async refreshToken(): Promise<AuthResponse> {

    // Do not send refreshToken in body; rely on cookie
    const response = await this.request<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      data: {},
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response.data;
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
      data: courseData,
    });
    return response.data;
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const response = await this.request<Course>(API_ENDPOINTS.COURSES.UPDATE(id), {
      method: 'PUT',
      data: courseData,
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
    // store token in cookie (recommend server-set HttpOnly cookie instead)
    try {
      // default expiry 1 hour
      const expires = 3600;
      // write cookie via document.cookie
      document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${expires}; Secure; SameSite=Lax`;
    } catch (e) {
      // ignore
    }
  }

  clearToken(): void {
    // Clear cookies
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  isAuthenticated(): boolean {
    const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent('auth_token') + '=([^;]*)'));
    return !!(match && match[1]);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
