import { apiClient } from '../utils/apiClient';

export interface AssignLeadResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: any;
}

/**
 * Assign a user to a lead.
 * Backend endpoint: PUT /leads/:id/assign-user?user_id=123
 */
export const assignUserToLead = async (leadId: string | number, user_id: string | number) => {
  const query = `?user_id=${encodeURIComponent(String(user_id))}`;
  const path = `/leads/${leadId}/assign-user${query}`;
  const res = await apiClient.put<AssignLeadResponse>(path);
  return res.data?.data ?? res.data;
};

export default assignUserToLead;
