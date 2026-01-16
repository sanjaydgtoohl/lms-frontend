// src/services/Header.ts
import http from './http';
export async function fetchCurrentUser() {
  try {
    const response = await http.get('/auth/me');
    return response.data?.data || {};
  } catch (error: any) {
    // Log the error for debugging
    console.error('Failed to fetch current user:', error?.response?.status, error?.message);
    
    // If 401, let the interceptor handle token refresh
    if (error?.response?.status === 401) {
      throw error;
    }
    
    return {};
  }
}
