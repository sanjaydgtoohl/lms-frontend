export interface Priority {
    id?: number | string;
    name?: string;
}

export interface AssignedUser {
    id?: number | string;
    name?: string;
    email?: string;
}

export interface ContactPerson {
    id?: number | string;
    name?: string;
    email?: string;
}

export interface CreatedByUser {
    id?: number | string;
    name?: string;
    email?: string;
}

export interface BriefStatus {
    id?: number | string;
    name?: string;
}

export interface BriefItem {
    id: string;
    briefId?: string;
    briefName?: string;
    brandName?: string;
    productName?: string;
    contactPerson?: string | ContactPerson;
    modeOfCampaign?: string;
    mediaType?: string;
    priority?: string | Priority;
    budget?: string | number;
    createdBy?: string | CreatedByUser;
    assignTo?: string | AssignedUser;
    status?: string;
    brief_status?: BriefStatus;
    briefDetail?: string;
    comment?: string;
    submissionDate?: string;
    campaignDuration?: string | number;
    attachmentUrl?: string;
    attachmentName?: string;
    dateTime?: string;
    _raw?: Record<string, unknown>;
    [key: string]: unknown;
}
