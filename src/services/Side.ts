/**
 * Recursively extract all permitted paths from the raw sidebar API response.
 * Use this for permission checks, not for sidebar UI.
 */
export function extractAllPaths(apiItems: ApiSidebarItem[]): string[] {
  const paths: string[] = [];
  
  function recurse(items: ApiSidebarItem[]) {
    for (const item of items) {
      if (item.url && item.url !== 'javascript:void(0)' && item.url.trim() !== '') {
        let path = item.url.startsWith('/') ? item.url : `/${item.url}`;
        // Replace both {id} and other patterns like {accountId}, {userId}, etc.
        path = path.replace(/\{[^}]+\}/g, ':id');
        // Remove trailing slashes (except root)
        if (path.length > 1 && path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        paths.push(path);
      }
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }
  recurse(apiItems);
  
  // Remove duplicates
  return [...new Set(paths)];
}

/**
 * Recursively extract all permission slugs from the raw sidebar API response.
 * Use this for permission checks.
 */
export function extractAllSlugs(apiItems: ApiSidebarItem[]): string[] {
  const slugs: string[] = [];
  
  function recurse(items: ApiSidebarItem[]) {
    for (const item of items) {
      if (item.name && item.name.trim() !== '') {
        slugs.push(item.name);
      }
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    }
  }
  recurse(apiItems);
  
  // Remove duplicates
  return [...new Set(slugs)];
}
/**
 * Checks if a given path is permitted based on sidebar menu structure.
 * Returns true if found, false otherwise.
 * Usage: isSidebarPathPermitted(path, sidebarMenu)
 */
export function isSidebarPathPermitted(path: string, sidebarMenu: NavigationItem[]): boolean {
  // Recursively check all levels of children
  function check(items: NavigationItem[]): boolean {
    for (const item of items) {
      if (item.path === path) return true;
      if (item.children && check(item.children)) return true;
    }
    return false;
  }
  return check(sidebarMenu);
}
// Utility to extract allowed sidebar paths for permission checking
export function getAllowedPaths(menu: NavigationItem[]): string[] {
  const paths: string[] = [];
  menu.forEach(item => {
    if (item.path) paths.push(item.path);
    if (item.children) {
      item.children.forEach(child => {
        if (child.path) paths.push(child.path);
      });
    }
  });
  return paths;
}
// src/services/Side.ts
// Utility to map API sidebar response to the app's sidebar structure

export interface ApiSidebarItem {
  display_name?: string;
  name?: string;
  url?: string;
  children?: ApiSidebarItem[];
  icon_file?: string;
  // ...other API fields
}

export interface NavigationItem {
  name: string;
  path?: string;
  icon: any;
  icon_file?: string;
  children?: NavigationItem[];
}

/**
 * Fixes the API url to match the app's path conventions.
 * - Ensures leading slash
 * - Replaces {id} with :id for React Router
 * - Ignores 'javascript:void(0)'
 */
export function fixPath(url?: string): string | undefined {
  if (!url || url === 'javascript:void(0)') return undefined;
  let path = url.startsWith('/') ? url : `/${url}`;
  path = path.replace(/\{id\}/g, ':id');
  return path;
}

/**
 * Recursively maps API sidebar items to NavigationItem[] for the sidebar.
 * Icons are set to null by default (can be mapped later if needed).
 */

// Only map one level of children (no grandchildren) for sidebar UI
export function mapMenu(apiItems: ApiSidebarItem[]): NavigationItem[] {
  // Filter out Profile item (name === '$P' or url === 'profile')
  const filteredItems = apiItems.filter(
    (item) =>
      !(item.name === '$P' || item.url === 'profile')
  );
  return filteredItems.map((item) => ({
    name: item.display_name || item.name || '',
    path: fixPath(item.url),
    icon: null, // Set icons as needed
    icon_file: item.icon_file || undefined,
    children:
      item.children && item.children.length > 0
        ? item.children
            .filter((child) => child.name !== 'brief.assign' && child.name !== 'brief-status.update') // Filter out Assign Brief and Brief Status Update
            .map((child) => ({
              name: child.display_name || child.name || '',
              path: fixPath(child.url),
              icon: null,
              icon_file: child.icon_file || undefined,
              // Do NOT map grandchildren
            }))
        : undefined,
  }));
}

// Example usage:
// import { mapMenu } from './Side';
// const sidebarData = mapMenu(apiResponse.data);
