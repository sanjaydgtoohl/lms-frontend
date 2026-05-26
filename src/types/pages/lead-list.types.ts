import type { ReactNode } from 'react';

export interface LeadListPageProps {
  title: string;
  filterStatus?: string;
  extraStatuses?: string[];
  permissionStatus?: string;
  headerActions?: ReactNode;
}
