/**
 * Service for handling location, category, and device API calls
 * Uses local HTTP client with proxy to avoid CORS issues
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';


const RAW_SSP_BASE_URL =
  (typeof globalThis !== 'undefined' && (globalThis as any).VITE_SSP_BASE_URL) ||
  String(import.meta.env.VITE_SSP_BASE_URL || '').trim();

const normalizedSspBaseUrl = RAW_SSP_BASE_URL.replace(/\/$/, '');
const locationApiBaseUrl =
  normalizedSspBaseUrl && /^https?:\/\//i.test(normalizedSspBaseUrl)
    ? /\/api$/i.test(normalizedSspBaseUrl)
      ? normalizedSspBaseUrl
      : `${normalizedSspBaseUrl}/api`
    : '/ssp-api';

const sspApiClient: AxiosInstance = axios.create({
  baseURL: locationApiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
sspApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('SSP API Error:', error.message);
    throw error;
  }
);

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

// ============ CACHE & REQUEST DEDUPLICATION ============
interface CacheEntry {
  data: LocationOption[];
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const apiCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<LocationOption[]>>();

/**
 * Get from cache if valid, otherwise return null
 */
function getFromCache(key: string): LocationOption[] | null {
  const entry = apiCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    console.debug(`Cache hit for ${key}`);
    return entry.data;
  }
  return null;
}

/**
 * Store in cache
 */
function setCache(key: string, data: LocationOption[]): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Transform API response data to standard format
 */
function transformToOptions(data: any): LocationOption[] {
  if (!data) return [];

  // ✅ handle wrapped API response
  if (data.items && Array.isArray(data.items)) {
    data = data.items;
  }

  // ✅ handle array
  if (Array.isArray(data)) {
    return data.map((item: any, index: number) => {
      // string case
      if (typeof item === 'string') {
        return {
          id: item,
          name: item,
          label: item,
        };
      }

      // object case
      const objectIdKey = Object.keys(item || {}).find((key) => /(^id$|_id$)/i.test(key));
      const objectIdValue = objectIdKey ? item[objectIdKey] : undefined;
      return {
        id: item.id ?? item.value ?? objectIdValue ?? index,
        name: item.name || item.label || item.value || String(item),
        label: item.label || item.name || item.value,
      };
    });
  }

  // ✅ handle object map
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
 * Make API request with caching and deduplication
 * Uses local HTTP client routed through Vite proxy
 */
async function makeApiRequest(endpoint: string, payload: any = {}): Promise<LocationOption[]> {
  const cacheKey = `POST:${endpoint}:${JSON.stringify(payload)}`;

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Check for pending request to avoid duplicate API calls
  if (pendingRequests.has(cacheKey)) {
    console.debug(`Waiting for pending request: ${cacheKey}`);
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      const formPayload = new URLSearchParams();
      Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null && v !== '') {
              formPayload.append(key, String(v));
            }
          });
          return;
        }
        formPayload.append(key, String(value));
      });

      const response = await sspApiClient.post(endpoint, formPayload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      if (!data) {
        throw new Error('No data in response');
      }

      // Handle both direct data and wrapped responses
      const resultData = data.data || data;
      const options = transformToOptions(resultData);
      setCache(cacheKey, options);
      return options;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // Return empty array on error so UI doesn't break
      return [];
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(cacheKey);
    }
  })();

  // Add to pending requests
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

// ============ LOCATION APIs ============

export async function fetchCountries(): Promise<LocationOption[]> {
  try {
    return await makeApiRequest('/location/countries', {});
  } catch (error) {
    console.warn('Warning: Could not fetch countries:', error);
    return [];
  }
}

export async function fetchStates(countryId?: string | number): Promise<LocationOption[]> {
  try {
    const hasCountry = countryId !== undefined && countryId !== null && String(countryId).trim() !== '';
    return await makeApiRequest('/location/states', {
      // Backend contract requires `country` (string like "India").
      country: hasCountry ? String(countryId) : null,
      // Keep older keys for compatibility with mixed backend deployments.
      country_id: hasCountry ? countryId : null,
      ...(hasCountry ? { 'country[]': [String(countryId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch states:', error);
    return [];
  }
}

export async function fetchCities(stateId?: string | number): Promise<LocationOption[]> {
  try {
    const hasState = stateId !== undefined && stateId !== null && String(stateId).trim() !== '';
    return await makeApiRequest('/location/cities', {
      state: hasState ? String(stateId) : null,
      state_id: hasState ? stateId : null,
      ...(hasState ? { 'state[]': [String(stateId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch cities:', error);
    return [];
  }
}

export async function fetchZones(cityId?: string | number): Promise<LocationOption[]> {
  try {
    const hasCity = cityId !== undefined && cityId !== null && String(cityId).trim() !== '';
    return await makeApiRequest('/location/zones', {
      city: hasCity ? String(cityId) : null,
      city_id: hasCity ? cityId : null,
      ...(hasCity ? { 'city[]': [String(cityId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch zones:', error);
    return [];
  }
}

export async function fetchSubZones(zoneId?: string | number): Promise<LocationOption[]> {
  try {
    const hasZone = zoneId !== undefined && zoneId !== null && String(zoneId).trim() !== '';
    return await makeApiRequest('/location/sub-zones', {
      zone: hasZone ? String(zoneId) : null,
      zone_id: hasZone ? zoneId : null,
      ...(hasZone ? { 'zone[]': [String(zoneId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch sub-zones:', error);
    return [];
  }
}

export async function fetchPincodes(subZoneId?: string | number): Promise<LocationOption[]> {
  try {
    const hasSubZone = subZoneId !== undefined && subZoneId !== null && String(subZoneId).trim() !== '';
    return await makeApiRequest('/location/pincodes', {
      sub_zone: hasSubZone ? String(subZoneId) : null,
      subzone_id: hasSubZone ? subZoneId : null,
      ...(hasSubZone ? { 'sub_zone[]': [String(subZoneId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch pincodes:', error);
    return [];
  }
}

export async function fetchArterialRoutes(cityId?: string | number): Promise<LocationOption[]> {
  try {
    const hasCity = cityId !== undefined && cityId !== null && String(cityId).trim() !== '';
    return await makeApiRequest('/location/arterial-routes', {
      city: hasCity ? String(cityId) : null,
      city_id: hasCity ? cityId : null,
      ...(hasCity ? { 'city[]': [String(cityId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch arterial routes:', error);
    return [];
  }
}

// ============ CATEGORY APIs ============

export async function fetchModeOfMedia(): Promise<LocationOption[]> {
  try {
    return await makeApiRequest('/category/mode-of-media', {});
  } catch (error) {
    console.warn('Warning: Could not fetch mode of media:', error);
    return [];
  }
}

export async function fetchPublishers(modeOfMedia?: string | number): Promise<LocationOption[]> {
  try {
    const hasMode = modeOfMedia !== undefined && modeOfMedia !== null && String(modeOfMedia).trim() !== '';
    return await makeApiRequest('/category/publishers', {
      mode_of_media: hasMode ? String(modeOfMedia) : null,
      ...(hasMode ? { 'mode_of_media[]': [String(modeOfMedia)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch publishers:', error);
    return [];
  }
}

export async function fetchMainCategories(publisher?: string | number): Promise<LocationOption[]> {
  try {
    const hasPublisher = publisher !== undefined && publisher !== null && String(publisher).trim() !== '';
    return await makeApiRequest('/category/main', {
      publisher_id: hasPublisher ? publisher : null,
      publisher: hasPublisher ? String(publisher) : null,
      ...(hasPublisher ? { 'publisher[]': [String(publisher)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch main categories:', error);
    return [];
  }
}

export async function fetchCategories(mainCategory?: string | number): Promise<LocationOption[]> {
  try {
    const hasMainCategory =
      mainCategory !== undefined && mainCategory !== null && String(mainCategory).trim() !== '';
    return await makeApiRequest('/category/list', {
      main_category: hasMainCategory ? String(mainCategory) : null,
      main_category_id: hasMainCategory ? mainCategory : null,
      ...(hasMainCategory ? { 'main_category[]': [String(mainCategory)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch categories:', error);
    return [];
  }
}

export async function fetchSubCategories(categoryId?: string | number): Promise<LocationOption[]> {
  try {
    const hasCategory = categoryId !== undefined && categoryId !== null && String(categoryId).trim() !== '';
    return await makeApiRequest('/category/sub', {
      category: hasCategory ? String(categoryId) : null,
      category_id: hasCategory ? categoryId : null,
      ...(hasCategory ? { 'category[]': [String(categoryId)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch sub-categories:', error);
    return [];
  }
}

// ============ DEVICE APIs ============

export async function fetchLocationTypes(): Promise<LocationOption[]> {
  try {
    return await makeApiRequest('/device/location-types', {});
  } catch (error) {
    console.warn('Warning: Could not fetch location types:', error);
    return [];
  }
}

export async function fetchOrientations(locationType?: string | number): Promise<LocationOption[]> {
  try {
    const hasLocationType =
      locationType !== undefined && locationType !== null && String(locationType).trim() !== '';
    return await makeApiRequest('/device/orientations', {
      location_type: hasLocationType ? String(locationType) : null,
      ...(hasLocationType ? { 'location_type[]': [String(locationType)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch orientations:', error);
    return [];
  }
}

export async function fetchResolutions(orientation?: string | number): Promise<LocationOption[]> {
  try {
    const hasOrientation =
      orientation !== undefined && orientation !== null && String(orientation).trim() !== '';
    return await makeApiRequest('/device/resolutions', {
      orientation: hasOrientation ? String(orientation) : null,
      ...(hasOrientation ? { 'orientation[]': [String(orientation)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch resolutions:', error);
    return [];
  }
}

export async function fetchScreenLocations(resolution?: string | number): Promise<LocationOption[]> {
  try {
    const hasResolution = resolution !== undefined && resolution !== null && String(resolution).trim() !== '';
    return await makeApiRequest('/device/screen-locations', {
      resolution: hasResolution ? String(resolution) : null,
      ...(hasResolution ? { 'resolution[]': [String(resolution)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch screen locations:', error);
    return [];
  }
}

export async function fetchStretches(screenLocation?: string | number): Promise<LocationOption[]> {
  try {
    const hasScreenLocation =
      screenLocation !== undefined && screenLocation !== null && String(screenLocation).trim() !== '';
    return await makeApiRequest('/device/stretches', {
      screen_location: hasScreenLocation ? String(screenLocation) : null,
      ...(hasScreenLocation ? { 'screen_location[]': [String(screenLocation)] } : {}),
    });
  } catch (error) {
    console.warn('Warning: Could not fetch stretches:', error);
    return [];
  }
}

export async function fetchProperties(stretch?: string | number): Promise<LocationOption[]> {
  try {
    const hasStretch = stretch !== undefined && stretch !== null && String(stretch).trim() !== '';
    return await makeApiRequest('/device/properties', {
      stretch: hasStretch ? String(stretch) : null,
      ...(hasStretch ? { 'stretch[]': [String(stretch)] } : {}),
    });
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
      fetchPublishers(undefined),
      fetchMainCategories(undefined),
      fetchLocationTypes(),
      fetchOrientations(undefined),
      fetchResolutions(undefined),
      fetchScreenLocations(undefined),
      fetchStretches(undefined),
      fetchProperties(undefined),
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

// ============ CACHE CONTROL & DEBUGGING ============

/**
 * Clear all cached data (useful for development/debugging)
 */
export function clearApiCache(): void {
  apiCache.clear();
  pendingRequests.clear();
  console.info('API cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getApiCacheStats(): { cacheEntries: number; pendingRequests: number } {
  return {
    cacheEntries: apiCache.size,
    pendingRequests: pendingRequests.size,
  };
}
