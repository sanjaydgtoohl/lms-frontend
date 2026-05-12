export type NotificationCategory =
  | 'Lead Created'
  | 'Pre Lead Created'
  | 'Brief Created'
  | 'Assignment Updated'
  | 'Status Updated'
  | 'System'
  | string;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
  source?: string;
  link?: string;
  originalData?: any; // Store original payload for additional details
}

export interface NotificationListResponse {
  data: NotificationItem[];
  meta?: {
    total?: number;
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
  };
}


export interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  customStyle?: {
    bg?: string;
    border?: string;
    text?: string;
    icon?: string;
  };
}

