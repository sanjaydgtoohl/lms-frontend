import http from './http';

// Types for meeting API response
export interface MeetingLead {
  id: number;
  name: string;
  email: string | null;
}

export interface MeetingAttendee {
  id: number;
  name: string;
  email: string;
  created_at_human: string;
  updated_at_human: string;
}

export interface Meeting {
  id: number;
  title: string;
  type: string;
  location: string | null;
  agenda: string;
  link: string | null;
  meetin_start_date: string | null;
  meetin_end_date: string | null;
  status: string;
  lead: MeetingLead;
  attendees: MeetingAttendee[];
  created_at: string;
  updated_at: string;
}

export interface MeetingApiResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
  };
  data: Meeting[];
}

export async function fetchMeetings(params?: Record<string, any>): Promise<MeetingApiResponse> {
  const response = await http.get<MeetingApiResponse>('/meetings', { params });
  return response.data;
}
