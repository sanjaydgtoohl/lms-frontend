export interface Props {
    title: string;
    filterStatus?: string; // if not provided, show all
    extraStatuses?: string[];
    permissionStatus?: string;
    headerActions?: React.ReactNode;
}

export interface UserOption {
    id: number | string;
    name: string;
}



// all lead interface type 

export interface LeadItem {
    id: string | number;
    name?: string;
    brand_name?: string;
    brand_id?: number | string;
    contact_person?: string;
    mobile_number?: string[];
    number?: string;
    phone?: string;
    email?: string;
    lead_source?: string;
    lead_sub_source?: string;
    priority_id?: number | string;
    current_assign_user?: number | string;
    [key: string]: any;
}

export type LeadListResponse = {
    data: LeadItem[];
    meta?: any;
};


// lead assign type 
export interface AssignLeadResponse<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
    meta?: any;
}

// lead source type 
export interface LeadSourceItem {
    id: string;
    source: string;
    subSource?: string;
    leadSourceId?: string;
    dateTime?: string;
}