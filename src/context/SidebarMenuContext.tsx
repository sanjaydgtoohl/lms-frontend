/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mapMenu, extractAllPaths, extractAllSlugs } from '../services/Side';
import type { NavigationItem, ApiSidebarItem } from '../services/Side';
import { apiClient } from '../utils/apiClient';
import { useAuthStore } from '../store/auth';

interface SidebarMenuContextType {
  sidebarMenu: NavigationItem[];
  allPermittedPaths: string[];
  allPermittedSlugs: string[];
  loading: boolean;
  permissionsLoaded: boolean;
}

export const SidebarMenuContext = createContext<SidebarMenuContextType>({
  sidebarMenu: [],
  allPermittedPaths: [],
  allPermittedSlugs: [],
  loading: true,
  permissionsLoaded: false,
});

export const SidebarMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarMenu, setSidebarMenu] = useState<NavigationItem[]>([]);
  const [allPermittedPaths, setAllPermittedPaths] = useState<string[]>([]);
  const [allPermittedSlugs, setAllPermittedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function fetchSidebar() {
      if (!isAuthenticated) {
        setSidebarMenu([]);
        setAllPermittedPaths([]);
        setAllPermittedSlugs([]);
        setLoading(false);
        setPermissionsLoaded(false);
        return;
      }

      setLoading(true);
      setPermissionsLoaded(false);
      try {
        const res = await apiClient.get<any>('/permissions/sidebar');
        if (res && res.data && Array.isArray(res.data)) {
          setSidebarMenu(mapMenu(res.data));
          setAllPermittedPaths(extractAllPaths(res.data as ApiSidebarItem[]));
          setAllPermittedSlugs(extractAllSlugs(res.data as ApiSidebarItem[]));
        } else {
          setSidebarMenu([]);
          setAllPermittedPaths([]);
          setAllPermittedSlugs([]);
        }
      } catch {
        setSidebarMenu([]);
        setAllPermittedPaths([]);
        setAllPermittedSlugs([]);
      } finally {
        setLoading(false);
        setPermissionsLoaded(true);
      }
    }
    fetchSidebar();
  }, [isAuthenticated]);

  return (
    <SidebarMenuContext.Provider
      value={{ sidebarMenu, allPermittedPaths, allPermittedSlugs, loading, permissionsLoaded }}
    >
      {children}
    </SidebarMenuContext.Provider>
  );
};
