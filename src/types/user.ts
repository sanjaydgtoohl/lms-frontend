export interface User {
    id: string;
    name: string;
    email?: string;
    zone?: string;
    origination?: string;
    role?: string;
    roles?: any[];
    status?: 'Active' | 'Inactive';
    lastLogin?: string;
    created?: string;
    created_at_formatted?: string;
    last_login_at?: string;
    // `parent` kept for backward compatibility (first parent), `parents` contains all parents when available
    parent?: {
        id: number;
        name: string;
        email?: string;
    };
    parents?: Array<{
        id: number;
        name: string;
        email?: string;
    }>;
}


// login type 

// API Response structure based on the actual API
export interface LoginApiResponse {
    success: boolean;
    message: string;
    meta: {
        timestamp: string;
        status_code: number;
    };
    data: {
        token: string;
        refreshToken: string;
        token_type: string;
        expires_in: number;
    };
}

// Error response structure
export interface LoginErrorResponse {
    success: boolean;
    message: string;
    meta: {
        timestamp: string;
        status_code: number;
    };
    details?: any;
}