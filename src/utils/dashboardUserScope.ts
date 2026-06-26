import type { AuthUser } from '../redux/slices/authSlice';

export function getUserOrganisationIds(user: AuthUser | null | undefined): string[] {
  if (!user) return [];

  if (Array.isArray(user.organisation_ids) && user.organisation_ids.length > 0) {
    return user.organisation_ids.map((id) => String(id)).filter(Boolean);
  }

  if (Array.isArray(user.organisations) && user.organisations.length > 0) {
    return user.organisations
      .map((org) => String(org.id ?? ''))
      .filter(Boolean);
  }

  if (user.organisation_id != null && user.organisation_id !== '') {
    return [String(user.organisation_id)];
  }

  return [];
}

export function getProcessOrganisationId(user: AuthUser | null | undefined): string | null {
  if (!user) return null;

  if (user.organisation_id != null && user.organisation_id !== '') {
    return String(user.organisation_id);
  }

  const orgIds = getUserOrganisationIds(user);
  return orgIds[0] ?? null;
}

export function getDefaultDashboardOrganisationIds(user: AuthUser | null | undefined): string[] {
  const orgIds = getUserOrganisationIds(user);
  if (orgIds.length === 0) return [];

  if (orgIds.length === 1) {
    return orgIds;
  }

  const processOrgId = getProcessOrganisationId(user);
  return processOrgId ? [processOrgId] : [orgIds[0]];
}

export function isSuperAdminUser(user: AuthUser | null | undefined): boolean {
  return Boolean(user?.roles?.some((role) => role.name === 'Super Admin'));
}
