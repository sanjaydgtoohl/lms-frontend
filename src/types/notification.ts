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


// notification slice type 
export interface ModuleNotifications {
  notifications: NotificationItem[];
  unreadCount: number;
  totalItems: number;
}

export interface NotificationState {
  all: ModuleNotifications;
  leadManagement: ModuleNotifications;
  brief: ModuleNotifications;
  preLead: ModuleNotifications;
  system: ModuleNotifications;
}




export interface MeetingScheduleItem {
  id?: string;
  uuid?: string;
  title: string;
  lead_id: string;
  attendees_id: number[];
  type: string;
  location: string;
  agenda: string;
  link?: string;
  meeting_date: string;
  meeting_time: string;
  status?: string | number;
  created_at?: string;
  updated_at?: string;
  _raw?: Record<string, unknown>;
  [key: string]: unknown;
}

export type MeetingListResponse = {
  data: MeetingScheduleItem[];
  meta?: {
    pagination?: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number | null;
      to: number | null;
    }
  }
};



// Notification services type 

export type NotificationTab = 'all' | 'unread' | 'system' | 'lead-management' | 'brief' | 'pre-lead';

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
