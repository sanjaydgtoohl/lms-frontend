import axios from 'axios';

const BASE_URL = 'https://apislms.dgtoohl.com';

export const fetchLeadSubSources = async () => {
  try {
    let token = null;
    try {
      const persisted = localStorage.getItem('auth-storage');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        token = parsed?.state?.token || null;
      }
    } catch (e) {
      token = null;
    }
    const response = await axios.get(`${BASE_URL}/api/v1/lead-sub-sources/list`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: 'Invalid response format' };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Failed to fetch sub-sources' };
  }
};
