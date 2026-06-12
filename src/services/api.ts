import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import type { LoginCredentials, AuthResponse, ApiResponse, User, Course } from '../types';
import http from './http';
import loginService from './Login';
import sessionManager from './sessionManager';
import { handleApiError } from '../utils/apiErrorHandler';

class ApiClient {
  async customRequest<T>(
    endpoint: string,
    options: { method?: string; data?: unknown } = {}
  ): Promise<ApiResponse<T>> {
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

  private async request<T>(
    endpoint: string,
    options: { method?: string; data?: unknown } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const method = (options.method || 'GET').toUpperCase();
      const url = this.resolveUrl(endpoint);
      const resp = await http.request({ url, method, data: options.data });
      const data = resp.data as ApiResponse<T>;

      if (!data || !data.success) {
        throw new Error((data && (data as any).message) || 'API Error');
      }

      return data;
    } catch (error: unknown) {
      console.error('API Error:', error);
      handleApiError(error, false);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return loginService.login(credentials) as Promise<AuthResponse>;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      data: userData,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
    } catch {
      // Logout clears client state regardless of API result
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    return sessionManager.refreshTokens() as Promise<AuthResponse>;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }

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
    await this.request(API_ENDPOINTS.COURSES.DELETE(id), { method: 'DELETE' });
  }

  async enrollInCourse(id: string): Promise<void> {
    await this.request(API_ENDPOINTS.COURSES.ENROLL(id), { method: 'POST' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
