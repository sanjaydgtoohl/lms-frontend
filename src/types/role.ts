export interface allRoleType {
    id: string;
    name: string;
    description?: string;
    srNo?: number;
    _realId?: string; // Add for type safety
}


// view role type
export interface viewRoletype {
    id: string | number;
    name: string;
    description: string;
}

// all  roles interface
export interface allRolesInterface {
    id: string;
    name: string;
    description?: string;
    _realId?: string; // Store the actual backend ID
}

