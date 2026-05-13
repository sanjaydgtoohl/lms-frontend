
export interface PermissionNode {
    id: number;
    display_name: string;
    name?: string;
    description?: string;
    url?: string;
    icon_file?: string | null;
    icon_text?: string;
    is_parent?: number | null;
    status?: string;
    order?: number;
    children?: PermissionNode[];
}

export interface PermissionTreeProps {
    data: PermissionNode[];
    selectedPermissionIds?: number[];
    onChange?: (selected: number[]) => void;
}



// role Permission data type 

export interface Permission {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    view?: boolean;
}

export interface Submodule {
    name: string;
    permissions: Permission;
}

export interface Module {
    name: string;
    submodules: Submodule[];
}


// all permission  type 
export interface AllPermissionType {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    srNo?: number;
}


// view permission type 
export interface viewPermissionType {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
}


// permission  slice types 
import type { NavigationItem } from "../services/Side";
export interface PermissionsState {
    sidebarMenu: NavigationItem[];
    allPermittedPaths: string[];
    allPermittedSlugs: string[];
    loading: boolean;
    permissionsLoaded: boolean;
}


// all permission interface type    
export interface allPermissionTypeServices {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
}



// create permission type 

export interface PermissionPayload {
    displayName: string;
    name: string;
    url?: string;
    parentPermission?: string | null;
    description: string;
    order?: string | number;
}

export interface PermissionDetail extends PermissionPayload {
    id: string;
    slug?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}


// edit permission type 
export interface PermissionEditPayload {
    display_name: string;
    name: string;
    url?: string;
    is_parent?: number | null;
    description: string;
    icon_text?: string;
    order?: string | number;
    status?: string;
    icon_file?: File | null;
}

export interface PermissionEditDetail {
    id: string;
    display_name: string;
    name: string;
    url: string;
    is_parent: string | number | null;
    description: string;
    icon_text: string;
    order?: string | number;
    icon_file?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}