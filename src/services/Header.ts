// src/services/Header.ts
import axios from 'axios';
import { useAuthStore } from '../store/auth';

export async function fetchCurrentUser() {
  // Get token from zustand store
  const token = useAuthStore.getState().token;
  if (!token) return {};
  try {
    const response = await axios.get('https://apislms.dgtoohl.com/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.data || {};
  } catch (error) {
    return {};
  }
}
