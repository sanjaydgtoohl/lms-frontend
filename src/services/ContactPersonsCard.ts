import http from './http';

export const fetchLeadSubSources = async () => {
  try {
    const response = await http.request({
      url: '/lead-sub-sources/list',
      method: 'GET'
    });
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: 'Invalid response format' };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Failed to fetch sub-sources' };
  }
};
