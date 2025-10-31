import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const segmentNameMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'masters': 'Masters',
  'agency': 'Agency',
  'brand': 'Brand',
  'department': 'Department',
  'designation': 'Designation',
  'industry': 'Industry',
  'sources': 'Sources',
  'profile': 'Profile',
  'login': 'Login',
  'courses': 'Courses'
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;

  const parts = pathname.split('/').filter(Boolean);

  const crumbs = parts.map((part, idx) => {
    const to = '/' + parts.slice(0, idx + 1).join('/');
    const name = segmentNameMap[part.toLowerCase()] || part.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { name, to };
  });

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
