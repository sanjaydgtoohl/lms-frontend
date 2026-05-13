
// API Response Interfaces
export interface ContactPersonRelation {
    id: number;
    name: string;
    email?: string;
}

export interface BrandRelation {
    id: number;
    name: string;
}

export interface UserRelation {
    id: number;
    name: string;
    email: string;
}

export interface RelationItem {
    id: number;
    name: string;
    slug?: string;
}

export interface LocationRelation {
    id: number;
    name: string;
}

export interface ContactPersonRaw {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    email: string | null;
    profile_url: string | null;
    mobile_number: string[];
    type: string;
    status: string;
    comment: string | null;
    brand_id: number;
    created_by: number;
    agency_id: number | null;
    current_assign_user: number;
    priority_id: number;
    lead_status: number;
    designation_id: number;
    department_id: number;
    sub_source_id: number;
    country_id: number;
    state_id: number;
    city_id: number;
    zone_id: number;
    postal_code: string;
    call_status: number;
    call_attempt: number;
    call_status_relation: RelationItem | null;
    lead_status_relation: RelationItem | null;
    brand: BrandRelation;
    agency: BrandRelation | null;
    created_by_user: UserRelation;
    assigned_user: UserRelation;
    priority: RelationItem;
    designation: RelationItem;
    department: RelationItem;
    sub_source: RelationItem;
    country: LocationRelation;
    state: LocationRelation;
    city: LocationRelation;
    zone: LocationRelation;
    status_relation: RelationItem | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface ContactPerson {
    id: string;
    uuid: string;
    name: string;
    email: string | null;
    phone: string;
    designation: string;
    department: string;
    brand: string;
    priority: string;
    leadStatus: string;
    callStatus: string;
    assignedUser: string;
    assignedUserEmail: string;
    country: string;
    state: string;
    city: string;
    zone: string;
    postalCode: string;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
    // Keep raw for extended access
    _raw?: ContactPersonRaw;
}

export type ContactPersonsListResponse = {
    data: ContactPerson[];
    meta?: {
        timestamp?: string;
        status_code?: number;
    }
};


// brand interface type
export interface BrandItem {
    id: string;
    name: string;
    agencyName?: string;
    brandType?: string;
    contactPerson?: string;
    industry?: string;
    country?: string;
    state?: string;
    city?: string;
    zone?: string;
    pinCode?: string;
    dateTime?: string;
    [key: string]: unknown;
}