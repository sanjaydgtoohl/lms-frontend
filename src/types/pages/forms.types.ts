export type FormMode = 'create' | 'edit';

/** Standard inline master form (brand, industry, source, brief) */
export interface MasterInlineFormProps {
  onClose: () => void;
  inline?: boolean;
  initialData?: Record<string, any>;
  mode?: FormMode;
}

export interface MasterFormWithSaveProps extends MasterInlineFormProps {
  onSave?: (data: Record<string, any>) => void | Promise<unknown>;
}

/** RBAC create/edit pages (permission, role, user) */
export interface RbacFormPageProps {
  mode?: FormMode;
  initialData?: Record<string, any>;
}

export interface CitySelectProps {
  state: string;
  value: string;
  onChange: (val: string) => void;
  preselectedCityName?: string;
}

export interface ParentAgencyFormValues {
  name: string;
  type: string;
  client: string[];
}

export interface ChildAgencyFormValues {
  id: string;
  name: string;
  type: string;
  client: string[];
}

export interface CreateAgencyFormProps {
  onClose: () => void;
  onSave?: (payload: {
    parent: ParentAgencyFormValues;
    children: Array<{ name: string; type: string; client: string[] }>;
  }) => Promise<unknown> | unknown;
  mode?: FormMode;
  initialData?: Record<string, any>;
}

export interface MissCampaignCreateProps {
  inline?: boolean;
  mode?: FormMode;
  initialData?: Record<string, any>;
  onClose?: () => void;
  onSave?: (data: Record<string, any>) => void;
}

export interface CreateSourceFormProps {
  onClose: () => void;
  onSave?: (data: Record<string, any>) => void;
  inline?: boolean;
}

export interface CreateIndustryFormProps {
  onClose: () => void;
  onSave?: (data: Record<string, any>) => void;
}
