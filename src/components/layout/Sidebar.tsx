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
}

interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
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
  { name: "Lead Management", path: "/lead-management", icon: LeadManagementIcon },
  { name: "Brief", path: "/brief", icon: Brief2Icon },
    { name: "Miss Campaign", path: "/miss-campaign", icon: Globe },
    { name: "Campaign Management", path: "/campaign-management", icon: CampaignManagementIcon },
  { name: "Finance", path: "/finance", icon: FinanceIcon },
    { name: "User Management", path: "/user-management", icon: UserManagementIcon },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const isParentActive = (item: NavigationItem) => {
    if (item.path) return isActive(item.path);
    if (item.children)
      return item.children.some((child) => child.path && isActive(child.path));
    return false;
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(
      item.name.toLowerCase().replace(/\s+/g, "-")
    );
    const isItemActive = isParentActive(item);
    const IconComponent = item.icon;

    return (
      <div key={item.name}>
        <div
          className={`
            flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer rounded-lg
            transition-all duration-200 ease-in-out
            ${level > 0 ? "ml-6" : ""}
            ${isItemActive ? "bg-green-100" : "hover:bg-green-50"}
            ${isCollapsed ? "px-2 justify-center" : ""}
          `}
          onClick={() => {
            if (hasChildren) {
              if (isCollapsed && item.name === "Master Data") {
                setShowMobilePopup(!showMobilePopup);
              } else {
                toggleExpanded(item.name.toLowerCase().replace(/\s+/g, "-"));
              }
            }
          }}
        >
          {item.path ? (
            <Link
              to={item.path}
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
            </Link>
          ) : (
            <div
              className={`flex items-center w-full ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <IconComponent
                className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)] ${isCollapsed ? "" : "mr-2.5"}`}
              />
              {!isCollapsed && <span className="text-[var(--text-primary)]">{item.name}</span>}
            </div>
          )}

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
                className="flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-green-50"
                onClick={() => setShowMobilePopup(false)}
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
          className={`flex items-center px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] rounded-lg hover:bg-green-50 transition-all cursor-pointer ${
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
