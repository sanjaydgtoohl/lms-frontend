// API Configuration
// Note: `import.meta.env` is available in Vite runtime. For tests and Node
// environments (where import.meta may not be supported by the TS compiler
// settings), fall back to process.env or a global value. This keeps the
// constant usable in Jest/unit tests without changing tsconfig.
const _envBase =
  import.meta.env.VITE_API_BASE_URL ||
  ((globalThis as any).VITE_API_BASE_URL as string) ||
  '/api';
export const API_BASE_URL = _envBase;

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
  LEAD: {
    ROOT: '/lead-management',
    CREATE: '/lead-management/create',
    EDIT: (id: string) => `/lead-management/edit/${id}`,
    DETAIL: (id: string) => `/lead-management/${id}`,
  },
  BRIEF: {
    ROOT: '/brief',
    PIPELINE: '/brief/Brief_Pipeline',
    CREATE: '/brief/create',
    EDIT: (id: string) => `/brief/${id}/edit`,
    DETAIL: (id: string) => `/brief/${id}`,
  },
  MISS_CAMPAIGN: {
    ROOT: '/miss-campaign',
    VIEW: '/miss-campaign/view',
    CREATE: '/miss-campaign/create',
    EDIT: (id: string) => `/miss-campaign/view/${id}/edit`,
    DETAIL: (id: string) => `/miss-campaign/view/${id}`,
  },
  CAMPAIGN_MANAGEMENT: '/campaign-management',
  FINANCE: '/finance',
  USER_MANAGEMENT: '/user-management',
  PERMISSION: {
    ROOT: '/user-management/permission',
    CREATE: '/user-management/permission/create',
    EDIT: (id: string) => `/user-management/permission/edit/${id}`,
    DETAIL: (id: string) => `/user-management/permission/${id}`,
  },
  ROLE: {
    ROOT: '/user-management/role',
    CREATE: '/user-management/role/create',
    EDIT: (id: string) => `/user-management/role/edit/${id}`,
    DETAIL: (id: string) => `/user-management/role/${id}`,
  },
  USER: {
    ROOT: '/user-management/user',
    CREATE: '/user-management/user/create',
    EDIT: (id: string) => `/user-management/user/edit/${id}`,
    DETAIL: (id: string) => `/user-management/user/${id}`,
  },
  // Master Data Routes
  BRAND_MASTER: '/master/brand',
  AGENCY_MASTER: '/master/agency',
  DEPARTMENT_MASTER: '/master/department',
  DESIGNATION_MASTER: '/master/designation',
  INDUSTRY_MASTER: '/master/industry',
  SOURCE_MASTER: '/master/source',
} as const;

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
