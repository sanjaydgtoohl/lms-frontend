 export interface Agency {
  id?: string | number;
  name?: string;
  email?: string;
}

export interface AgenciesModalProps {
  isOpen: boolean;
  agencies: Agency[];
  onClose: () => void;
  title?: string;
} 


export type DialogType = 'delete' | 'assign' | 'warning';
export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  type?: DialogType;
  onCancel: () => void;
  onConfirm: () => void;
}


export interface ParentUser {
  id?: string | number;
  name: string;
  email?: string;
  status?: 'Active' | 'Inactive';
}

export interface ParentUserModalProps {
  isOpen: boolean;
  // support multiple parents
  parentUser: ParentUser[] | null;
  onClose: () => void;
  userName?: string;
  title?: string;
}

export interface Role {
  id?: string | number;
  name: string;
  display_name?: string;
  description?: string;
}

export interface RolesModalProps {
  isOpen: boolean;
  roles: Role[];
  onClose: () => void;
  userName?: string;
  title?: string;
}