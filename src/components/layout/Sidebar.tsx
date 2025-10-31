import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  UserCheck
} from 'lucide-react';

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

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['master-data']);

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Master Data',
      icon: Database,
      children: [
        { name: 'Brand Master', path: '/master/brand', icon: Building2 },
        { name: 'Agency Master', path: '/master/agency', icon: Briefcase },
        { name: 'Department Master', path: '/master/department', icon: GraduationCap },
        { name: 'Designation Master', path: '/master/designation', icon: UserCheck },
        { name: 'Industry Master', path: '/master/industry', icon: Factory },
        {name: 'Lead Source', path: '/lead-source', icon: Target },
      ],
    },
    
    {
      name: 'Lead Management',
      path: '/lead-management',
      icon: Users,
    },
    {
      name: 'Brief',
      path: '/brief',
      icon: FileText,
    },
    {
      name: 'Miss Campaign',
      path: '/miss-campaign',
      icon: Megaphone,
    },
    {
      name: 'Campaign Management',
      path: '/campaign-management',
      icon: Speaker,
    },
    {
      name: 'Finance',
      path: '/finance',
      icon: DollarSign,
    },
    {
      name: 'User Management',
      path: '/user-management',
      icon: UserCog,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (item: NavigationItem) => {
    if (item.path) return isActive(item.path);
    if (item.children) {
      return item.children.some(child => child.path && isActive(child.path));
    }
    return false;
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name.toLowerCase().replace(/\s+/g, '-'));
    const isItemActive = isParentActive(item);
    const IconComponent = item.icon;

    return (
      <div key={item.name}>
        <div
          className={`
            flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer
            ${level > 0 ? 'ml-6' : ''}
            ${isItemActive 
              ? 'bg-[var(--active-bg)] text-[var(--active-text)]' 
              : 'text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
            }
            ${isCollapsed ? 'px-2 justify-center' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name.toLowerCase().replace(/\s+/g, '-'));
            }
          }}
        >
          {item.path ? (
            <Link 
              to={item.path} 
              className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''}`}
            >
              <IconComponent className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ) : (
            <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : ''}`}>
              <IconComponent className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </div>
          )}
          
          {hasChildren && !isCollapsed && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-gradient-to-b from-[var(--sidebar-gradient-start)] to-[var(--sidebar-gradient-end)]
      border-r border-[var(--border-color)] transition-all duration-300 ease-in-out z-30
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-[var(--border-color)]">
        {isCollapsed ? (
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">LMS</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[var(--border-color)] p-4 space-y-2">
        {/* Help */}
        <div className={`
          flex items-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)] 
          hover:bg-[var(--hover-bg)] transition-all duration-200 cursor-pointer rounded-lg
          ${isCollapsed ? 'px-2 justify-center' : ''}
        `}>
          <HelpCircle className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Help</span>}
        </div>

        {/* Logout */}
        <div className={`
          flex items-center px-4 py-3 text-sm font-medium text-red-600 
          hover:bg-red-50 transition-all duration-200 cursor-pointer rounded-lg
          ${isCollapsed ? 'px-2 justify-center' : ''}
        `}>
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
