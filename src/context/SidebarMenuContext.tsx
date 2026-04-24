/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NavigationItem } from '../services/Side';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { clearPermissions, fetchSidebarPermissions } from '../redux/slices/permissionsSlice';

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
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { sidebarMenu, allPermittedPaths, allPermittedSlugs, loading, permissionsLoaded } =
    useSelector((state: RootState) => state.permissions);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearPermissions());
      return;
    }

    const promise = dispatch(fetchSidebarPermissions());
    return () => {
      promise.abort();
    };
  }, [dispatch, isAuthenticated]);

  return (
    <SidebarMenuContext.Provider
      value={{ sidebarMenu, allPermittedPaths, allPermittedSlugs, loading, permissionsLoaded }}
    >
      {children}
    </SidebarMenuContext.Provider>
  );
};
