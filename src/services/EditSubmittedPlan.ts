
import http from './http';


export interface SubmittedPlanFile {
  path: string;
  url: string;
  name: string;
}

export interface PlannerStatus {
  id: number;
  name: string;
}

export interface BriefSummary {
  id: number;
  uuid: string;
  name: string;
  product_name: string;
}

export interface EditSubmittedPlanResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    status_label: string;
    brief: BriefSummary;
    planner_status: PlannerStatus;
    submitted_plan: SubmittedPlanFile[];
    submitted_plan_count: number;
    backup_plan: string | null;
    backup_plan_url: string | null;
    has_backup_plan: boolean;
    created_at: string;
    updated_at: string;
    planner_id?: number; // for convenience if present in response
  };
}

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
    // eslint-disable-next-line no-console
    console.error('API error in updateSubmittedPlan:', error, error?.response);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to update submitted plan.');
  }
}
