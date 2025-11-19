import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Globe,
  Settings,
  Search,
  Radio,
} from "lucide-react";
import File02Icon from "../../assets/icons/File02Icon";
import AgencyMasterIcon from "../../assets/icons/AgencyMasterIcon";
import BrandMasterIcon from "../../assets/icons/BrandMasterIcon";
import DepartmentMasterIcon from "../../assets/icons/DepartmentMasterIcon";
import DesignationMasterIcon from "../../assets/icons/DesignationMasterIcon";
import UserManagementIcon from "../../assets/icons/UserManagementIcon";
import LeadManagementIcon from "../../assets/icons/LeadManagementIcon";
import CampaignManagementIcon from "../../assets/icons/CampaignManagementIcon";
import FinanceIcon from "../../assets/icons/FinanceIcon";
import LogoutIcon from "../../assets/icons/LogoutIcon";
import Brief2Icon from "../../assets/icons/Brief2Icon";
import HelpIcon from "../../assets/icons/HelpIcon";
import { useAuthStore } from "../../store/auth";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  // Mobile specific
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobile = false, mobileOpen = false, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowMobilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mobile: close on Escape key
  useEffect(() => {
    if (!isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile && onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, onCloseMobile]);

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    {
      name: "Master Data",
      icon: File02Icon,
      children: [
        { name: "Brand Master", path: "/master/brand", icon: BrandMasterIcon },
        { name: "Agency Master", path: "/master/agency", icon: AgencyMasterIcon },
        { name: "Department Master", path: "/master/department", icon: DepartmentMasterIcon },
        { name: "Designation Master", path: "/master/designation", icon: DesignationMasterIcon },
        { name: "Industry Master", path: "/master/industry", icon: Radio },
        { name: "Lead Source", path: "/master/source", icon: Search },
      ],
    },
  {
    name: "Lead Management",
    icon: LeadManagementIcon,
    children: [
      { name: "All Leads", path: "/lead-management/all-leads", icon: LeadManagementIcon },
      { name: "Pending", path: "/lead-management/pending", icon: LeadManagementIcon },
      { name: "Interested", path: "/lead-management/interested", icon: LeadManagementIcon },
      { name: "Meeting Scheduled", path: "/lead-management/meeting-scheduled", icon: LeadManagementIcon },
      { name: "Meeting Done", path: "/lead-management/meeting-done", icon: LeadManagementIcon },
    ],
  },
  {
    name: "Brief",
    icon: Brief2Icon,
    children: [
      { name: "Brief Pipeline", path: "/brief/Brief_Pipeline", icon: Brief2Icon },
      // Create Brief form route
      { name: "Brief Request", path: "/brief/create", icon: Brief2Icon },
    ],
  },
    {
      name: "Miss Campaign",
      icon: Globe,
      children: [
        { name: "View", path: "/miss-campaign/view", icon: Globe },
        { name: "Create", path: "/miss-campaign/create", icon: Globe }
      ]
    },
    { name: "Campaign Management", path: "/campaign-management", icon: CampaignManagementIcon },
  { name: "Finance", path: "/finance", icon: FinanceIcon },
    {
      name: "User Management",
      icon: UserManagementIcon,
      children: [
        { name: "Permission", path: "/user-management/permission", icon: UserManagementIcon },
        { name: "Role", path: "/user-management/role", icon: UserManagementIcon },
        { name: "User", path: "/user-management/user", icon: UserManagementIcon },
      ]
    },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // Toggle expansion for a parent item. When expanding a parent,
  // collapse others so only one parent menu is open at a time.
  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemName)) {
        return prev.filter((item) => item !== itemName);
      }
      // open only this one (single-open behavior)
      return [itemName];
    });
  };

  // Route aliases map specific routes to the navigation path that should be
  // considered active. This lets us treat `/lead-management/create` as if the
  // user is on `/lead-management/all-leads` so the sidebar highlights the
  // All Leads item while the Create Lead page is open.
  const routeAliases: Record<string, string> = {
    "/lead-management/create": "/lead-management/all-leads",
    "/user-management/permission/create": "/user-management/permission",
    "/user-management/role/create": "/user-management/role",
    "/user-management/user/create": "/user-management/user",
  };

  const getEffectivePath = (pathname: string) => {
    // Handle edit routes with IDs like /user-management/permission/edit/:id, /user-management/role/edit/:id, and /user-management/user/edit/:id
    if (pathname.match(/^\/user-management\/(permission|role|user)\/edit\//)) {
      const match = pathname.match(/^\/user-management\/(\w+)\/edit\//);
      if (match) {
        return `/user-management/${match[1]}`;
      }
    }
    return routeAliases[pathname] ?? pathname;
  };

  // Treat a path as active when the effective pathname is exactly the path
  // or when the effective pathname is a nested route under that path.
  const isActive = (path: string) => {
    const effective = getEffectivePath(location.pathname);
    return effective === path || effective.startsWith(path + "/");
  };

  const isParentActive = (item: NavigationItem) => {
    if (item.path) return isActive(item.path);
    if (item.children)
      return item.children.some((child) => child.path && isActive(child.path));
    return false;
  };

  // Ensure parent menus (like "Master Data") are expanded when any of their
  // child routes are active. This makes the menu remain open on refresh when
  // a master page (e.g. /master/agency) is loaded directly.
  useEffect(() => {
    const effectivePath = getEffectivePath(location.pathname);

    const activeParents = navigationItems
      .filter((item) =>
        item.children &&
        item.children.some((child) => {
          if (!child.path) return false;
          // consider both exact match and nested routes (startsWith)
          return effectivePath === child.path || effectivePath.startsWith(child.path + "/");
        })
      )
      .map((item) => item.name.toLowerCase().replace(/\s+/g, "-"));

    // Replace expanded items with the parents active for the current route.
    // This collapses any open parent menus when navigating to routes that
    // don't belong to them and avoids a visible "blink" caused by
    // clearing then immediately re-opening menus.
    setExpandedItems(activeParents);
  }, [location.pathname]);

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const slug = item.name.toLowerCase().replace(/\s+/g, "-");
    const isExpanded = expandedItems.includes(slug);
    const isItemActive = isParentActive(item);
    const IconComponent = item.icon;

    const handleCardClick = () => {
      if (hasChildren) {
        if (isCollapsed && item.name === "Master Data") {
          setShowMobilePopup(!showMobilePopup);
        } else {
          toggleExpanded(slug);
        }
      } else if (item.path) {
        navigate(item.path);
      }
    };

    return (
      <div key={item.name}>
        <div
          className={`
            flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer rounded-lg
            transition-all duration-200 ease-in-out
            ${level > 0 ? "ml-6" : ""}
            ${isItemActive ? "bg-orange-100" : "hover:bg-orange-50"}
            ${isCollapsed ? "px-2 justify-center" : ""}
          `}
          onClick={handleCardClick}
        >
          <div
            className={`flex items-center w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <IconComponent
              // enforce a fixed visual size and prevent flex shrinking so icons remain
              // identical across breakpoints (w-4 = 1rem = 16px)
              className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)] ${isCollapsed ? "" : "mr-2.5"}`}
            />
            {!isCollapsed && <span className="text-[var(--text-primary)]">{item.name}</span>}
          </div>

          {hasChildren && !isCollapsed && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)]" />
              ) : (
                <ChevronRight className="shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)]" />
              )}
            </div>
          )}
        </div>

        {/* Mobile Popup Menu */}
        {hasChildren && isCollapsed && showMobilePopup && item.name === "Master Data" && (
          <div
            ref={popupRef}
            className="fixed left-16 top-0 mt-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
          >
            {item.children?.map((child) => (
              <Link
                key={child.name}
                to={child.path || ""}
                className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-orange-50"
                onClick={() => {
                  setShowMobilePopup(false);
                }}
              >
                {React.createElement(child.icon, {
                  className: "w-4 h-4 mr-2 text-[var(--text-primary)]",
                })}
                <span className="text-[var(--text-primary)]">{child.name}</span>
              </Link>
            ))}
          </div>
        )}
 
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-2 space-y-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Mobile variant: icon-only slide-in panel
  if (isMobile) {
    return (
      <div
        aria-hidden={!mobileOpen}
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out z-40 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} w-16`}
        ref={popupRef}
      >
        {/* Render collapsed (icons-only) content inside */}
        <div className="flex h-16 items-center px-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-[#F5F7FA] font-semibold text-xl leading-none">L</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-1 scrolling-touch">
          <div className="space-y-1">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-2 space-y-2">
          <div
            className={`flex items-center px-2 py-2 text-sm font-medium text-[var(--text-primary)] rounded-lg hover:bg-orange-50 transition-all cursor-pointer justify-center`}
            onClick={() => onCloseMobile && onCloseMobile()}
          >
            <HelpIcon className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)]`} />
          </div>

          <div
            onClick={() => {
              handleLogout();
              onCloseMobile && onCloseMobile();
            }}
            className={`flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer justify-center`}
          >
            <LogoutIcon className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-red-600`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-4">
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-[#F5F7FA] font-semibold text-xl leading-none">L</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-[#F5F7FA] font-semibold text-xl leading-none">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[var(--text-primary)] tracking-wide leading-none">
                LMS
              </span>
              <span className="text-sm font-medium text-[var(--text-secondary)] tracking-wide">
                Mobiyoung
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
  <nav className="flex-1 overflow-y-auto py-4 px-2 scrolling-touch">
        <div className="space-y-1">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div
          className={`flex items-center px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] rounded-lg hover:bg-orange-50 transition-all cursor-pointer ${
            isCollapsed ? "px-2 justify-center" : ""
          }`}
        >
          <HelpIcon
            className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)] ${isCollapsed ? "" : "mr-2.5"}`}
          />
          {!isCollapsed && <span className="text-[var(--text-primary)]">Help</span>}
        </div>

        <div
          onClick={handleLogout}
          className={`flex items-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer ${
            isCollapsed ? "px-2 justify-center" : ""
          }`}
        >
          <LogoutIcon className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-red-600 ${isCollapsed ? "" : "mr-2.5"}`} />
          {!isCollapsed && <span>Log out</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
