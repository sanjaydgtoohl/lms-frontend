// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  // LMS Routes
  LEAD_SOURCE: '/lead-source',
  LEAD_MANAGEMENT: '/lead-management',
  BRIEF: '/brief',
  MISS_CAMPAIGN: '/miss-campaign',
  CAMPAIGN_MANAGEMENT: '/campaign-management',
  FINANCE: '/finance',
  USER_MANAGEMENT: '/user-management',
  // Master Data Routes
  BRAND_MASTER: '/master/brand',
  AGENCY_MASTER: '/master/agency',
  DEPARTMENT_MASTER: '/master/department',
  DESIGNATION_MASTER: '/master/designation',
  INDUSTRY_MASTER: '/master/industry',
} as const;

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

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
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

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    DETAIL: (id: string) => `/courses/${id}`,
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
    ENROLL: (id: string) => `/courses/${id}/enroll`,
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;

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
