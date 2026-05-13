export interface SubmittedPlanFile {
    path: string;
    url: string;
    name: string;
}

export interface PlannerStatus {
    id: number;
    name: string;
}

export interface BriefSummary {
    id: number;
    uuid: string;
    name: string;
    product_name: string;
}

export interface EditSubmittedPlanResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        status: string;
        status_label: string;
        brief: BriefSummary;
        planner_status: PlannerStatus;
        submitted_plan: SubmittedPlanFile[];
        submitted_plan_count: number;
        backup_plan: string | null;
        backup_plan_url: string | null;
        has_backup_plan: boolean;
        created_at: string;
        updated_at: string;
        planner_id?: number; // for convenience if present in response
    };
}



// edit user type 

export interface EditUserPayload {
    name: string;
    email: string;
    phone?: string | null;
    zone?: string | null;
    zone_id?: string | null;
    zone_name?: string | null;
    origination?: string | null;
    organisation_id?: string | null;
    organisation_name?: string | null;
    password?: string;
    password_confirmation?: string;
    role_ids?: number[];
    manager_ids?: number[];
    is_parent?: string;
}

export interface EditUserDetail {
    id: string | number;
    name: string;
    email: string;
    phone?: string | null;
    role_id?: number;
    role?: {
        id: string | number;
        name: string;
        description?: string;
    };
    roles?: Array<{
        id: string | number;
        name: string;
        description?: string;
    }>;
    managers?: Array<{
        id: string | number;
        name: string;
    }>;
    parent?: {
        id: string | number;
        name: string;
        email?: string;
    };
    // API may return a `parents` array (list of possible managers / parents)
    parents?: Array<{
        id: string | number;
        name: string;
        email?: string;
        // some responses include nested parents as an empty array
        parents?: any[];
    }>;
    created_at?: string;
    updated_at?: string;
    last_login_at?: string | null;
    // Optional formatted / human readable fields returned by API
    created_at_formatted?: string;
    updated_at_formatted?: string;
    created_at_human?: string;
    updated_at_human?: string;
    avatar_url?: string;
    full_name?: string;
}