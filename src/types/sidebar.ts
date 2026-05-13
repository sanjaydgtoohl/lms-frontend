export interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobile: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}


// sidebar slice type
export interface SidebarState {
  isCollapsed: boolean;
  expandedItems: string[];
  mobileOpen: boolean;
}