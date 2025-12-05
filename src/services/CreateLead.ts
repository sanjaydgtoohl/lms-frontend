import { listUsers } from './AllUsers';
// Fetch users for Assign To dropdown
export const fetchUsers = async () => {
  try {
    const { data } = await listUsers(1, 100);
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};
import { listCountries } from './CreateBrandForm';
import { listStates } from './CreateBrandForm';
import { listCities } from './CreateBrandForm';
import { listZones } from './CreateBrandForm';
import { listDepartments } from './DepartmentMaster';
import { listDesignations } from './DesignationMaster';

import http from './http';
import { API_BASE_URL } from '../constants';

export const fetchBrands = async () => {
  try {
    // Use the shared http instance and dynamic base URL
    const response = await http.get(`${API_BASE_URL}/brands`);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: response.data?.message || 'Unknown error' };
  } catch (error: any) {
    return { data: [], error: error?.response?.data?.message || error.message || 'Network error' };
  }
};

export const fetchAgencies = async () => {
  try {
    const response = await http.get(`${API_BASE_URL}/agencies`);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null };
    }
    return { data: [], error: response.data?.message || 'Unknown error' };
  } catch (error: any) {
    return { data: [], error: error?.response?.data?.message || error.message || 'Network error' };
  }
};

// Fetch designations for dropdown
export const fetchDesignations = async () => {
  try {
    const { data } = await listDesignations(1, 100); // fetch up to 100 designations
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Fetch departments for dropdown
export const fetchDepartments = async () => {
  try {
    const { data } = await listDepartments(1, 100); // fetch up to 100 departments
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Fetch zones for dropdown
export const fetchZones = async () => {
  try {
    const data = await listZones();
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Fetch cities for dropdown
export const fetchCities = async (params?: { state_id?: string | number; country_id?: string | number }) => {
  try {
    const data = await listCities(params);
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Fetch states for dropdown
export const fetchStates = async (params?: { country_id?: string | number }) => {
  try {
    const data = await listStates(params);
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Fetch countries for dropdown
export const fetchCountries = async () => {
  try {
    const data = await listCountries();
    return { data, error: null };
  } catch (error: any) {
    return { data: [], error: error?.message || 'Network error' };
  }
};

// Create lead API
export const createLead = async (payload: any) => {
  try {
    const response = await http.post(`${API_BASE_URL}/leads`, payload);
    if (response.data && response.data.success) {
      return { data: response.data.data, error: null, errors: null };
    }
    // If backend returns validation errors, include them in the result
    return { data: null, error: response.data?.message || 'Unknown error', errors: response.data?.errors || null };
  } catch (error: any) {
    const respErr = error?.response?.data;
    return {
      data: null,
      error: respErr?.message || error.message || 'Network error',
      errors: respErr?.errors || null,
    };
  }
};
