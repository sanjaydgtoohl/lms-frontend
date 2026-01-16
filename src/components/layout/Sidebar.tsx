import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import LogoutIcon from "../../assets/icons/LogoutIcon";
import HelpIcon from "../../assets/icons/HelpIcon";
import logoUrl from "../../assets/DGTOOHL 360.svg";
import { useAuthStore } from "../../store/auth";

// Remove static sidebar import, use dynamic API mapping
import { mapMenu } from "../../services/Side";
import type { NavigationItem as ApiNavigationItem } from "../../services/Side";
import { apiClient } from "../../utils/apiClient";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  // Mobile specific
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}


// Use the NavigationItem type from Side.ts for consistency
type NavigationItem = ApiNavigationItem;


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobile = false, mobileOpen = false, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  // Fetch sidebar data from API and map it
  useEffect(() => {
    async function fetchSidebar() {
      try {
        const res = await apiClient.get<any>("/permissions/sidebar");
        if (res && res.data && Array.isArray(res.data)) {
          const mapped = mapMenu(res.data);
          // Use sidebar items as provided by the backend mapping
          setNavigationItems(mapped);
        } else {
          setNavigationItems([]);
        }
      } catch (e) {
        setNavigationItems([]);
      }
    }
    fetchSidebar();
  }, []);

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

  // Navigation items are now provided dynamically from `src/services/Sidebar.ts`.
  // The `navigationItems` identifier is imported from that module.

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

    let activeParents = navigationItems
      .filter((item) =>
        item.children &&
        item.children.some((child) => {
          if (!child.path) return false;
          return effectivePath === child.path || effectivePath.startsWith(child.path + "/");
        })
      )
      .map((item) => item.name.toLowerCase().replace(/\s+/g, "-"));

    // Always expand Miss Campaign on /miss-campaign/create
    if (location.pathname === "/miss-campaign/create") {
      const missCampaignSlug = navigationItems.find(item => item.name === "Miss Campaign")?.name.toLowerCase().replace(/\s+/g, "-");
      if (missCampaignSlug && !activeParents.includes(missCampaignSlug)) {
        activeParents.push(missCampaignSlug);
      }
    }
    setExpandedItems(activeParents);
  }, [location.pathname, navigationItems]);

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const slug = item.name.toLowerCase().replace(/\s+/g, "-");
    const isExpanded = expandedItems.includes(slug);
    const isItemActive = isParentActive(item);
    const IconComponent = item.icon;

    // Custom highlight for Miss Campaign, Live Campaign, Brief, and Brief Request
    const isMissCampaignRoute = location.pathname === "/miss-campaign/create";
    const isMissCampaign = item.name === "Miss Campaign";
    const isLiveCampaign = item.name === "Live Campaign";
    const isBriefCreateRoute = location.pathname === "/brief/create";
    const isBrief = item.name.trim() === "Brief" || item.name.trim() === "Brief ";
    const isBriefRequest = item.name === "Brief Request";
    // Highlight parent and child when on /miss-campaign/create or /brief/create
    const highlightClass =
      (isMissCampaignRoute && (isMissCampaign || isLiveCampaign)) ||
      (isBriefCreateRoute && (isBrief || isBriefRequest))
        ? "bg-orange-100"
        : isItemActive
        ? "bg-orange-100"
        : "hover:bg-orange-50";

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
            ${highlightClass}
            ${isCollapsed ? "px-2 justify-center" : ""}
          `}
          onClick={handleCardClick}
        >
          <div
            className={`flex items-center w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* Show icon_file image if present, else fallback to icon component */}
            {item.icon_file ? (
              <img
                src={item.icon_file}
                alt={item.name}
                className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] object-contain ${isCollapsed ? "" : "mr-2.5"}`}
                style={{ display: "inline-block" }}
              />
            ) : (
              IconComponent && (
                <IconComponent
                  className={`shrink-0 w-4 h-4 min-w-[1rem] min-h-[1rem] text-[var(--text-secondary)] ${isCollapsed ? "" : "mr-2.5"}`}
                />
              )
            )}
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
                {/* Show icon_file image if present, else fallback to icon component */}
                {child.icon_file ? (
                  <img
                    src={child.icon_file}
                    alt={child.name}
                    className="w-4 h-4 mr-2 object-contain"
                    style={{ display: "inline-block" }}
                  />
                ) : (
                  child.icon && React.createElement(child.icon, {
                    className: "w-4 h-4 mr-2 text-[var(--text-primary)]",
                  })
                )}
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
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src={logoUrl} alt="LMS logo" style={{width: 72, height: 'auto'}} />
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
      <div className="flex h-16 items-center px-4" style={{paddingLeft: '9px', paddingRight: '9px'}}>
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src={logoUrl} alt="LMS logo" style={{width: 80, height: 80}} />
            </div>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="rounded-lg flex items-center justify-start">
              <img src={logoUrl} alt="LMS logo" style={{width: 280, height: 'auto'}} />
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
