/**
 * Centralized API Error Handler
 * Provides consistent error handling and user-friendly error messages
 */

import { useUiStore } from '../store/ui';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    const err = error as Record<string, any>;
    
    // Check common error message fields
    if (err.message) return String(err.message);
    if (err.error) return String(err.error);
    if (err.errors) {
      if (Array.isArray(err.errors)) {
        return err.errors.join(', ');
      }
      if (typeof err.errors === 'object') {
        const errorMessages = Object.values(err.errors)
          .flatMap((v: any) => (Array.isArray(v) ? v : [v]))
          .map((v) => String(v));
        return errorMessages.join(', ');
      }
      return String(err.errors);
    }
    if (err.details) {
      if (typeof err.details === 'string') return err.details;
      if (Array.isArray(err.details)) return err.details.join(', ');
      if (typeof err.details === 'object') {
        const details = Object.values(err.details)
          .flatMap((v: any) => (Array.isArray(v) ? v : [v]));
        return details.join(', ');
      }
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get user-friendly error message based on status code
 */
export function getUserFriendlyMessage(statusCode: number, message: string): string {
  switch (statusCode) {
    case 400:
      return message || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please login again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return message || 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return message || 'An error occurred. Please try again.';
  }
}

/**
 * Handle API error and show appropriate notification
 */
export function handleApiError(error: unknown, showNotification = true): ApiError {
  const message = extractErrorMessage(error);
  let statusCode: number | undefined;
  let code: string | undefined;
  let details: Record<string, any> | undefined;

  // Extract status code from error
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.response?.status) statusCode = err.response.status;
    if (err.status) statusCode = err.status;
    if (err.statusCode) statusCode = err.statusCode;
    if (err.code) code = String(err.code);
    if (err.details) details = err.details;
  }

  const userFriendlyMessage = statusCode
    ? getUserFriendlyMessage(statusCode, message)
    : message;

  // Show notification if enabled
  if (showNotification) {
    const isAuthError = statusCode === 401 || statusCode === 403;
    
    // Push to error list for non-auth errors
    if (!isAuthError) {
      try {
        useUiStore.getState().pushError(userFriendlyMessage);
      } catch (e) {
        console.error('Failed to push error to UI store:', e);
      }
    }
    
    // Show notification popup for critical errors
    if (statusCode && statusCode >= 500) {
      try {
        useUiStore.getState().showNotification(
          userFriendlyMessage,
          'error',
          'Server Error'
        );
      } catch (e) {
        console.error('Failed to show notification:', e);
      }
    }
  }

  return {
    message: userFriendlyMessage,
    code,
    statusCode,
    details,
  };
}

/**
 * Create a formatted error object
 */
export function createApiError(
  message: string,
  statusCode?: number,
  code?: string,
  details?: Record<string, any>
): ApiError {
  return {
    message: statusCode ? getUserFriendlyMessage(statusCode, message) : message,
    code,
    statusCode,
    details,
  };
}

