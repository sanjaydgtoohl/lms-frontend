
export interface PermissionNode {
    id: number;
    display_name: string;
    name?: string;
    description?: string;
    url?: string;
    icon_file?: string | null;
    icon_text?: string;
    is_parent?: number | null;
    status?: string;
    order?: number;
    children?: PermissionNode[];
}

export interface PermissionTreeProps {
    data: PermissionNode[];
    selectedPermissionIds?: number[];
    onChange?: (selected: number[]) => void;
}
