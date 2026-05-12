export interface AssignButtonProps {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
}


export interface AssignDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
  onConfirm?: (newValue: string) => Promise<void>;
  context?: 'brief' | 'lead';
}

export interface CallStatusButtonProps {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
}