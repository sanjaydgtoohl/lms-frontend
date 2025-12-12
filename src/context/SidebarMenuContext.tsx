import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mapMenu, extractAllPaths } from '../services/Side';
import type { NavigationItem, ApiSidebarItem } from '../services/Side';
import { apiClient } from '../utils/apiClient';

interface SidebarMenuContextType {
  sidebarMenu: NavigationItem[]; // 1 level for UI
  allPermittedPaths: string[];   // all levels for permission checks
  loading: boolean;
}

const SidebarMenuContext = createContext<SidebarMenuContextType>({ sidebarMenu: [], allPermittedPaths: [], loading: true });

export const useSidebarMenu = () => useContext(SidebarMenuContext);

export const SidebarMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarMenu, setSidebarMenu] = useState<NavigationItem[]>([]);
  const [allPermittedPaths, setAllPermittedPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSidebar() {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/permissions/sidebar');
        if (res && res.data && Array.isArray(res.data)) {
          setSidebarMenu(mapMenu(res.data)); // 1 level for UI
          setAllPermittedPaths(extractAllPaths(res.data as ApiSidebarItem[])); // all levels for permission checks
        } else {
          setSidebarMenu([]);
          setAllPermittedPaths([]);
        }
      } catch {
        setSidebarMenu([]);
        setAllPermittedPaths([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSidebar();
  }, []);

  return (
    <SidebarMenuContext.Provider value={{ sidebarMenu, allPermittedPaths, loading }}>
      {children}
    </SidebarMenuContext.Provider>
  );
};
