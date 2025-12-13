import { jwtDecode } from "jwt-decode";
import { useAuthStore } from '../store/auth';
import sessionManager from '../services/sessionManager';

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

/**
 * Get milliseconds until next scheduled token refresh (5 minutes before expiry).
 * Returns -1 if token is expired or missing.
 */
export const getTimeUntilNextRefresh = (): number => {
  const expiresStr = document.cookie.match(/(?:^|; )auth_token_expires=([^;]*)/)?.[1];
  if (!expiresStr) return -1;

  const expiryMs = parseInt(expiresStr, 10);
  if (isNaN(expiryMs)) return -1;

  const now = Date.now();
  // Refresh is scheduled 5 minutes (300000 ms) before expiry
  const refreshTime = expiryMs - 5 * 60 * 1000;
  const msUntilRefresh = refreshTime - now;

  return Math.max(msUntilRefresh, -1);
};

let proactiveRefreshTimer: number | null = null;

/**
 * Setup proactive token refresh timer for development/demo (exposes on window).
 * This is a manual control separate from the automatic sessionManager schedule.
 */
export const setupProactiveTokenRefresh = (intervalMs: number = 60000) => {
  if (proactiveRefreshTimer) {
    window.clearInterval(proactiveRefreshTimer);
  }
  proactiveRefreshTimer = window.setInterval(() => {
    refreshTokenProactive().catch((err) => {
      console.warn('Proactive refresh failed:', err);
    });
  }, intervalMs);
  console.log(`[Auth] Proactive token refresh setup with interval ${intervalMs}ms`);
};

/**
 * Stop the proactive refresh timer.
 */
export const stopProactiveTokenRefresh = () => {
  if (proactiveRefreshTimer) {
    window.clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
    console.log('[Auth] Proactive token refresh stopped');
  }
};

/**
 * Manually trigger a token refresh (useful for testing/development).
 */
export const refreshTokenProactive = async (): Promise<void> => {
  try {
    const result = await sessionManager.refreshTokens();
    console.log('[Auth] Proactive refresh succeeded:', result);
  } catch (error) {
    console.error('[Auth] Proactive refresh failed:', error);
    throw error;
  }
};
