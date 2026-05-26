export interface UserParent {
  id: number;
  name: string;
  email?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  zone?: string;
  origination?: string;
  role?: string;
  roles?: Array<{ id?: number | string; name?: string; display_name?: string; [key: string]: unknown }>;
  status?: 'Active' | 'Inactive';
  lastLogin?: string;
  created?: string;
  created_at_formatted?: string;
  last_login_at?: string;
  parent?: UserParent;
  parents?: UserParent[];
}

export type UserListResponse = {
  data: AppUser[];
  meta?: Record<string, unknown> & {
    pagination?: { total?: number };
    total?: number;
  };
};
