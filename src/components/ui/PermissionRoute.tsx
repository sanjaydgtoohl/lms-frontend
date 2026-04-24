import { useSidebarMenu } from '../../hooks/SidebarMenuHooks';
import React from 'react';
import { PermissionDenied } from './index';
import { Navigate, useLocation } from 'react-router-dom';

interface PermissionRouteProps {
  children: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ children }) => {
  const { allPermittedPaths, loading, permissionsLoaded } = useSidebarMenu();
  const location = useLocation();
  const path = location.pathname;

  // Always allow login route
  if (path === 'login' || path === '/login') return <>{children}</>;
  if (loading || !permissionsLoaded) return null; // Wait until permissions hydrate
  
  // Helper to normalize paths
  function normalizePath(p: string): string {
    // Always start with a single slash, remove trailing slash (except root)
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  // Match current path against permitted paths with dynamic segment support
  function matchPath(permittedPath: string, currentPath: string): boolean {
    const normPermitted = normalizePath(permittedPath);
    const normCurrent = normalizePath(currentPath);
    
    // Exact match first
    if (normPermitted === normCurrent) return true;
    
    // Split paths into segments for smarter matching
    const permittedSegments = normPermitted.split('/').filter(Boolean);
    const currentSegments = normCurrent.split('/').filter(Boolean);
    
    // Only match if same number of segments
    if (permittedSegments.length !== currentSegments.length) {
      return false;
    }
    
    // Known route keywords that should NOT match dynamic segments
    const routeKeywords = new Set([
      'create', 'edit', 'view', 'delete', 'remove', 'update',
      'new', 'all', 'all-leads', 'list', 'pending', 'interested',
      'meeting-scheduled', 'meeting-done', 'brief-status',
      'Brief_Pipeline', 'view'
    ]);
    
    // Check each segment
    for (let i = 0; i < permittedSegments.length; i++) {
      const permSegment = permittedSegments[i];
      const currSegment = currentSegments[i];
      
      if (permSegment.startsWith(':')) {
        // Dynamic segment - match anything EXCEPT known route keywords
        if (routeKeywords.has(currSegment.toLowerCase())) {
          return false;
        }
        // It's an ID (numeric, alphanumeric, slug, UUID, etc.)
      } else if (permSegment !== currSegment) {
        // Static segment must match exactly
        return false;
      }
    }
    
    return true;
  }

  const hasPermission = allPermittedPaths.some(permittedPath => matchPath(permittedPath, path));

  if (!hasPermission && allPermittedPaths.length !== 0) {
    // Redirect to first static permitted path instead of flashing Access Denied.
    const safePath = allPermittedPaths.find(p => !p.includes(':'));
    return <Navigate to={safePath || '/'} replace />;
  }
  
  if (hasPermission) {
    return <>{children}</>;
  }
  return <PermissionDenied />;
};

export default PermissionRoute;
