import { apiClient } from '../utils/apiClient';

export type NotificationTab = 'all' | 'unread' | 'system' | 'lead-management' | 'brief' | 'pre-lead';

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

const normalizeNotification = (payload: any): NotificationItem => {
  // Handle the new data structure with nested 'data' object
  const data = payload.data || payload;

  const rawCategory =
    data.category ||
    data.event_type ||
    data.type ||
    data.notification_type ||
    payload.category ||
    payload.event_type ||
    payload.type ||
    payload.notification_type;

  const title =
    data.title ||
    data.subject ||
    data.heading ||
    data.message?.split('\n')[0] ||
    payload.title ||
    payload.subject ||
    payload.heading ||
    payload.message?.split('\n')[0] ||
    'Notification';

  const message =
    data.message ||
    data.body ||
    data.description ||
    payload.message ||
    payload.body ||
    payload.description ||
    '';

  const categoryName = String(rawCategory || '').replace(/_/g, ' ').trim();

  let category = categoryName
    ? categoryName.replace(/\b([a-z])/g, (m) => m.toUpperCase()).trim()
    : 'System';

  if (!rawCategory) {
    const normalizedText = String(title || message).toLowerCase();
    if (normalizedText.includes('pre lead') || normalizedText.includes('pre-lead')) {
      category = 'Pre Lead Created';
    } else if (normalizedText.includes('brief') && normalizedText.includes('created')) {
      category = 'Brief Created';
    } else if (normalizedText.includes('brief') && normalizedText.includes('status')) {
      category = 'Status Updated';
    } else if (normalizedText.includes('assignment') || normalizedText.includes('assigned')) {
      category = 'Assignment Updated';
    } else if (normalizedText.includes('lead') && !normalizedText.includes('pre lead') && !normalizedText.includes('pre-lead')) {
      category = 'Lead Created';
    } else if (normalizedText.includes('system')) {
      category = 'System';
    }
  }

  const createdAt =
    data.timestamp ||
    data.created_at ||
    data.createdAt ||
    payload.created_at ||
    payload.createdAt ||
    payload.timestamp ||
    payload.time ||
    new Date().toISOString();

  const source = data.source || data.reference || data.reference_url || payload.source || payload.reference || payload.reference_url || undefined;
  const link = data.link || data.url || data.route || payload.link || payload.url || payload.route || undefined;

  // For brief status updates, add more context to the message
  let enhancedMessage = message;
  if (data.brief_id && data.brief_name && data.previous_status && data.new_status) {
    enhancedMessage = `Brief "${data.brief_name}" (#${data.brief_id}) status changed from "${data.previous_status}" to "${data.new_status}"`;
    if (data.updated_by) {
      enhancedMessage += ` by ${data.updated_by}`;
    }
  }

  return {
    id: String(payload.id ?? payload._id ?? payload.notification_id ?? payload.key ?? `${Date.now()}-${Math.random()}`),
    title: String(title),
    message: String(enhancedMessage),
    category,
    read: Boolean(payload.read_at !== null && payload.read_at !== undefined) || payload.read === true || payload.is_read === true || payload.status === 'read',
    createdAt: String(createdAt),
    source,
    link,
    originalData: payload, // Store original payload for additional details
  };
};

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  return query.toString();
};

export async function listNotifications(
  page = 1,
  perPage = 10,
  tab: NotificationTab = 'all',
  categories: NotificationCategory[] = []
): Promise<NotificationListResponse> {
  const params: Record<string, string | number | undefined> = {
    page,
    per_page: perPage,
  };

  if (tab === 'unread') {
    params.read = 'false';
  }

  const allCategories = [...categories];
  if (tab === 'system' && !allCategories.includes('System')) {
    allCategories.unshift('System');
  }

  if (allCategories.length) {
    params.category = allCategories.join(',');
  }

  const queryString = buildQueryString(params);
  const endpoint = `/notifications?${queryString}`;
  
  const response = await apiClient.get<NotificationItem[]>(endpoint);
  
  const items = (response.data || []).map(normalizeNotification);

  const meta = response.meta
    ? {
        total: response.meta.pagination?.total,
        pagination: response.meta.pagination
          ? {
              current_page: response.meta.pagination.page,
              per_page: response.meta.pagination.limit,
              total: response.meta.pagination.total,
              last_page: Math.max(1, Math.ceil(response.meta.pagination.total / response.meta.pagination.limit)),
              from: (response.meta.pagination.page - 1) * response.meta.pagination.limit + 1,
              to: Math.min(response.meta.pagination.page * response.meta.pagination.limit, response.meta.pagination.total),
            }
          : undefined,
      }
    : undefined;

  return {
    data: items,
    meta,
  };
}

export async function getTotalNotificationCount(): Promise<number> {
  const response = await apiClient.get<NotificationItem[]>('/notifications?page=1&per_page=1');
  return Number(response.meta?.pagination?.total ?? 0);
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await apiClient.get<any>('/notifications/unread-count');
    
    // Handle multiple possible data structures
    // Try nested data.count first
    if (response.data && typeof response.data.count === 'number') {
      return response.data.count;
    }
    
    // Try direct count in data if data is a number
    if (typeof response.data === 'number') {
      return response.data;
    }
    
    // Try checking if data is an object with count property
    if (response.data && typeof response.data === 'object') {
      const count = (response.data as any).count || (response.data as any).unread_count;
      if (typeof count === 'number') {
        return count;
      }
    }
    
    // Fallback to 0
    return 0;
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    return 0;
  }
}


export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.post(`/notifications/${notificationId}/read`);
}

export async function markCategoryRead(category: NotificationCategory): Promise<void> {
  await apiClient.post('/notifications/mark-read', { category });
}

export async function clearAllNotifications(): Promise<void> {
  await apiClient.delete('/notifications/clear-all');
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}
