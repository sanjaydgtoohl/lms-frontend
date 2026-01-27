import { handleApiError } from '../utils/apiErrorHandler';
import { apiClient } from '../utils/apiClient';

export type PendingAssignment = {
  id: number;
  // initials may be provided or derived from name
  initials?: string | null;
  // some APIs return a simple string name, others return an object like { id, name }
  name: string | { id: number; name: string; full_name?: string };
  priority: string;
  dueInDays?: number;
  created_at?: string | null;
  progress?: number; // 0-100
};

export type DashboardStats = {
  totalUsers: number;
  pendingAssignments: number;
  teamPerformance: string; // e.g., "92%"
  openAlerts: number;
};

export type Meeting = {
  id: number;
  title: string;
  agenda: string;
  meeting_date: string;
  meeting_time: string;
  lead: { id: number; name: string };
  attendees: { id: number; name: string }[];
  type: string;
  location: string;
  link: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DashboardApiResponse = {
  total_user_count: number;
  pending_lead_count: number;
  team_performance: string | null;
  open_alerts: number | null;
};

const ENDPOINTS = {
  PENDING_ASSIGNMENTS: '/leads/pending',
  DASHBOARD_STATS: '/dashboard',
  MEETINGS: '/meetings',
} as const;

export type PendingAssignmentsResponse = {
  data: PendingAssignment[];
};

export type DashboardStatsResponse = {
  data: DashboardStats;
};

export type MeetingsResponse = {
  data: Meeting[];
};

export async function getPendingAssignments(): Promise<PendingAssignmentsResponse> {
  try {
    const res = await apiClient.get<PendingAssignment[]>(ENDPOINTS.PENDING_ASSIGNMENTS);
    const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }
    const raw = json.data || [];

    const normalizeName = (v: any): string => {
      if (!v && v !== 0) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'object') {
        if (typeof v.name === 'string') return v.name;
        if (typeof v.full_name === 'string') return v.full_name;
        // common nested shape: { id, name }
        if (typeof v.name === 'object' && typeof (v.name as any).name === 'string') return (v.name as any).name;
        return String(v.id || v.name || JSON.stringify(v));
      }
      return String(v);
    };

    const normalizeInitials = (item: any): string => {
      if (item.initials) return String(item.initials);
      const name = normalizeName(item.name || item.lead_name || item.full_name || item.owner || item.assignee);
      if (!name) return '';
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const normalizeCreatedAt = (item: any): string | undefined => {
      return item?.created_at ?? item?.createdAt ?? item?.created_on ?? item?.created ?? undefined;
    };

    const normalized: PendingAssignment[] = (raw || []).map((it: any) => {
      // normalize priority: could be string or object {id, name}
      let pr = 'Low';
      if (it && it.priority !== undefined && it.priority !== null) {
        if (typeof it.priority === 'string') pr = it.priority;
        else if (typeof it.priority === 'object') {
          pr = (it.priority.name && String(it.priority.name)) || String(it.priority.id || 'Low');
        } else {
          pr = String(it.priority);
        }
      }

      return {
        id: Number(it.id),
        name: normalizeName(it.name ?? it.lead_name ?? it.full_name ?? it.owner ?? it.assignee ?? it),
        initials: normalizeInitials(it),
        priority: pr,
        dueInDays: it.due_in_days ?? it.dueInDays ?? (typeof it.due === 'number' ? it.due : undefined),
        created_at: normalizeCreatedAt(it),
        progress: typeof it.progress === 'number' ? it.progress : undefined,
      } as PendingAssignment;
    });

    return {
      data: normalized,
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  try {
    const res = await apiClient.get<DashboardApiResponse>(ENDPOINTS.DASHBOARD_STATS);
    const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }
    const data = json.data as DashboardApiResponse;

    return {
      data: {
        totalUsers: data.total_user_count || 0,
        pendingAssignments: data.pending_lead_count || 0,
        teamPerformance: data.team_performance || '0%',
        openAlerts: data.open_alerts || 0,
      },
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getMeetings(): Promise<MeetingsResponse> {
  try {
    const res = await apiClient.get<Meeting[]>(ENDPOINTS.MEETINGS);
    const json = res;
    if (!json || !json.success) {
      const message = (json as any)?.message || (json as any)?.error || 'Request failed';
      const error = new Error(message);
      (error as any).statusCode = (json as any)?.meta?.status_code || (json as any)?.meta?.status || undefined;
      (error as any).responseData = json;
      handleApiError(error);
      throw error;
    }
    const raw = json.data || [];

    const normalized: Meeting[] = (raw || []).map((it: any) => ({
      id: Number(it.id),
      title: it.title || '',
      agenda: it.agenda || '',
      meeting_date: it.meeting_date || '',
      meeting_time: it.meeting_time || '',
      lead: it.lead || { id: 0, name: '' },
      attendees: it.attendees || [],
      type: it.type || '',
      location: it.location || '',
      link: it.link || '',
      status: it.status || '',
      created_at: it.created_at || '',
      updated_at: it.updated_at || '',
    }));

    return {
      data: normalized,
    };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}