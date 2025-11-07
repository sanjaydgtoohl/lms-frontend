import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';
import { apiClient } from '../services/api';
import { loginService } from '../services/Login';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  refreshTokenValue: string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login({ email, password });
          set({
            user: null, // User data not returned in login response
            token: response.token,
            refreshTokenValue: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Update localStorage
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
          }
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: Partial<User> & { password: string }) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register(userData);
          set({
            user: null, // User data not returned in register response
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await loginService.logout();
        } catch (error) {
          // Even if logout API call fails, clear local state
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshTokenValue: null,
            isAuthenticated: false,
            isLoading: false,
          });
          
          // Clear all auth-related localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('expires_in');
        }
      },

      refreshToken: async () => {
        try {
          const currentToken = get().refreshTokenValue || localStorage.getItem('refresh_token');
          if (!currentToken) {
            throw new Error('No refresh token available');
          }
          
          // apiClient.refreshToken doesn't take parameters, it reads from localStorage
          const response = await apiClient.refreshToken();
          set({
            user: null, // User data not returned in refresh response
            token: response.token,
            refreshTokenValue: response.refreshToken,
            isAuthenticated: true,
          });
          
          // Update localStorage
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
          }
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
