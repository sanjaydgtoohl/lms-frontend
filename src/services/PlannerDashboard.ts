import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';
import {
  type DashboardFilterState,
  withDashboardFilters,
} from '../utils/dashboardFilters';

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

export interface PlannerDashboardCardResponse {
  active_briefs: number;
  closed_briefs: number;
  total_left_time_days: number;
  average_planning_time_days: number;
}

export async function getLatestFiveBriefs(
  filters?: DashboardFilterState
): Promise<PlannerDashboardBrief[]> {
  try {
    const res = await apiClient.get<PlannerDashboardBrief[]>(
      withDashboardFilters('/briefs/latest/five', filters, { includePriority: false })
    );
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch latest briefs');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getPlannerDashboardCard(
  filters?: DashboardFilterState
): Promise<PlannerDashboardCardResponse> {
  try {
    const res = await apiClient.get<PlannerDashboardCardResponse>(
      withDashboardFilters('/briefs/planner-dashboard-card', filters, { includePriority: false })
    );
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch planner dashboard card data');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
