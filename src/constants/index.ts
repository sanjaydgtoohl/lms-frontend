// API Configuration
// Read the Vite env var when available, otherwise fall back to a global
// or a sensible default. Normalize by trimming whitespace and removing any
// trailing slashes so joining with endpoints is reliable.
const rawEnv =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  ((globalThis as any).VITE_API_BASE_URL as string) ||
  '/api/v1';
export const API_BASE_URL = String(rawEnv).trim().replace(/\/+$|\s+$/g, '');

export { ROUTES, ROUTE_SEGMENTS } from './routes';

export const CALL_STATUS_OPTIONS = [
  "Busy",
  "Duplicate",
  "Fake Lead",
  "FollowBack",
  "Invalid Number",
  "Not Reachable",
  "Switched Off",
  "Not Connected",
  "Connected",
  "No Response",
  "Wrong Number",
  "Call Back Scheduled",
  "Interested",
  "Not Interested",
  "Converted",
  "DND Requested"
] as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

// Course Difficulty Levels
export const COURSE_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Storage Keys (theme only — auth tokens live in Redux + refresh cookie)
export const STORAGE_KEYS = {
  THEME: 'theme',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PHONE_INVALID: 'Please enter a valid phone number',
} as const;

export { ENDPOINTS, API_ENDPOINTS } from './endpoints';

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#f97316', // orange-500
    SECONDARY: '#64748b', // slate-500
    SUCCESS: '#10b981', // emerald-500
    WARNING: '#f59e0b', // amber-500
    ERROR: '#ef4444', // red-500
    INFO: '#3b82f6', // blue-500
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;
