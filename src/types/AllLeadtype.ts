export interface AllLeadtype {
  id: string;
  agencyName: string;
  brandName: string;
  contactPerson: string;
  phoneNumber: string;
  source: string;
  subSource: string;
  assignBy: string;
  assignTo: string;
  dateTime: string;
  status: string;
  leadStatus: string;
  callStatus: string;
  callAttempt: number;
  comment: string;
}

export interface CallStatusOption {
  id: number;
  name: string;
}

export interface UserOption {
  id: number | string;
  name: string;
}



export interface EditLeadtype {
  id: string;
  selectedOption: 'brand' | 'agency';
  brandId?: string;
  agencyId?: string;
  contacts: Array<{
    id: string;
    fullName: string;
    profileUrl: string;
    email: string;
    mobileNo: string;
    mobileNo2: string;
    showSecondMobile: boolean;
    type: string;
    designation: string;
    agencyBrand: string;
    subSource: string;
    department: string;
    country: string;
    state: string;
    city: string;
    zone: string;
    postalCode: string;
  }>;
  assignTo?: string;
  assignToName?: string;
  priority?: string;
  callFeedback?: string;
  comment?: string;
}


export interface Lead {
  id: string;
  agencyName?: string;
  brandName?: string;
  brand_name?: string;
  contactPerson?: string;
  contact_person?: string;
  phoneNumber?: string;
  mobile_number?: string[];
  source?: string;
  lead_source?: string;
  subSource?: string;
  lead_sub_source?: string;
  assignBy?: string;
  assignTo?: string;
  current_assign_user?: string | number;
  dateTime?: string;
  status?: string;
  callStatus?: string;
  callAttempt?: number;
  comment?: string;
  [key: string]: any;
}