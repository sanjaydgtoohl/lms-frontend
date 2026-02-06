// PlanHistory.ts
// API connection for fetching "Submitted Plans" section data from /briefs/{id}/planner-histories

import { apiClient } from '../utils/apiClient';

export interface SubmittedPlanFile {
  path: string;
  url: string;
  name: string;
}

export interface BackupPlanFile {
  path: string;
  url: string;
  name: string;
}

export type PlannerHistoryItem = {
  id: number;
  status_label: string;
  brief: {
    id: number;
    name: string;
  };
  planner: {
    id: number;
    submitted_plan: SubmittedPlanFile[];
    backup_plan: BackupPlanFile | null;
  };
  creator: {
    id: number;
    name: string;
  };
  planner_status: string | null;
  submitted_plan: SubmittedPlanFile[];
  backup_plan: BackupPlanFile | null;
  created_at: string;
  updated_at: string;
}

export interface PlannerHistoryResponse {
  success: boolean;
  message: string;
  meta: any;
  data: PlannerHistoryItem[];
}

// Fetch planner histories by brief id
export async function fetchPlannerHistories(briefId: number): Promise<PlannerHistoryItem[]> {
  const response = await apiClient.get<PlannerHistoryResponse>(
    `/briefs/${briefId}/planner-histories`
  );
  console.log('Full planner histories API response:', response);
  // Try all possible shapes
  if (response && Array.isArray((response as any).data)) {
    return (response as any).data;
  }
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (response && response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  if (response && (response as any).data?.data && Array.isArray((response as any).data.data)) {
    return (response as any).data.data;
  }
  console.error('API response shape unexpected:', response);
  return [];
}
