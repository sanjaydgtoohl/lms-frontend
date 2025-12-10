import { jwtDecode } from "jwt-decode";
import { useAuthStore } from '../store/auth';

interface JWTPayload {
  exp?: number;
  iat?: number;
}

export const isTokenExpired = (token: string | null | undefined): boolean => {
  if (!token || typeof token !== 'string') {
    // Optionally log or handle the missing/invalid token
    console.error('Token validation error: Invalid token specified, must be a string');
    return true;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return true;

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Add a 60-second buffer to handle any clock skew
    return decoded.exp <= currentTime + 60;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

export const handleTokenExpiration = async () => {
  const authStore = useAuthStore.getState();
  const { token, refreshTokenValue, refreshToken } = authStore;

  if (isTokenExpired(token)) {
    try {
      if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
        await refreshToken();
      } else {
        // If refresh token is also expired or doesn't exist, logout (user-initiated only)
        // Optionally, set a flag or notify the user, but do not auto-logout or redirect
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Optionally, set a flag or notify the user, but do not auto-logout or redirect
    }
  }
};

export const setupTokenExpirationCheck = () => {
  // Check token every minute
  const interval = setInterval(handleTokenExpiration, 60000);
  return () => clearInterval(interval);
};
