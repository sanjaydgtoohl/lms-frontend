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

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use the dedicated login service for proper API handling
    const response = await loginService.login(credentials);
    
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

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

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

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
