// --- Business Forecast and Weightage API ---
export interface BusinessForecastResponse {
  success: boolean;
  message: string;
  meta: any;
  data: {
    total_budget: number;
    total_brief_count: number;
    business_weightage: number;
  };
}

export const fetchBusinessForecast = async (): Promise<BusinessForecastResponse['data']> => {
  const token = getCookie('auth_token');
  const response = await axios.get<BusinessForecastResponse>(
    'https://apislms.dgtoohl.com/api/v1/briefs/business-forecast',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch business forecast');
};
// --- Brief Count by Priority API ---
export interface BriefCountByPriorityResponse {
  success: boolean;
  message: string;
  meta: any;
  data: {
    total_briefs: number;
    priority_brief_count: number;
    priority_id: number;
    priority_name: string;
  };
}

export const fetchBriefCountByPriority = async (priorityId: number): Promise<BriefCountByPriorityResponse['data']> => {
  const token = getCookie('auth_token');
  const response = await axios.get<BriefCountByPriorityResponse>(
    `https://apislms.dgtoohl.com/api/v1/priorities/${priorityId}/brief-count`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch brief count by priority');
};
// --- Lead Count by Priority API ---
export interface LeadCountByPriorityResponse {
  success: boolean;
  message: string;
  meta: any;
  data: {
    total_leads: number;
    priority_lead_count: number;
    priority_id: number;
    priority_name: string;
  };
}

export const fetchLeadCountByPriority = async (priorityId: number): Promise<LeadCountByPriorityResponse['data']> => {
  const token = getCookie('auth_token');
  const response = await axios.get<LeadCountByPriorityResponse>(
    `https://apislms.dgtoohl.com/api/v1/priorities/${priorityId}/lead-count`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch lead count by priority');
};
// --- Priority API ---
export interface Priority {
  id: number;
  name: string;
  slug: string;
}

export interface PrioritiesResponse {
  success: boolean;
  message: string;
  meta: any;
  data: Priority[];
}

export const fetchPriorities = async (): Promise<Priority[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<PrioritiesResponse>(
    'https://apislms.dgtoohl.com/api/v1/priorities',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch priorities');
};
// --- Latest Two Meeting Scheduled Leads API ---
export interface MeetingScheduledLead {
  id: number;
  name: string;
  email: string;
  profile_url: string;
  mobile_number: { id: number; number: string }[];
  type: string;
  status: string;
  comment: string;
  call_attempt: number;
  call_status_relation: { id: number; name: string };
  lead_status_relation: { id: number; name: string };
  brand: { id: number; name: string } | null;
  agency: { id: number; name: string } | null;
  created_by_user: { id: number; name: string; email: string };
  assigned_user: { id: number; name: string; email: string };
  priority: { id: number; name: string; slug: string };
  designation: any;
  department: { id: number; name: string } | null;
  sub_source: { id: number; name: string };
  country: { id: number; name: string };
  state: { id: number; name: string };
  city: { id: number; name: string };
  zone: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface MeetingScheduledLeadsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: MeetingScheduledLead[];
}

export const fetchLatestMeetingScheduledTwoLeads = async (): Promise<MeetingScheduledLead[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<MeetingScheduledLeadsResponse>(
    'https://apislms.dgtoohl.com/api/v1/leads/latest/meeting-scheduled-two',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch latest meeting scheduled leads');
};
// --- Latest Two Follow-Up Leads API ---
export interface FollowUpLead {
  id: number;
  name: string;
  email: string;
  profile_url: string;
  mobile_number: { id: number; number: string }[];
  type: string;
  status: string;
  comment: string;
  call_attempt: number;
  call_status_relation: { id: number; name: string };
  lead_status_relation: { id: number; name: string };
  brand: { id: number; name: string } | null;
  agency: { id: number; name: string } | null;
  created_by_user: { id: number; name: string; email: string };
  assigned_user: { id: number; name: string; email: string };
  priority: { id: number; name: string; slug: string };
  designation: any;
  department: any;
  sub_source: { id: number; name: string };
  country: { id: number; name: string };
  state: { id: number; name: string };
  city: { id: number; name: string };
  zone: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface FollowUpLeadsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: FollowUpLead[];
}

export const fetchLatestFollowUpTwoLeads = async (): Promise<FollowUpLead[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<FollowUpLeadsResponse>(
    'https://apislms.dgtoohl.com/api/v1/leads/latest/follow-up-two',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch latest follow-up leads');
};
// --- Latest Two Briefs API ---
export interface LatestBrief {
  id: number;
  name: string;
  product_name: string;
  mode_of_campaign: string;
  media_type: string;
  budget: string;
  comment: string;
  submission_date: string;
  status: string;
  left_time: string;
  contact_person: {
    id: number;
    name: string;
    email: string;
  };
  brand: {
    id: number;
    name: string;
  };
  agency: {
    id: number;
    name: string;
  };
  assigned_user: {
    id: number;
    name: string;
    email: string;
  };
  created_by_user: {
    id: number;
    name: string;
    email: string;
  };
  brief_status: {
    id: number;
    name: string;
    percentage: string;
  };
  priority: {
    id: number;
    name: string;
  };
  planner_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface LatestBriefsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: LatestBrief[];
}

export const fetchLatestTwoBriefs = async (): Promise<LatestBrief[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<LatestBriefsResponse>(
    'https://apislms.dgtoohl.com/api/v1/briefs/latest/two-briefs',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch latest two briefs');
};
// --- Latest Two Leads API ---
export interface LatestLead {
  id: number;
  name: string;
  email: string;
  profile_url: string;
  type: string;
  status: string;
  comment: string;
  call_attempt: number;
  call_status_relation: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  } | null;
  agency: {
    id: number;
    name: string;
  } | null;
  assigned_user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LatestLeadsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: LatestLead[];
}

export const fetchLatestTwoLeads = async (): Promise<LatestLead[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<LatestLeadsResponse>(
    'https://apislms.dgtoohl.com/api/v1/leads/latest/two-leads',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch latest two leads');
};
import axios from 'axios';
import { getCookie } from '../utils/cookies';

export interface ActivityLead {
  id: number;
  name: string;
  brand_name: string;
  agency_name: string | null;
  assign_to: string;
  call_status: string;
  contact_person_name: string;
  created_at: string;
}

export interface ActivityLeadsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: ActivityLead[];
}

export const fetchRecentActivities = async (): Promise<ActivityLead[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<ActivityLeadsResponse>(
    'https://apislms.dgtoohl.com/api/v1/leads/activity-leads',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch recent activities');
};
export interface BriefStatus {
  name: string;
  percentage: string;
}

export interface AssignTo {
  id: number | null;
  name: string | null;
  email: string | null;
}

export type RecentBrief = {
  id: number;
  name: string;
  product_name: string;
  budget: string;
  brand_name: string;
  contact_person_name: string | null;
  assign_to: AssignTo;
  brief_status: BriefStatus;
}

export interface RecentBriefsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: RecentBrief[];
}

export const fetchRecentBriefs = async (): Promise<RecentBrief[]> => {
  const token = getCookie('auth_token');
  const response = await axios.get<RecentBriefsResponse>(
    'https://apislms.dgtoohl.com/api/v1/briefs/recent',
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Failed to fetch recent briefs');
};
