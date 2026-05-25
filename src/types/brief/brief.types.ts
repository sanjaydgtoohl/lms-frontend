export interface BriefPersonRef {
  id?: number;
  name?: string;
  email?: string;
}

export interface BriefLookupRef {
  id?: number;
  name?: string;
}

/** Brief detail shape for read-only view (BriefView) */
export interface BriefDetailViewModel {
  id?: number;
  uuid?: string;
  name?: string;
  product_name?: string;
  mode_of_campaign?: string;
  media_type?: string;
  budget?: string | number;
  comment?: string;
  submission_date?: string;
  brief_status?: BriefLookupRef;
  priority?: BriefLookupRef;
  contact_person?: BriefPersonRef;
  brand?: BriefLookupRef;
  agency?: BriefLookupRef;
  assigned_user?: BriefPersonRef;
  created_by_user?: BriefPersonRef;
  created_at?: string;
  updated_at?: string;
}

export interface BriefViewProps {
  brief: BriefDetailViewModel;
  onClose?: () => void;
  onEdit?: (id?: number) => void;
}
