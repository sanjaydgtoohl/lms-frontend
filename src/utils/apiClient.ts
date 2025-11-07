/**
 * Enhanced API Client with retry logic and better error handling
 */

import { API_BASE_URL } from '../constants';
import { handleApiError, extractErrorMessage } from './apiErrorHandler';
import { useAuthStore } from '../store/auth';

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
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(statusCode?: number, error?: Error): boolean {
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

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.token) {
        authStore.login('', ''); // Update token in store
        localStorage.setItem('auth_token', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refresh_token', data.data.refreshToken);
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
            headers.Authorization = `Bearer ${localStorage.getItem('auth_token')}`;
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
        if (error.name === 'AbortError' || !this.isRetryableError(statusCode, error)) {
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

