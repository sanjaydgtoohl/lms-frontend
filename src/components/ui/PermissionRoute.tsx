import React from 'react';
import { PermissionDenied } from './index';
import { useLocation } from 'react-router-dom';
import { useSidebarMenu } from '../../context/SidebarMenuContext';

interface PermissionRouteProps {
  children: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ children }) => {
  const { allPermittedPaths, loading } = useSidebarMenu();
  const location = useLocation();
  const path = location.pathname;

  // Always allow login route
  if (path === 'login' || path === '/login') return <>{children}</>;
  if (loading) return null; // or a loader
  
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
          console.log(`⚠️  Segment "${currSegment}" is a route keyword, not an ID`);
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
  console.log('🔍 Checking permissions for path:', path, '=>', hasPermission ? 'Allowed' : 'Denied');
  // Log permission check for debugging
  if (!hasPermission) {
    console.warn('❌ Access Denied:', {
      currentPath: path,
      permittedPaths: allPermittedPaths,
      reason: 'No matching permission found'
    });

    if (allPermittedPaths.length != 0) {
       // Redirect to first permitted path if none match
      window.location.href = allPermittedPaths[0];
    }

  } else {
    const matchedPath = allPermittedPaths.find(p => matchPath(p, path));
    console.log('✅ Access Granted:', path, `(matched: ${matchedPath})`);
  }
  
  if (hasPermission) {
    return <>{children}</>;
  }
  return <PermissionDenied />;
};

export default PermissionRoute;
