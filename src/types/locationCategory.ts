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
export interface CacheEntry {
    data: LocationOption[];
    timestamp: number;
}