import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  FileText,
  Megaphone,
  Speaker,
  DollarSign,
  UserCog,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  Briefcase,
  GraduationCap,
  Factory,
  UserCheck,
} from "lucide-react";

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
  const [expandedItems, setExpandedItems] = useState<string[]>(["master-data"]);
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  
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
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "Master Data",
      icon: Database,
      children: [
        { name: "Brand Master", path: "/master/brand", icon: Building2 },
        { name: "Agency Master", path: "/master/agency", icon: Briefcase },
        { name: "Department Master", path: "/master/department", icon: GraduationCap },
        { name: "Designation Master", path: "/master/designation", icon: UserCheck },
        { name: "Industry Master", path: "/master/industry", icon: Factory },
        { name: "Lead Source", path: "/lead-source", icon: Target },
      ],
    },
    { name: "Lead Management", path: "/lead-management", icon: Users },
    { name: "Brief", path: "/brief", icon: FileText },
    { name: "Miss Campaign", path: "/miss-campaign", icon: Megaphone },
    { name: "Campaign Management", path: "/campaign-management", icon: Speaker },
    { name: "Finance", path: "/finance", icon: DollarSign },
    { name: "User Management", path: "/user-management", icon: UserCog },
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
                // identical across breakpoints (w-5 = 1.25rem = 20px)
                className={`shrink-0 w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-black ${isCollapsed ? "" : "mr-3"}`}
              />
              {!isCollapsed && <span className="text-black">{item.name}</span>}
            </Link>
          ) : (
            <div
              className={`flex items-center w-full ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <IconComponent
                className={`shrink-0 w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-black ${isCollapsed ? "" : "mr-3"}`}
              />
              {!isCollapsed && <span className="text-black">{item.name}</span>}
            </div>
          )}

          {hasChildren && !isCollapsed && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-black" />
              ) : (
                <ChevronRight className="shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-black" />
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
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                onClick={() => setShowMobilePopup(false)}
              >
                {React.createElement(child.icon, {
                  className: "w-4 h-4 mr-2 text-gray-500",
                })}
                <span>{child.name}</span>
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
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Logo Section */}
      <div className="flex h-16 border-b border-gray-100 shadow-sm pl-3">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-700 font-bold text-xl">L</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-700 font-bold text-xl">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 tracking-wide leading-none">
                LMS
              </span>
              <span className="text-sm text-gray-500 tracking-wide">
                Mobiyoung
              </span>
            </div>
       
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div
          className={`flex items-center px-4 py-2.5 text-sm font-medium text-black rounded-lg hover:bg-green-50 transition-all cursor-pointer ${
            isCollapsed ? "px-2 justify-center" : ""
          }`}
        >
          <HelpCircle
            className={`shrink-0 w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] text-black ${isCollapsed ? "" : "mr-3"}`}
          />
          {!isCollapsed && <span className="text-black">Help</span>}
        </div>

        <div
          className={`flex items-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer ${
            isCollapsed ? "px-2 justify-center" : ""
          }`}
        >
          <LogOut className={`shrink-0 w-5 h-5 min-w-[1.25rem] min-h-[1.25rem] ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
