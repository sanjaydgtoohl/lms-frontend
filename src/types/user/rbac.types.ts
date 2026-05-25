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

export type RoleListResponse = {
  data: RoleRecord[];
  meta?: Record<string, unknown>;
};

export type PermissionListResponse = {
  data: PermissionRecord[];
  meta?: Record<string, unknown>;
};
