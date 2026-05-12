export interface ActionMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
  onChat?: () => void;
  onCreateMeeting?: () => void;
  onBriefCreation?: () => void;
  /** Permission slugs for additional checks */
  editPermissionSlug?: string;
  viewPermissionSlug?: string;
  deletePermissionSlug?: string;
  uploadPermissionSlug?: string;
  /** If true, forces the menu to open above the trigger (used for last rows) */
  isLast?: boolean;
  /** Index of the row (0-based) - helps determine if near bottom */
  rowIndex?: number;
  /** Total number of rows - helps determine if near bottom */
  totalRows?: number;
}