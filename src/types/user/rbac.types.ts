export interface PermissionRecord {
  id: string | number;
  name: string;
  display_name?: string;
  url?: string;
  icon?: string;
  parent_id?: number | null;
  [key: string]: unknown;
}

export interface RoleRecord {
  id: string | number;
  name: string;
  description?: string;
  permissions?: PermissionRecord[];
  [key: string]: unknown;
}

/** Permission row in AllPermissions table */
export interface PermissionTableRow {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  srNo?: number;
}

/** Role row in AllRoles table */
export interface RoleTableRow {
  id: string;
  name: string;
  description?: string;
  srNo?: number;
  _realId?: string;
}

export interface PermissionDetailView {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

export interface RoleDetailView {
  id: string | number;
  name: string;
  description: string;
}

export type RoleListResponse = {
  data: RoleRecord[];
  meta?: Record<string, unknown>;
};

export type PermissionListResponse = {
  data: PermissionRecord[];
  meta?: Record<string, unknown>;
};
