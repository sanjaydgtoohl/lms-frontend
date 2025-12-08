import { useUiStore } from '../store/ui';
import { apiClient } from '../utils/apiClient';

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

const ENDPOINTS = {
  LIST: '/meetings',
  DETAIL: (id: string) => `/meetings/${id}`,
  CREATE: '/meetings',
  UPDATE: (id: string) => `/meetings/${id}`,
  DELETE: (id: string) => `/meetings/${id}`,
} as const;

/**
 * Normalize API response data to MeetingScheduleItem format
 */
function normalizeMeetingItem(raw: Record<string, unknown>): MeetingScheduleItem {
  const idVal = raw['id'] ?? raw['uuid'] ?? '';
  const titleVal = raw['title'] ?? '';
  const leadIdVal = raw['lead_id'] ?? '';
  let attendeesIdVal = raw['attendees_id'] ?? [];
  // Ensure attendees_id is always an array of numbers
  if (typeof attendeesIdVal === 'string') {
    try {
      const parsed = JSON.parse(attendeesIdVal);
      if (Array.isArray(parsed)) attendeesIdVal = parsed;
      else attendeesIdVal = [];
    } catch {
      attendeesIdVal = [];
    }
  }
  if (Array.isArray(attendeesIdVal)) {
    attendeesIdVal = attendeesIdVal.map((v) => Number(v));
  } else {
    attendeesIdVal = [];
  }
  const typeVal = raw['type'] ?? '';
  const locationVal = raw['location'] ?? '';
  const agendaVal = raw['agenda'] ?? '';
  const linkVal = raw['link'] ?? '';
  const meetingDateVal = raw['meeting_date'] ?? '';
  const meetingTimeVal = raw['meeting_time'] ?? '';
  const statusVal = raw['status'] ?? '1';
  const createdAtVal = raw['created_at'] ?? '';
  const updatedAtVal = raw['updated_at'] ?? '';

  return {
    id: String(idVal),
    uuid: String(idVal),
    title: String(titleVal),
    lead_id: String(leadIdVal),
    attendees_id: attendeesIdVal,
    type: String(typeVal),
    location: String(locationVal),
    agenda: String(agendaVal),
    link: String(linkVal),
    meeting_date: String(meetingDateVal),
    meeting_time: String(meetingTimeVal),
    status: statusVal,
    created_at: String(createdAtVal),
    updated_at: String(updatedAtVal),
    _raw: raw,
  } as MeetingScheduleItem;
}

/**
 * Fetch all meetings with optional pagination and search
 */
export async function listMeetings(page = 1, perPage = 10, search?: string): Promise<MeetingListResponse> {
  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (search && String(search).trim()) {
      params.set('search', String(search).trim());
    }

    const res = await apiClient.get<any>(ENDPOINTS.LIST + `?${params.toString()}`);
    const json = res;

    if (!json || !json.success) {
      const message = (json && (json.message || 'Request failed')) || 'Request failed';
      try {
        useUiStore.getState().pushError(message);
      } catch {}
      throw new Error(message);
    }

    const items = (json.data || []).map((it: unknown) => {
      const raw = it as Record<string, unknown>;
      return normalizeMeetingItem(raw);
    });

    return {
      data: items,
      meta: (json.meta as any) || {},
    };
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
}

/**
 * Fetch a single meeting by ID
 */
export async function getMeeting(id: string): Promise<MeetingScheduleItem> {
  try {
    const res = await apiClient.get<any>(ENDPOINTS.DETAIL(id));
    const json = res;

    if (!json || !json.success) {
      const message = (json && (json.message || 'Request failed')) || 'Request failed';
      try {
        useUiStore.getState().pushError(message);
      } catch {}
      throw new Error(message);
    }

    const raw = json.data as Record<string, unknown>;
    return normalizeMeetingItem(raw);
  } catch (error: any) {
    console.error('Error fetching meeting:', error);
    throw error;
  }
}

/**
 * Create a new meeting
 */
export async function createMeeting(payload: Partial<MeetingScheduleItem>): Promise<MeetingScheduleItem> {
  try {
    const res = await apiClient.post<any>(ENDPOINTS.CREATE, payload);
    const json = res;

    if (!json || !json.success) {
      const message = (json && (json.message || 'Create failed')) || 'Create failed';
      try {
        useUiStore.getState().pushError(message);
      } catch {}
      throw new Error(message);
    }

    const raw = json.data as Record<string, unknown>;
    return normalizeMeetingItem(raw);
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

/**
 * Update an existing meeting
 */
export async function updateMeeting(id: string, payload: Partial<MeetingScheduleItem>): Promise<MeetingScheduleItem> {
  try {
    const res = await apiClient.put<any>(ENDPOINTS.UPDATE(id), payload);
    const json = res;

    if (!json || !json.success) {
      const message = (json && (json.message || 'Update failed')) || 'Update failed';
      try {
        useUiStore.getState().pushError(message);
      } catch {}
      throw new Error(message);
    }

    const raw = json.data as Record<string, unknown>;
    return normalizeMeetingItem(raw);
  } catch (error: any) {
    console.error('Error updating meeting:', error);
    throw error;
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string): Promise<void> {
  try {
    const res = await apiClient.delete<any>(ENDPOINTS.DELETE(id));
    const json = res;

    if (!json || !json.success) {
      const message = (json && (json.message || 'Delete failed')) || 'Delete failed';
      try {
        useUiStore.getState().pushError(message);
      } catch {}
      throw new Error(message);
    }
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
}

export default {
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};
