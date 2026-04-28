/**
 * Service for handling location, category, and device API calls
 * Base URL: https://ssp.dgtoohl.com
 */

const API_BASE = 'https://ssp.dgtoohl.com/api';

// Types
export interface LocationOption {
  id: string | number;
  name: string;
  label?: string;
}

export interface CascadingFilterOptions {
  countries: LocationOption[];
  states: LocationOption[];
  cities: LocationOption[];
  zones: LocationOption[];
  subZones: LocationOption[];
  pincodes: LocationOption[];
  arterialRoutes: LocationOption[];
  modeOfMedia: LocationOption[];
  publishers: LocationOption[];
  mainCategories: LocationOption[];
  categories: LocationOption[];
  subCategories: LocationOption[];
  locationTypes: LocationOption[];
  orientations: LocationOption[];
  resolutions: LocationOption[];
  screenLocations: LocationOption[];
  stretches: LocationOption[];
  properties: LocationOption[];
}

/**
 * Transform API response data to standard format
 */
function transformToOptions(data: any): LocationOption[] {
  if (!data) return [];

  // Handle different response formats
  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      id: item.id || item.value || item.code || item,
      name: item.name || item.label || item.title || String(item),
      label: item.label || item.name,
    }));
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key,
      name: value?.name || value?.label || String(value),
      label: value?.label || value?.name,
    }));
  }

  return [];
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(res: Response): Promise<T> {
  // Check HTTP status
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
    console.error('API Response Error:', error);
    throw error;
  }

  const data = await res.json();

  if (!data) {
    const error = new Error('No data in response');
    throw error;
  }

  // Check if response has success flag
  if (data.success === false || (data.status && data.status !== 200 && data.status !== 'success')) {
    const error = new Error(data.message || data.error || 'API request failed');
    throw error;
  }

  // Return data or response itself
  return (data.data || data) as T;
}

// ============ LOCATION APIs ============

export async function fetchCountries(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/location/countries`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch countries:', error);
    return [];
  }
}

// export async function fetchStates(countryId?: string | number): Promise<LocationOption[]> {
//   try {
//     const url = countryId
//       ? `${API_BASE}/location/states?country_id=${countryId}`
//       : `${API_BASE}/location/states`;
//     const response = await fetch(url);
//     const data = await handleResponse<any>(response);
//     return transformToOptions(data);
//   } catch (error) {
//     console.warn('Warning: Could not fetch states:', error);
//     return [];
//   }
// }

export async function fetchStates(countryId?: string | number): Promise<LocationOption[]> {
  const response = await fetch(`${API_BASE}/location/states`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      country_id: countryId || null,
    }),
  });

  const data = await handleResponse<any>(response);
  return transformToOptions(data);
}

export async function fetchCities(stateId?: string | number): Promise<LocationOption[]> {
  try {
    const url = stateId
      ? `${API_BASE}/location/cities?state_id=${stateId}`
      : `${API_BASE}/location/cities`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch cities:', error);
    return [];
  }
}

export async function fetchZones(cityId?: string | number): Promise<LocationOption[]> {
  try {
    const url = cityId
      ? `${API_BASE}/location/zones?city_id=${cityId}`
      : `${API_BASE}/location/zones`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch zones:', error);
    return [];
  }
}

export async function fetchSubZones(zoneId?: string | number): Promise<LocationOption[]> {
  try {
    const url = zoneId
      ? `${API_BASE}/location/sub-zones?zone_id=${zoneId}`
      : `${API_BASE}/location/sub-zones`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch sub-zones:', error);
    return [];
  }
}

export async function fetchPincodes(subZoneId?: string | number): Promise<LocationOption[]> {
  try {
    const url = subZoneId
      ? `${API_BASE}/location/pincodes?subzone_id=${subZoneId}`
      : `${API_BASE}/location/pincodes`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch pincodes:', error);
    return [];
  }
}

export async function fetchArterialRoutes(cityId?: string | number): Promise<LocationOption[]> {
  try {
    const url = cityId
      ? `${API_BASE}/location/arterial-routes?city_id=${cityId}`
      : `${API_BASE}/location/arterial-routes`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch arterial routes:', error);
    return [];
  }
}

// ============ CATEGORY APIs ============

export async function fetchModeOfMedia(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/category/mode-of-media`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch mode of media:', error);
    return [];
  }
}

export async function fetchPublishers(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/category/publishers`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch publishers:', error);
    return [];
  }
}

export async function fetchMainCategories(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/category/main`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch main categories:', error);
    return [];
  }
}

export async function fetchCategories(mainCategoryId?: string | number): Promise<LocationOption[]> {
  try {
    const url = mainCategoryId
      ? `${API_BASE}/category/list?main_category_id=${mainCategoryId}`
      : `${API_BASE}/category/list`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch categories:', error);
    return [];
  }
}

export async function fetchSubCategories(categoryId?: string | number): Promise<LocationOption[]> {
  try {
    const url = categoryId
      ? `${API_BASE}/category/sub?category_id=${categoryId}`
      : `${API_BASE}/category/sub`;
    const response = await fetch(url);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch sub-categories:', error);
    return [];
  }
}

// ============ DEVICE APIs ============

export async function fetchLocationTypes(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/location-types`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch location types:', error);
    return [];
  }
}

export async function fetchOrientations(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/orientations`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch orientations:', error);
    return [];
  }
}

export async function fetchResolutions(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/resolutions`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch resolutions:', error);
    return [];
  }
}

export async function fetchScreenLocations(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/screen-locations`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch screen locations:', error);
    return [];
  }
}

export async function fetchStretches(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/stretches`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch stretches:', error);
    return [];
  }
}

export async function fetchProperties(): Promise<LocationOption[]> {
  try {
    const response = await fetch(`${API_BASE}/device/properties`);
    const data = await handleResponse<any>(response);
    return transformToOptions(data);
  } catch (error) {
    console.warn('Warning: Could not fetch properties:', error);
    return [];
  }
}

// ============ BATCH FETCH - For initial load ============

export async function fetchAllFilterOptions(): Promise<CascadingFilterOptions> {
  try {
    const [
      countries,
      modeOfMedia,
      publishers,
      mainCategories,
      locationTypes,
      orientations,
      resolutions,
      screenLocations,
      stretches,
      properties,
    ] = await Promise.all([
      fetchCountries(),
      fetchModeOfMedia(),
      fetchPublishers(),
      fetchMainCategories(),
      fetchLocationTypes(),
      fetchOrientations(),
      fetchResolutions(),
      fetchScreenLocations(),
      fetchStretches(),
      fetchProperties(),
    ]);

    return {
      countries,
      states: [],
      cities: [],
      zones: [],
      subZones: [],
      pincodes: [],
      arterialRoutes: [],
      modeOfMedia,
      publishers,
      mainCategories,
      categories: [],
      subCategories: [],
      locationTypes,
      orientations,
      resolutions,
      screenLocations,
      stretches,
      properties,
    };
  } catch (error) {
    console.warn('Warning: Could not fetch all filter options:', error);
    return {
      countries: [],
      states: [],
      cities: [],
      zones: [],
      subZones: [],
      pincodes: [],
      arterialRoutes: [],
      modeOfMedia: [],
      publishers: [],
      mainCategories: [],
      categories: [],
      subCategories: [],
      locationTypes: [],
      orientations: [],
      resolutions: [],
      screenLocations: [],
      stretches: [],
      properties: [],
    };
  }
}
