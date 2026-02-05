import { listUsers } from './AllUsers';
import { listCountries } from './CreateBrandForm';
import { listStates } from './CreateBrandForm';
import { listCities } from './CreateBrandForm';
import { listZones } from './CreateBrandForm';
import { listDepartments } from './DepartmentMaster';
import { listDesignations } from './DesignationMaster';
import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';

// --- Types ---
export type Brand = {
  id: number;
  name: string;
};

export type Agency = {
  id: number;
  name: string;
};

export type User = {
  id: string | number;
  name: string;
  email?: string;
};

export type CreateLeadPayload = {
  name: string;
  email: string;
  mobile_number?: string;
  type?: string;
  brand_id?: number;
  agency_id?: number;
  [key: string]: any;
};

export type CreateLeadResponse = {
  id: number;
  name: string;
  email: string;
  [key: string]: any;
};

// --- Fetch users for Assign To dropdown ---
export async function getUsers(): Promise<User[]> {
  try {
    const { data } = await listUsers(1, 100);
    return data || [];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch brands for dropdown ---
export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await apiClient.get<Brand[]>('/brands');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch brands');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch agencies for dropdown ---
export async function getAgencies(): Promise<Agency[]> {
  try {
    const res = await apiClient.get<Agency[]>('/agencies');
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch agencies');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch designations for dropdown ---
export async function getDesignations() {
  try {
    const { data } = await listDesignations(1, 100);
    return data || [];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch departments for dropdown ---
export async function getDepartments() {
  try {
    const { data } = await listDepartments(1, 100);
    return data || [];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch zones for dropdown ---
export async function getZones() {
  try {
    return await listZones();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch cities for dropdown ---
export async function getCities(params?: { state_id?: string | number; country_id?: string | number }) {
  try {
    return await listCities(params);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch states for dropdown ---
export async function getStates(params?: { country_id?: string | number }) {
  try {
    return await listStates(params);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Fetch countries for dropdown ---
export async function getCountries() {
  try {
    return await listCountries();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// --- Create lead API ---
export async function createLead(payload: CreateLeadPayload): Promise<CreateLeadResponse> {
  try {
    const res = await apiClient.post<CreateLeadResponse>('/leads', payload);
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to create lead');
    }
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
