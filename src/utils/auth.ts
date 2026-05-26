import { jwtDecode } from "jwt-decode";
import sessionManager from '../services/sessionManager';
import { getTokenExpiresAt } from '../services/auth/tokenStorage';
import { getRefreshDelayMs } from '../services/auth/tokenExpiry';

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
  // Token expiration is now handled by Redux via sessionManager
  // This function is kept for backward compatibility
};

export const setupTokenExpirationCheck = () => {
  // Token expiration check is now handled by Redux sessionManager
  // This function is kept for backward compatibility
  return () => {};
};

/**
 * Get milliseconds until next scheduled token refresh (5 minutes before expiry).
 * Returns -1 if token is expired or missing.
 */
export const getTimeUntilNextRefresh = (): number => {
  const expiryMs = getTokenExpiresAt();
  if (!expiryMs) return -1;
  return getRefreshDelayMs(expiryMs);
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
