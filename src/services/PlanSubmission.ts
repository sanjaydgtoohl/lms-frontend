import api from './api';

// TypeScript interfaces for API response
export interface BriefDetail {
  id: number;
  name: string;
  product_name: string;
  mode_of_campaign: string;
  media_type: string;
  budget: string;
  comment: string;
  submission_date: string;
  status: string;
  left_time?: string;
  contact_person?: {
    id: number;
    name: string;
    email: string | null;
  };
  brand: {
    id: number;
    name: string;
  };
  agency?: {
    id: number;
    name: string;
  };
  assigned_user: {
    id: number;
    name: string;
    email: string;
  };
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  brief_status?: {
    id: number;
    name: string;
    percentage?: string | null;
  };
  priority: {
    id: number;
    name: string;
  };
  planner_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetBriefByIdResponse {
  success: boolean;
  data: BriefDetail;
}

/**
 * Fetches brief details by ID
 * @param id Brief ID (numeric)
 * @returns BriefDetail object
 */
export async function getBriefById(id: number): Promise<BriefDetail> {
  try {
    const response = await api.customRequest<BriefDetail>(`/briefs/${id}`);
    console.log('Raw API response:', response);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
