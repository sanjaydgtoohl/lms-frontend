
import { apiClient } from '../utils/apiClient';
import {
  buildDashboardFilterQuery,
  type DashboardFilterState,
} from '../utils/dashboardFilters';

export type BusinessForecastData = {
  total_budget: number;
  total_brief_count: number;
  business_weightage: number;
};

export async function getBusinessForecast(
  filters?: DashboardFilterState
): Promise<BusinessForecastData> {
  const query = filters ? buildDashboardFilterQuery(filters, { includePriority: false }) : '';
  const res = await apiClient.get<BusinessForecastData>(`/briefs/business-forecast${query}`);
  
  if (!res || !res.success) {
    throw new Error(res?.message || 'Failed to fetch business forecast');
  }
  return res.data;
}
