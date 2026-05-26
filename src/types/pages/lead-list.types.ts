import type { ReactNode } from 'react';

export interface LeadListPageProps {
  title: string;
  filterStatus?: string;
  extraStatuses?: string[];
  permissionStatus?: string;
  headerActions?: ReactNode;
  /** Extra controls rendered inside the shared Filters dropdown (e.g. meeting status). */
  filterExtras?: ReactNode;
  /** When true, highlights the Filters button (partial extra filter applied). */
  extraFilterActive?: boolean;
}
