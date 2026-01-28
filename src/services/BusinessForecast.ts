import { apiClient } from '../utils/apiClient';

export type BusinessForecastResponse = {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    status_code: number;
  };
  data: {
    total_budget: number;
    total_brief_count: number;
    business_weightage: number;
  };
};

export async function getBusinessForecast(): Promise<BusinessForecastResponse> {
  const res = await apiClient.get<BusinessForecastResponse>('/briefs/business-forecast');
  if (!res || !res.success) {
    throw new Error(res?.message || 'Failed to fetch business forecast');
  }
  return res;
}
