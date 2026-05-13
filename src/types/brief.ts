// brief pipline type 
export interface UserOption { id: number | string; name: string; }

// brief view type 

export interface Person {
    id?: number;
    name?: string;
    email?: string;
}

export interface Lookup {
    id?: number;
    name?: string;
}

export interface BriefShape {
    id?: number;
    uuid?: string;
    name?: string;
    product_name?: string;
    mode_of_campaign?: string;
    media_type?: string;
    budget?: string | number;
    comment?: string;
    submission_date?: string;
    brief_status?: Lookup;
    priority?: Lookup;
    contact_person?: Person;
    brand?: Lookup;
    agency?: Lookup;
    assigned_user?: Person;
    created_by_user?: Person;
    created_at?: string;
    updated_at?: string;
}

export interface BriefViewProps {
    brief: BriefShape;
    onClose?: () => void;
    onEdit?: (id?: number) => void;
}



// brief assign types 
export interface UpdateAssignResponse<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
    meta?: any;
}



// brief log type 

export interface ContactPerson {
    id: number;
    name: string;
    email?: string | null;
}

export interface NamedEntity {
    id: number;
    name: string;
}

export interface BriefLogItem {
    id: number;
    brief_id?: number;
    name: string;
    action?: string;
    description?: string;
    user_name?: string;
    product_name?: string;
    mode_of_campaign?: string;
    media_type?: string;
    budget?: string | number;
    comment?: string;
    submission_date?: string;
    status?: string | number;
    left_time?: string;
    contact_person?: ContactPerson | null;
    brand?: NamedEntity | null;
    agency?: NamedEntity | null;
    assigned_user?: NamedEntity | null;
    created_by_user?: NamedEntity | null;
    brief_status?: NamedEntity | null;
    priority?: NamedEntity | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

export type BriefLogListResponse = {
    data: BriefLogItem[];
    meta?: any;
};


// brief status types

export interface BriefStatusItem {
    id: number | string;
    name: string;
    uuid?: string;
    [key: string]: any;
}

export interface BriefStatusResponse {
    success?: boolean;
    message?: string;
    data?: BriefStatusItem[];
    meta?: any;
}