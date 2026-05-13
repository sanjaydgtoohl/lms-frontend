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



// meeting schedule type 

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



export interface MeetingFormData {
    lead: LeadItem;
    attendees: UserItem[];
    meetingData: MeetingScheduleItem & {
      meetin_start_date?: string;
      meetin_end_date?: string;
    };
  }