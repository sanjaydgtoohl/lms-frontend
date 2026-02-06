
import { apiClient } from '../utils/apiClient';

export type BusinessForecastData = {
  total_budget: number;
  total_brief_count: number;
  business_weightage: number;
};

export async function getBusinessForecast(): Promise<BusinessForecastData> {
  const res = await apiClient.get<BusinessForecastData>('/briefs/business-forecast');
  console.log('BusinessForecast API raw response:', res);
  if (!res || !res.success) {
    throw new Error(res?.message || 'Failed to fetch business forecast');
  }
  return res.data;
}
