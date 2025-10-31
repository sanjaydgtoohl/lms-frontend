import { useAuthStore } from '../store/auth';

export const handleTokenExpiration = () => {
  const { logout } = useAuthStore.getState();
  logout();
  window.location.href = '/login';
};