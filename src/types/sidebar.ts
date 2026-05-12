export interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobile: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}
