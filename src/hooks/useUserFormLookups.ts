import { useCallback, useMemo } from 'react';
import {
  listDepartmentsForSelect,
  listManagersForSelect,
  listOrganisationsForSelect,
  listRolesForSelect,
  listZonesForSelect,
} from '../api/users';
import { useApiQuery } from './useApiQuery';

export function useUserFormLookups() {
  const fetchLookups = useCallback(async () => {
    const [roles, zones, organisations, managers, departments] = await Promise.all([
      listRolesForSelect(),
      listZonesForSelect(),
      listOrganisationsForSelect(),
      listManagersForSelect(),
      listDepartmentsForSelect(),
    ]);
    return { roles, zones, organisations, managers, departments };
  }, []);

  const { data, loading, error } = useApiQuery(fetchLookups, []);

  return useMemo(
    () => ({
      roleOptions: data?.roles ?? [],
      zoneOptions: data?.zones ?? [],
      originationOptions: data?.organisations ?? [],
      managerOptions: data?.managers ?? [],
      departmentOptions: data?.departments ?? [],
      loading,
      error,
      rolesLoading: loading,
      zoneLoading: loading,
      originationLoading: loading,
      managersLoading: loading,
      departmentsLoading: loading,
      rolesError: error,
      managersError: error,
      departmentsError: error,
    }),
    [data, loading, error]
  );
}
