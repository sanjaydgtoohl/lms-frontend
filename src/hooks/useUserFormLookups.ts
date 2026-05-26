import { useCallback, useMemo } from 'react';
import {
  listManagersForSelect,
  listOrganisationsForSelect,
  listRolesForSelect,
  listZonesForSelect,
} from '../api/users';
import { useApiQuery } from './useApiQuery';

export function useUserFormLookups() {
  const fetchLookups = useCallback(async () => {
    const [roles, zones, organisations, managers] = await Promise.all([
      listRolesForSelect(),
      listZonesForSelect(),
      listOrganisationsForSelect(),
      listManagersForSelect(),
    ]);
    return { roles, zones, organisations, managers };
  }, []);

  const { data, loading, error } = useApiQuery(fetchLookups, []);

  return useMemo(
    () => ({
      roleOptions: data?.roles ?? [],
      zoneOptions: data?.zones ?? [],
      originationOptions: data?.organisations ?? [],
      managerOptions: data?.managers ?? [],
      loading,
      error,
      rolesLoading: loading,
      zoneLoading: loading,
      originationLoading: loading,
      managersLoading: loading,
      rolesError: error,
      managersError: error,
    }),
    [data, loading, error]
  );
}
