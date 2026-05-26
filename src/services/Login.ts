import { API_ENDPOINTS } from '../constants';
import type { LoginCredentials } from '../types';
import http from './http';
import { extractErrorMessage } from '../utils/extractErrorMessage';

export interface LoginApiResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: {
    token: string;
    refreshToken?: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    refresh_expires_in?: number;
  };
}

export interface LoginErrorResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  details?: unknown;
}

class LoginService {
  async login(credentials: LoginCredentials): Promise<LoginApiResponse['data']> {
    try {
      const body = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
      }).toString();

      const response = await http.post(API_ENDPOINTS.AUTH.LOGIN, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data: LoginApiResponse | LoginErrorResponse = response.data;

      if (response.status < 200 || response.status >= 300 || !data.success) {
        const errorData = data as LoginErrorResponse & { errors?: unknown };
        const rawDetails = (data as any).errors || (data as any).details || null;
        let detailsStr = '';

        if (rawDetails) {
          if (typeof rawDetails === 'string') {
            detailsStr = rawDetails;
          } else if (Array.isArray(rawDetails)) {
            detailsStr = rawDetails.join('; ');
          } else if (typeof rawDetails === 'object') {
            detailsStr = Object.values(rawDetails)
              .flatMap((v: unknown) => (Array.isArray(v) ? v : [v]))
              .join('; ');
          } else {
            detailsStr = String(rawDetails);
          }
        }

        const fullMessage = detailsStr
          ? `${errorData.message}${detailsStr ? `: ${detailsStr}` : ''}`
          : errorData.message || 'Login failed';

        const err = new Error(fullMessage);
        (err as any).responseData = data;
        throw err;
      }

      return (data as LoginApiResponse).data;
    } catch (error: unknown) {
      console.error('Login service error:', error);

      const responseData = (error as { response?: { data?: unknown } })?.response?.data;
      if (responseData && typeof responseData === 'object') {
        throw new Error(extractErrorMessage(responseData));
      }

      if (error instanceof Error && !/status code \d{3}/.test(error.message)) {
        throw error;
      }

      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async logout(): Promise<void> {
    try {
      await http.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout service error:', error);
    }
  }
}

export const loginService = new LoginService();
export default loginService;
