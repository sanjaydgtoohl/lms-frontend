// SidebarMenuHooks.ts
import { useCallback, useContext } from 'react';
import { SidebarMenuContext } from '../context/SidebarMenuContext';

export const useSidebarMenu = () => useContext(SidebarMenuContext);

export const usePermissions = () => {
  const { allPermittedSlugs } = useSidebarMenu();

  const hasPermission = useCallback(
    (slug: string) => allPermittedSlugs.includes(slug),
    [allPermittedSlugs],
  );

  return { hasPermission, allPermittedSlugs };
};