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
          const paths = extractAllPaths(res.data as ApiSidebarItem[]); // all levels for permission checks
          setAllPermittedPaths(paths);
          console.log('✅ Permitted paths loaded:', paths);
        } else {
          setSidebarMenu([]);
          setAllPermittedPaths([]);
          console.warn('⚠️ No sidebar data received from API');
        }
      } catch (err) {
        setSidebarMenu([]);
        setAllPermittedPaths([]);
        console.error('❌ Failed to fetch permissions:', err);
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
