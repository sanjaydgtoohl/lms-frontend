// SidebarMenuHooks.ts
import { useContext } from 'react';
import { SidebarMenuContext } from '../context/SidebarMenuContext';

export const useSidebarMenu = () => useContext(SidebarMenuContext);

export const usePermissions = () => {
  const { allPermittedSlugs } = useSidebarMenu();
  return {
    hasPermission: (slug: string) => allPermittedSlugs.includes(slug),
  };
};