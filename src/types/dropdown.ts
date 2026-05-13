export interface CallStatusDropdownProps {
  value: string;
  options: string[];
  onChange: (newStatus: string) => void;
  onConfirm?: (newStatus: string) => Promise<void>;
}

export interface ChevronDropdownIconProps {
  isOpen?: boolean;
  className?: string;
}

export interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
  onConfirm?: (newValue: string) => Promise<void>;
}
