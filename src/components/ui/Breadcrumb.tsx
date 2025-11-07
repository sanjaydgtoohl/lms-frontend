import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  currentPageTitle?: string;
}

const segmentNameMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'master': 'Master Data',
  'agency': 'Agency Master',
  'brand': 'Brand Master',
  'department': 'Department Master',
  'designation': 'Designation Master',
  'industry': 'Industry Master',
  'source': 'Lead Source',
  'lead-source': 'Lead Source',
  'sources': 'Lead Sources',
  'profile': 'My Profile',
  'login': 'Login',
  'courses': 'Course Management',
  'brief': 'Brief',
  'lead-management': 'Lead Management',
  'miss-campaign': 'Miss Campaign',
  'create': 'Create',
  'edit': 'Edit',
  'view': 'View',
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  showHome = true,
  currentPageTitle 
}) => {
  const location = useLocation();
  const params = useParams();
  const { pathname } = location;

  // If items are provided, use them directly
  if (items && items.length > 0) {
    return (
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {showHome && (
            <>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                </Link>
              </li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              {item.path && !item.isActive ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`${item.isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  // Auto-generate breadcrumbs from pathname
  const parts = pathname.split('/').filter(Boolean);
  
  const getCrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [];

    // Handle master routes
    if (pathname.startsWith('/master/')) {
      const masterType = parts[1]; // agency, brand, etc.
      const masterLabel = segmentNameMap[masterType] || masterType.charAt(0).toUpperCase() + masterType.slice(1);
      
      crumbs.push({
        label: 'Master Data',
        path: '/master',
      });

      crumbs.push({
        label: masterLabel,
        path: `/master/${masterType}`,
      });

      // Handle create/edit/view with ID
      if (parts.length > 2) {
        if (parts[2] === 'create') {
          crumbs.push({
            label: 'Create',
            isActive: true,
          });
        } else if (parts[3] === 'edit') {
          const id = decodeURIComponent(parts[2]);
          crumbs.push({
            label: `ID: ${id}`,
            path: `/master/${masterType}/${id}`,
          });
          crumbs.push({
            label: 'Edit',
            isActive: true,
          });
        } else {
          // View mode
          const id = decodeURIComponent(parts[2]);
          crumbs.push({
            label: `ID: ${id}`,
            isActive: true,
          });
        }
      }
      return crumbs;
    }

    // Handle lead-management routes
    if (pathname.startsWith('/lead-management')) {
      crumbs.push({
        label: 'Lead Management',
        path: '/lead-management',
      });

      if (pathname.includes('/create')) {
        crumbs.push({
          label: 'Create',
          isActive: true,
        });
      } else if (pathname.includes('/edit/')) {
        const id = pathname.split('/edit/')[1];
        crumbs.push({
          label: `ID: ${id}`,
          path: `/lead-management/all-leads`,
        });
        crumbs.push({
          label: 'Edit',
          isActive: true,
        });
      } else {
        crumbs.push({
          label: 'All Leads',
          isActive: true,
        });
      }
      return crumbs;
    }

    // Handle brief routes
    if (pathname.startsWith('/brief')) {
      crumbs.push({
        label: 'Brief',
        path: '/brief',
      });

      if (pathname.includes('/create')) {
        crumbs.push({
          label: 'Create',
          isActive: true,
        });
      } else if (pathname.includes('/edit')) {
        const id = parts[1];
        crumbs.push({
          label: `ID: ${id}`,
          path: `/brief/${id}`,
        });
        crumbs.push({
          label: 'Edit',
          isActive: true,
        });
      } else if (parts.length > 1 && parts[1] !== 'create') {
        const id = parts[1];
        crumbs.push({
          label: `ID: ${id}`,
          isActive: true,
        });
      }
      return crumbs;
    }

    // Handle miss-campaign routes
    if (pathname.startsWith('/miss-campaign')) {
      crumbs.push({
        label: 'Miss Campaign',
        path: '/miss-campaign/view',
      });

      if (pathname.includes('/create')) {
        crumbs.push({
          label: 'Create',
          isActive: true,
        });
      } else if (pathname.includes('/edit')) {
        const id = parts[2];
        crumbs.push({
          label: `ID: ${id}`,
          path: `/miss-campaign/view/${id}`,
        });
        crumbs.push({
          label: 'Edit',
          isActive: true,
        });
      } else if (parts.length > 2) {
        const id = parts[2];
        crumbs.push({
          label: `ID: ${id}`,
          isActive: true,
        });
      }
      return crumbs;
    }

    // Default behavior for other paths
    const defaultCrumbs: BreadcrumbItem[] = [];
    parts.forEach((part, idx) => {
      const to = '/' + parts.slice(0, idx + 1).join('/');
      const name = segmentNameMap[part.toLowerCase()] || 
                   part.replace(/[-_]/g, ' ')
                       .replace(/\b\w/g, c => c.toUpperCase());
      
      defaultCrumbs.push({
        label: name,
        path: idx < parts.length - 1 ? to : undefined,
        isActive: idx === parts.length - 1,
      });
    });

    return defaultCrumbs;
  };

  const crumbs = getCrumbs();

  // If currentPageTitle is provided, replace the last crumb
  if (currentPageTitle && crumbs.length > 0) {
    crumbs[crumbs.length - 1] = {
      ...crumbs[crumbs.length - 1],
      label: currentPageTitle,
      isActive: true,
    };
  }

  // If no crumbs, show dashboard
  if (crumbs.length === 0) {
    return (
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/dashboard" className="text-gray-900 font-semibold">
              Dashboard
            </Link>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 flex-wrap">
        {showHome && (
          <>
            <li>
              <Link 
                to="/dashboard" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Home"
              >
                <Home className="w-4 h-4" />
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </>
        )}
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            {crumb.path && !crumb.isActive ? (
              <Link
                to={crumb.path}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`${crumb.isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
