/**
 * Enhanced API Client with retry logic and better error handling
 */

import { API_BASE_URL, API_ENDPOINTS } from '../constants';
// keep api error helpers available if needed in the future
// import { handleApiError, extractErrorMessage } from './apiErrorHandler';
import { useAuthStore } from '../store/auth';
import { getCookie } from '../utils/cookies';
import http from '../services/http';

export interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  timeout?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    status_code: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class EnhancedApiClient {
  private baseURL: string;
  private defaultTimeout = 30000; // 30 seconds

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HeadersInit {
    const token = getCookie('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(statusCode?: number): boolean {
    if (!statusCode) return false;
    // Retry on network errors, timeouts, and 5xx errors
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create timeout promise
   */
  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    );
  }

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const authStore = useAuthStore.getState();
      const { refreshTokenValue } = authStore;
      
      if (!refreshTokenValue) {
        return false;
      }
      // Use axios http instance to call the refresh endpoint so it benefits from the same baseURL and cookie handling
      const resp = await http.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: refreshTokenValue });
      const data = resp.data;
      if (data && data.success && data.data?.token) {
        authStore.login('', ''); // Update token in store (store may be updated elsewhere as well)
        // Use cookie helper behavior: set cookies via document.cookie here (server should set HttpOnly in production)
        const now = Date.now();
        const access = data.data.token;
        const refresh = data.data.refreshToken;
        const expiresIn = data.data.expires_in || 3600;
        const refreshExpiresIn = data.data.refresh_expires_in || null;

        document.cookie = `auth_token=${encodeURIComponent(access)}; Path=/; Max-Age=${expiresIn}; Secure; SameSite=Lax`;
        document.cookie = `auth_token_expires=${String(now + expiresIn * 1000)}; Path=/; Max-Age=${expiresIn}; Secure; SameSite=Lax`;
        if (refresh) {
          const rExp = refreshExpiresIn || 7 * 24 * 3600;
          document.cookie = `refresh_token=${encodeURIComponent(refresh)}; Path=/; Max-Age=${rExp}; Secure; SameSite=Lax`;
          document.cookie = `refresh_token_expires=${String(now + rExp * 1000)}; Path=/; Max-Age=${rExp}; Secure; SameSite=Lax`;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Main request method with retry logic
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      retries = 0,
      retryDelay = 1000,
      skipAuth = false,
      timeout = this.defaultTimeout,
      ...fetchConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const headers = skipAuth
      ? { 'Content-Type': 'application/json', ...fetchConfig.headers }
      : { ...this.getAuthHeaders(), ...fetchConfig.headers };

    let lastError: Error | null = null;
    let statusCode: number | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create timeout race
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await Promise.race([
          fetch(url, {
            ...fetchConfig,
            headers,
            signal: controller.signal,
          }),
          this.createTimeout(timeout),
        ]).finally(() => clearTimeout(timeoutId));

        statusCode = response.status;

        // Handle 401 Unauthorized - try token refresh
        if (response.status === 401 && !skipAuth && attempt === 0) {
            const refreshed = await this.handleTokenRefresh();
            if (refreshed) {
              // Retry with new token
              (headers as any).Authorization = `Bearer ${getCookie('auth_token')}`;
              continue;
            } else {
            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const error = new Error(data.message || `Request failed with status ${response.status}`);
          (error as any).statusCode = response.status;
          (error as any).responseData = data;
          throw error;
        }

        // Validate response structure
        if (!data.success && data.success !== undefined) {
          throw new Error(data.message || 'Request failed');
        }

        return data as ApiResponse<T>;
      } catch (error: any) {
        lastError = error;

        // Don't retry on abort (timeout) or non-retryable errors
        if (error.name === 'AbortError' || !this.isRetryableError(statusCode)) {
          throw error;
        }

        // If this is not the last attempt, wait and retry
        if (attempt < retries) {
          const delayTime = retryDelay * Math.pow(2, attempt); // Exponential backoff
          await this.delay(delayTime);
          continue;
        }
      }
    }

    // All retries failed
    if (lastError) {
      throw lastError;
    }

    throw new Error('Request failed');
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new EnhancedApiClient(API_BASE_URL);
export default apiClient;

