
import http from './http';
import type { EditSubmittedPlanResponse } from '../types/edit';

/**
 * Update submitted plan and backup plan for a planner
 * @param briefId Brief ID
 * @param plannerId Planner ID
 * @param formData FormData containing submitted_plan[] and backup_plan
 */
export async function updateSubmittedPlan(
  briefId: number,
  plannerId: number,
  formData: FormData
): Promise<EditSubmittedPlanResponse> {
  try {
    const response = await http.put<EditSubmittedPlanResponse>(
      `/briefs/${briefId}/planners/${plannerId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
     
    console.error('API error in updateSubmittedPlan:', error, error?.response);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update submitted plan.');
  }
}
