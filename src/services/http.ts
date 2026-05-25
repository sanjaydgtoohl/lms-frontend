import axios from 'axios';
import type { AxiosResponse, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import {
  getAccessToken,
  getRefreshToken,
  persistAuthTokens,
} from './auth/tokenStorage';
import { parseRefreshResponse, postRefreshToken } from './auth/refreshAccessToken';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
};

class Http {
  instance: AxiosInstance;
  isRefreshing = false;
  refreshPromise: Promise<string | null> | null = null;
  requestQueue: Array<(token: string | null) => void> = [];

  private notifyUnauthorizedSession() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:force-logout'));
    }
  }

  private clearClientAuthState() {
    this.notifyUnauthorizedSession();
  }

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    this.instance.interceptors.request.use((config: RetryableRequestConfig) => {
      if (!config.skipAuth) {
        const token = getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      if (
        config.data &&
        typeof config.data === 'object' &&
        config.data.constructor?.name === 'FormData'
      ) {
        if (config.headers?.['Content-Type']) {
          delete config.headers['Content-Type'];
        }
      } else if (config.headers && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    });

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => res,
      async (error: any) => {
        const originalRequest = error.config as RetryableRequestConfig;
        const status = error?.response?.status;
        const requestUrl = String(originalRequest?.url || '');
        const isRefreshRequest = requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH);
        const isLoginRequest = requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN);

        if (status === 401 && isRefreshRequest) {
          this.requestQueue.forEach((cb) => cb(null));
          this.requestQueue = [];
          return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry && !isLoginRequest) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
              this.clearSessionAndRedirect();
              return Promise.reject(error);
            }

            this.refreshPromise = postRefreshToken(refreshToken)
              .then((resp: AxiosResponse<any>) => {
                const parsed = parseRefreshResponse(resp.data, refreshToken);
                if (!parsed) {
                  this.clearSessionAndRedirect();
                  throw new Error('Refresh failed');
                }

                persistAuthTokens({
                  token: parsed.accessToken,
                  expiresIn: parsed.expiresIn,
                  refreshToken: parsed.refreshToken,
                  refreshExpiresIn: parsed.refreshExpiresIn,
                });

                const freshToken = getAccessToken() || parsed.accessToken;
                this.requestQueue.forEach((cb) => cb(freshToken));
                this.requestQueue = [];
                return freshToken;
              })
              .catch((err) => {
                this.clearSessionAndRedirect();
                throw err;
              })
              .finally(() => {
                this.isRefreshing = false;
                this.refreshPromise = null;
              });
          }

          return new Promise((resolve, reject) => {
            this.requestQueue.push((token: string | null) => {
              if (!token) {
                reject(error);
                return;
              }
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.instance(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  clearSessionAndRedirect() {
    this.clearClientAuthState();
  }

  autoLogoutDueToMissingToken() {
    this.clearClientAuthState();
  }
}

export const http = new Http().instance;
export default http;
