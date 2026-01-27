import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mapMenu, extractAllPaths, extractAllSlugs } from '../services/Side';
import type { NavigationItem, ApiSidebarItem } from '../services/Side';
import { apiClient } from '../utils/apiClient';
import { useAuthStore } from '../store/auth';

interface SidebarMenuContextType {
  sidebarMenu: NavigationItem[]; // 1 level for UI
  allPermittedPaths: string[];   // all levels for permission checks
  allPermittedSlugs: string[];   // all permission slugs for permission checks
  loading: boolean;
}

const SidebarMenuContext = createContext<SidebarMenuContextType>({ sidebarMenu: [], allPermittedPaths: [], allPermittedSlugs: [], loading: true });

export const useSidebarMenu = () => useContext(SidebarMenuContext);

export const usePermissions = () => {
  const { allPermittedSlugs } = useSidebarMenu();
  return {
    hasPermission: (slug: string) => allPermittedSlugs.includes(slug),
  };
};

export const SidebarMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarMenu, setSidebarMenu] = useState<NavigationItem[]>([]);
  const [allPermittedPaths, setAllPermittedPaths] = useState<string[]>([]);
  const [allPermittedSlugs, setAllPermittedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function fetchSidebar() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await apiClient.get<any>('/permissions/sidebar');
        if (res && res.data && Array.isArray(res.data)) {
          setSidebarMenu(mapMenu(res.data)); // 1 level for UI
          const paths = extractAllPaths(res.data as ApiSidebarItem[]); // all levels for permission checks
          setAllPermittedPaths(paths);
          const slugs = extractAllSlugs(res.data as ApiSidebarItem[]); // all permission slugs
          setAllPermittedSlugs(slugs);
          
          console.log('✅ Permitted paths loaded:', paths);
          console.log('✅ Permitted slugs loaded:', slugs);
        } else {
          setSidebarMenu([]);
          setAllPermittedPaths([]);
          setAllPermittedSlugs([]);
          console.warn('⚠️ No sidebar data received from API');
        }
      } catch (err) {
        setSidebarMenu([]);
        setAllPermittedPaths([]);
        setAllPermittedSlugs([]);
        console.error('❌ Failed to fetch permissions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSidebar();
  }, [isAuthenticated]);

  return (
    <SidebarMenuContext.Provider value={{ sidebarMenu, allPermittedPaths, allPermittedSlugs, loading }}>
      {children}
    </SidebarMenuContext.Provider>
  );
};
