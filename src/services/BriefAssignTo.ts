import { apiClient } from '../utils/apiClient';
import type { UpdateAssignResponse } from '../types/brief';

/**
 * Update the assigned user for a brief.
 * Endpoint shape used by the backend: PUT /briefs/:id/update-assign-user?assign_user_id=123
 */
export const updateAssignUser = async (briefId: string | number, assign_user_id: string | number) => {
  // apiClient does not auto-serialize `params` to query string, so append explicitly
  const query = `?assign_user_id=${encodeURIComponent(String(assign_user_id))}`;
  const path = `/briefs/${briefId}/update-assign-user${query}`;
  const res = await apiClient.put<UpdateAssignResponse>(path);
  // return the data payload (backend wraps actual brief in `data`)
  return res.data?.data ?? res.data;
};

export default updateAssignUser;
