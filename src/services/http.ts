import axios from 'axios';
import type { AxiosResponse, AxiosInstance } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

// Single axios instance used across the app. Interceptors attach the latest token
// from cookies and will attempt a refresh when a 401 is encountered.
class Http {
  instance: AxiosInstance;
  isRefreshing = false;
  refreshPromise: Promise<any> | null = null;
  requestQueue: Array<(token: string | null) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // use any here to avoid strict axios internal types mismatch in interceptor callbacks
    this.instance.interceptors.request.use((config: any) => {
      const token = getCookie('auth_token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => res,
      async (error: any) => {
        const originalRequest = (error.config as any) as { _retry?: boolean } & Record<string, any>;
        const status = error?.response?.status;

        if (status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            const refreshToken = getCookie('refresh_token');

            if (!refreshToken) {
              // No refresh token -> clear session
              this.clearSessionAndRedirect();
              return Promise.reject(error);
            }

            // Call refresh endpoint
            this.refreshPromise = this.instance
              .post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
              .then((resp: AxiosResponse<any>) => {
                const data = resp.data;
                if (data && data.success && data.data) {
                  const access = data.data.token;
                  const refresh = data.data.refreshToken;
                  const expiresIn = data.data.expires_in;
                  const refreshExpiresIn = data.data.refresh_expires_in || null;

                  // store tokens in cookies and also store expiry timestamps
                  const now = Date.now();
                  if (access) {
                    setCookie('auth_token', access, { expires: expiresIn, secure: true, sameSite: 'Lax' });
                    setCookie('auth_token_expires', String(now + expiresIn * 1000), { expires: expiresIn, secure: true, sameSite: 'Lax' });
                  }
                  if (refresh) {
                    const rExp = refreshExpiresIn || 7 * 24 * 3600; // fallback 7 days
                    setCookie('refresh_token', refresh, { expires: rExp, secure: true, sameSite: 'Lax' });
                    setCookie('refresh_token_expires', String(now + rExp * 1000), { expires: rExp, secure: true, sameSite: 'Lax' });
                  }

                  // Drain queue
                  this.requestQueue.forEach((cb) => cb(access));
                  this.requestQueue = [];
                  return access;
                }

                // Refresh failed
                this.clearSessionAndRedirect();
                throw new Error('Refresh failed');
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

          // queue the request until refresh resolves
          return new Promise((resolve, reject) => {
            this.requestQueue.push((token: string | null) => {
              if (!token) {
                reject(error);
                return;
              }
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              // call axios with any to avoid strict typing mismatch
              resolve((this.instance as any)(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  clearSessionAndRedirect() {
    deleteCookie('auth_token');
    deleteCookie('refresh_token');
    deleteCookie('auth_token_expires');
    deleteCookie('refresh_token_expires');
    // force navigation
    window.location.href = '/login';
  }
}

export const http = new Http().instance;
export default http;
