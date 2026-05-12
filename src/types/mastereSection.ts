export interface MasterCreateHeaderProps {
    title?: string;
    onClose?: () => void;
}

export interface FormField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: { label: string; value: string }[];
}

export interface MasterFormProps {
    fields: FormField[];
    onSubmit?: (data: Record<string, any>) => void;
    initialData?: Record<string, any>;
    submitLabel?: string;
}

export interface MasterFormHeaderProps {
    onBack: () => void;
    title: string;
}