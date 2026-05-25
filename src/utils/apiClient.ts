/**
 * Enhanced API Client with retry logic and token refresh via Redux state.
 */

import { API_BASE_URL } from '../constants';
import {
  getAccessToken,
  getRefreshToken,
  persistAuthTokens,
} from '../services/auth/tokenStorage';
import { parseRefreshResponse, postRefreshToken } from '../services/auth/refreshAccessToken';

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
  private defaultTimeout = 30000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private isRetryableError(statusCode?: number): boolean {
    if (!statusCode) return false;
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    );
  }

  private forceLogoutAndRedirect(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:force-logout'));
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      const resp = await postRefreshToken(refreshToken);
      const parsed = parseRefreshResponse(resp.data, refreshToken);

      if (!parsed) return false;

      persistAuthTokens({
        token: parsed.token,
        expiresIn: parsed.expiresIn,
        tokenExpiresAt: parsed.tokenExpiresAt,
        refreshToken: parsed.refreshToken,
        refreshExpiresIn: parsed.refreshExpiresIn,
      });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      retries = 0,
      retryDelay = 1000,
      skipAuth = false,
      timeout = this.defaultTimeout,
      ...fetchConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const isFormDataBody = (fetchConfig as any).body instanceof FormData;
    const baseAuthHeaders = this.getAuthHeaders();

    if (isFormDataBody) {
      delete (baseAuthHeaders as any)['Content-Type'];
    }

    const headers = skipAuth
      ? isFormDataBody
        ? { ...(fetchConfig.headers || {}) }
        : { 'Content-Type': 'application/json', ...(fetchConfig.headers || {}) }
      : { ...baseAuthHeaders, ...(fetchConfig.headers || {}) };

    let lastError: Error | null = null;
    let statusCode: number | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
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

        if (response.status === 401 && !skipAuth && attempt === 0) {
          const refreshed = await this.handleTokenRefresh();
          if (refreshed) {
            const newToken = getAccessToken();
            if (newToken) {
              (headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
            }
            continue;
          }

          this.forceLogoutAndRedirect();
          throw new Error('Session expired. Unable to refresh token.');
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const error = new Error(data.message || `Request failed with status ${response.status}`);
          (error as any).statusCode = response.status;
          (error as any).responseData = data;
          throw error;
        }

        if (!data.success && data.success !== undefined) {
          throw new Error(data.message || 'Request failed');
        }

        return data as ApiResponse<T>;
      } catch (error: any) {
        lastError = error;

        if (error.name === 'AbortError' || !this.isRetryableError(statusCode)) {
          throw error;
        }

        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
    }

    if (lastError) throw lastError;
    throw new Error('Request failed');
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new EnhancedApiClient(API_BASE_URL);
export default apiClient;
