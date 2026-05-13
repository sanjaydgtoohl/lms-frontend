export type Column<T> = {
    /** unique key for the column */
    key: string;
    /** header label */
    header: React.ReactNode;
    /** optional cell renderer - receives the row item */
    render?: (item: T) => React.ReactNode;
    /** hide this column from mobile card view (default false) */
    hideOnMobile?: boolean;
    /** optional className for the column cells */
    className?: string;
};

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    startIndex?: number; // starting index for Sr. No.
    loading?: boolean;
    onEdit?: (item: T) => void;
    onView?: (item: T) => void;
    onDelete?: (item: T) => void;
    onUpload?: (item: T) => void;
    onChat?: (item: T) => void;
    onCreateMeeting?: (item: T) => void;
    onBriefCreation?: (item: T) => void;
    /** Permission slugs for actions */
    editPermissionSlug?: string;
    viewPermissionSlug?: string;
    deletePermissionSlug?: string;
    uploadPermissionSlug?: string;
    /** optional render key extractor (defaults to item.id || index) */
    keyExtractor?: (item: T, index: number) => string;
    /** compact mode reduces cell padding (default false) */
    compact?: boolean;
    /** when true, show desktop table layout even on small screens (compact styles applied) */
    desktopOnMobile?: boolean;
}


// table  header 

export interface FilterOption {
    key: string;
    label: string;
    options: { value: string; label: string }[];
}

export interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
    filterOptions?: FilterOption[];
    onFilterChange?: (filters: Record<string, string>) => void;
    appliedFilters?: Record<string, string>;
}