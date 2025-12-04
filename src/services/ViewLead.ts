import http from './http';

export interface Lead {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  email: string;
  profile_url: string;
  mobile_number: string[];
  type: string;
  status: string;
  comment: string;
  brand_id: number;
  agency_id: number | null;
  current_assign_user: number;
  priority_id: number;
  lead_status: string | null;
  designation_id: number;
  department_id: number;
  sub_source_id: number;
  country_id: number;
  state_id: number;
  city_id: number;
  zone_id: number;
  postal_code: string;
  call_status: string | null;
  brand: { id: number; name: string };
  agency: null | { id: number; name: string };
  assigned_user: { id: number; name: string; email: string };
  priority: { id: number; name: string; slug: string };
  designation: { id: number; name: string | null };
  department: { id: number; name: string };
  sub_source: { id: number; name: string };
  country: { id: number; name: string };
  state: { id: number; name: string };
  city: { id: number; name: string };
  zone: { id: number; name: string };
  status_relation: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeadApiResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: Lead;
}

export const fetchLeadById = async (id: string | number): Promise<Lead | null> => {
  try {
    const response = await http.get<LeadApiResponse>(`/leads/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching lead:', error);
    return null;
  }
};
