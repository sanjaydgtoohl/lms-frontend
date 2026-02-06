export function hasPermission(userPermissions: string[], permissionName: string): boolean {
  return userPermissions.includes(permissionName);
}
