import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

// --- Business Forecast and Weightage API ---
export type BusinessForecastData = {
  total_budget: number;
  total_brief_count: number;
  business_weightage: number;
};

export async function getBusinessForecast(): Promise<BusinessForecastData> {
  try {
    const res = await apiClient.get<BusinessForecastData>('/briefs/business-forecast');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch business forecast');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Brief Count by Priority API ---
export type BriefCountByPriorityData = {
  total_briefs: number;
  priority_brief_count: number;
  priority_id: number;
  priority_name: string;
};

export async function getBriefCountByPriority(priorityId: number): Promise<BriefCountByPriorityData> {
  try {
    const res = await apiClient.get<BriefCountByPriorityData>(`/priorities/${priorityId}/brief-count`);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch brief count by priority');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Lead Count by Priority API ---
export type LeadCountByPriorityData = {
  total_leads: number;
  priority_lead_count: number;
  priority_id: number;
  priority_name: string;
};

export async function getLeadCountByPriority(priorityId: number): Promise<LeadCountByPriorityData> {
  try {
    const res = await apiClient.get<LeadCountByPriorityData>(`/priorities/${priorityId}/lead-count`);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch lead count by priority');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Priority API ---
export type Priority = {
  id: number;
  name: string;
  slug: string;
};

export async function getPriorities(): Promise<Priority[]> {
  try {
    const res = await apiClient.get<Priority[]>('/priorities');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch priorities');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Latest Two Meeting Scheduled Leads API ---
export type MeetingScheduledLead = {
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
};

export async function getLatestMeetingScheduledTwoLeads(): Promise<MeetingScheduledLead[]> {
  try {
    const res = await apiClient.get<MeetingScheduledLead[]>('/leads/latest/meeting-scheduled-two');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch latest meeting scheduled leads');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Latest Two Follow-Up Leads API ---
export type FollowUpLead = {
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
};

export async function getLatestFollowUpTwoLeads(): Promise<FollowUpLead[]> {
  try {
    const res = await apiClient.get<FollowUpLead[]>('/leads/latest/follow-up-two');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch latest follow-up leads');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Latest Two Briefs API ---
export type LatestBrief = {
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
};

export async function getLatestTwoBriefs(): Promise<LatestBrief[]> {
  try {
    const res = await apiClient.get<LatestBrief[]>('/briefs/latest/two-briefs');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch latest two briefs');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Latest Two Leads API ---
export type LatestLead = {
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
};

export async function getLatestTwoLeads(): Promise<LatestLead[]> {
  try {
    const res = await apiClient.get<LatestLead[]>('/leads/latest/two-leads');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch latest two leads');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Recent Activities API ---
export type ActivityLead = {
  id: number;
  name: string;
  brand_name: string;
  agency_name: string | null;
  assign_to: string;
  call_status: string;
  contact_person_name: string;
  created_at: string;
};

export async function getRecentActivities(): Promise<ActivityLead[]> {
  try {
    const res = await apiClient.get<ActivityLead[]>('/leads/activity-leads');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch recent activities');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
// --- Recent Briefs API ---
export type BriefStatus = {
  name: string;
  percentage: string;
};

export type AssignTo = {
  id: number | null;
  name: string | null;
  email: string | null;
};

export type RecentBrief = {
  id: number;
  name: string;
  product_name: string;
  budget: string;
  brand_name: string;
  contact_person_name: string | null;
  assign_to: AssignTo;
  brief_status: BriefStatus;
};

export async function getRecentBriefs(): Promise<RecentBrief[]> {
  try {
    const res = await apiClient.get<RecentBrief[]>('/briefs/recent');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch recent briefs');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
