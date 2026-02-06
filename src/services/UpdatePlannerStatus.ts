import { apiClient } from '../utils/apiClient';

/**
 * Update planner status by planner id
 * @param plannerId planner id
 * @param planner_status_id status id to set
 */
export async function updatePlannerStatus(plannerId: number | string, planner_status_id: number) {
  try {
    const res = await apiClient.put(`/planners/${plannerId}/update-status`, { planner_status_id });
    return res.data;
  } catch (err) {
    console.error('Failed to update planner status:', err);
    throw err;
  }
}
