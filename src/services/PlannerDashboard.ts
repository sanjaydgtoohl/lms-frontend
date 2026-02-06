export interface PlannerDashboardBrief {
  id: number;
  brief_name: string;
  brand_name: string;
  product_name: string;
  budget: number;
  submission_date: string;
  status: 'Approve' | 'Submission' | 'Closed';
  left_time: string;
}

/**
 * Fetches the latest five assigned briefs for the planner dashboard.
 * @returns Array of latest five briefs
 * @throws Error with API or network message
 */
export async function getLatestFiveBriefs(): Promise<PlannerDashboardBrief[]> {
  try {
    const response = await apiClient.customRequest<PlannerDashboardBrief[]>(
      '/briefs/latest/five',
      { method: 'GET' }
    );
    if (response?.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to fetch latest briefs');
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'An unknown error occurred while fetching latest briefs');
  }
}
import apiClient from './api';

export interface PlannerDashboardCardResponse {
  active_briefs: number;
  closed_briefs: number;
  total_left_time_days: number;
  average_planning_time_days: number;
}

/**
 * Fetches planner dashboard card data.
 * @returns PlannerDashboardCardResponse
 * @throws Error with API or network message
 */
export async function getPlannerDashboardCard(): Promise<PlannerDashboardCardResponse> {
  try {
    const response = await apiClient.customRequest<PlannerDashboardCardResponse>(
      '/briefs/planner-dashboard-card',
      { method: 'GET' }
    );
    if (response?.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to fetch planner dashboard card data');
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'An unknown error occurred while fetching planner dashboard card data');
  }
}
