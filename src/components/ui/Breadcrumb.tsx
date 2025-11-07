import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const segmentNameMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'masters': 'Master Data',
  'agency': 'Agency Master',
  'brand': 'Brand Master',
  'department': 'Department Master',
  'designation': 'Designation Master',
  'industry': 'Industry Master',
  'sources': 'Lead Sources',
  'profile': 'My Profile',
  'login': 'Login',
  'courses': 'Course Management',
  'brief': 'Brief'
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;

  const parts = pathname.split('/').filter(Boolean);

   // Custom mapping for lead management paths
   const getCrumbs = () => {
     if (pathname.startsWith('/lead-management')) {
       const baseCrumbs = [{ name: 'Lead Management', to: '/lead-management' }];
       
       if (pathname === '/lead-management/create') {
         baseCrumbs.push(
           { name: 'All Leads', to: '/lead-management/all-leads' },
           { name: 'Create', to: '/lead-management/create' }
         );
       } else if (pathname.startsWith('/lead-management/edit/')) {
         baseCrumbs.push(
           { name: 'All Leads', to: '/lead-management/all-leads' },
           { name: 'Edit', to: pathname }
         );
       } else {
         baseCrumbs.push({ name: 'All Leads', to: '/lead-management/all-leads' });
       }
       return baseCrumbs;
     }

     // Custom mapping for brief routes
     if (pathname.startsWith('/brief')) {
       const baseCrumbs = [{ name: 'Brief', to: '/brief' }];
       
       // Add Brief Pipeline for the main /brief route (default child)
       if (pathname === '/brief') {
         baseCrumbs.push({ name: 'Brief Pipeline', to: '/brief' });
       } else if (pathname === '/brief/create') {
         baseCrumbs.push(
           { name: 'Brief Pipeline', to: '/brief' },
           { name: 'Create', to: '/brief/create' }
         );
       } else if (pathname.includes('/edit')) {
         baseCrumbs.push(
           { name: 'Brief Pipeline', to: '/brief' },
           { name: 'Edit', to: pathname }
         );
       } else if (pathname.includes('/view')) {
         baseCrumbs.push(
           { name: 'Brief Pipeline', to: '/brief' },
           { name: 'View', to: pathname }
         );
       }
       return baseCrumbs;
     }    // Default behavior for other paths
    return parts.map((part, idx) => {
      const to = '/' + parts.slice(0, idx + 1).join('/');
      const name = segmentNameMap[part.toLowerCase()] || part.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return { name, to };
    });
  };

  const crumbs = getCrumbs();

  // If no path (root), show Dashboard
  if (crumbs.length === 0) {
    return (
      <nav className="text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li className="text-sm text-[var(--text-primary)]">Dashboard</li>
        </ol>
      </nav>
    );
  }

  return (
    <nav className="text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {crumbs.map((c, i) => (
          <li key={c.to} className="flex items-center space-x-2">
            {i !== 0 && (
              <svg className="w-3 h-3 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}

            {i < crumbs.length - 1 ? (
              <Link to={c.to} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {c.name}
              </Link>
            ) : (
              <span className="text-sm text-[var(--text-primary)] font-semibold">{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
