export interface CreateProps {
    inline?: boolean;
    mode?: 'create' | 'edit';
    initialData?: Record<string, any>;
    onClose?: () => void;
    onSave?: (data: Record<string, any>) => void;
}