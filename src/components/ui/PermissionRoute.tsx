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
  if (path === 'login') return <>{children}</>;
  if (loading) return null; // or a loader
  // Helper to match dynamic segments
  function normalizePath(p: string) {
    // Always start with a single slash, remove trailing slash (except root)
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  function matchPath(permittedPath: string, currentPath: string) {
    const normPermitted = normalizePath(permittedPath);
    const normCurrent = normalizePath(currentPath);
    // Convert /brief/:id/edit to regex, support multiple dynamic segments
    const regexStr = '^' + normPermitted.replace(/:[^/]+/g, '[^/]+') + '$';
    const regex = new RegExp(regexStr);
    return regex.test(normCurrent);
  }

  const hasPermission = allPermittedPaths.some(permittedPath => matchPath(permittedPath, path));
  if (hasPermission) {
    return <>{children}</>;
  }
  return <PermissionDenied />;
};

export default PermissionRoute;
