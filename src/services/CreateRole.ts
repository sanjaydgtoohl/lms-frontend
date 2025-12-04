import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';
import type { Permission } from '../data/rolePermissionsData';

const ENDPOINTS = {
  PERMISSIONS: '/permissions',
  PERMISSION_TREE: '/permissions/all-permission-tree',
  ROLES: '/roles',
} as const;

export type ModulePermissions = {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
};

// keep the latest permission id index fetched from the server so we can map UI booleans -> ids
let latestPermissionIdIndex: Record<string, Record<string, Record<string, number>>> | undefined = undefined;

/**
 * Fetch permissions from the new Permission Tree API and transform into ModulePermissions shape expected by the UI.
 * The API returns a hierarchical tree structure:
 * Level 1: Module (e.g., "Master Data")
 * Level 2: Submodule (e.g., "Brand Master")
 * Level 3: Permissions (e.g., "brand.create", "brand.edit", "brand.view", "brand.delete")
 */
export async function fetchPermissionsAsModulePermissions(): Promise<ModulePermissions> {
  try {
    const res = await apiClient.get<any>(ENDPOINTS.PERMISSION_TREE);
    const treeData = res.data || res;
    const items = Array.isArray(treeData) ? treeData : treeData?.data || [];

    const out: ModulePermissions = {};
    // index to map module/submodule/action -> permission id from API
    const permissionIdIndex: Record<string, Record<string, Record<string, number>>> = {};

    // Helper function to extract action type from permission name
    const extractActionType = (permName: string): keyof Permission => {
      const nameLower = String(permName).toLowerCase();
      
      if (nameLower.includes('create') || nameLower.includes('add')) return 'create';
      if (nameLower.includes('update') || nameLower.includes('edit')) return 'update';
      if (nameLower.includes('delete') || nameLower.includes('remove')) return 'delete';
      if (nameLower.includes('view') || nameLower.includes('read')) return 'read';
      
      return 'read'; // default
    };

    // Process the 3-level hierarchy:
    // Level 1 (modules): items in the root array
    // Level 2 (submodules): children of level 1
    // Level 3 (permissions): children of level 2
    if (Array.isArray(items)) {
      items.forEach((moduleNode: any) => {
        const moduleDisplay = moduleNode.display_name || moduleNode.name || '';
        // Include id in module label so UI shows "id - display_name" format
        const moduleName = moduleNode.id ? `${moduleNode.id} - ${moduleDisplay}` : moduleDisplay;
        if (!moduleName || !Array.isArray(moduleNode.children)) return;

        // Iterate through submodules (Level 2)
        moduleNode.children.forEach((submoduleNode: any) => {
          const submoduleDisplay = submoduleNode.display_name || submoduleNode.name || '';
          // Include id in submodule label so UI shows "id - display_name" format
          const submoduleName = submoduleNode.id ? `${submoduleNode.id} - ${submoduleDisplay}` : submoduleDisplay;
          if (!submoduleName) return;

          // Initialize module structure
          if (!out[moduleName]) out[moduleName] = {};
          if (!out[moduleName][submoduleName]) {
            out[moduleName][submoduleName] = {
              read: false,
              create: false,
              update: false,
              delete: false,
            } as Permission;
          }

          // Ensure index structure exists
          permissionIdIndex[moduleName] = permissionIdIndex[moduleName] || {};
          permissionIdIndex[moduleName][submoduleName] = permissionIdIndex[moduleName][submoduleName] || {};

          // Process permissions (Level 3) - children of submodule
          // We only store the permission IDs in the index here. Do NOT mark
          // the permission flags as `true` by default, otherwise the UI will
          // show all checkboxes selected when creating a new role. Flags
          // should remain `false` so new roles start with no permissions.
          if (Array.isArray(submoduleNode.children)) {
            submoduleNode.children.forEach((permissionNode: any) => {
              const permId = Number(permissionNode.id || 0);
              const actionType = extractActionType(permissionNode.name || '');

              // Keep the flag default (false). Only record the id for mapping
              // later when a user checks a permission.
              permissionIdIndex[moduleName][submoduleName][actionType] = permId;
            });
          }
        });
      });
    }

    // persist latest index for fallback mapping in createRole
    latestPermissionIdIndex = permissionIdIndex;

    // store the index on the returned object so callers can map booleans back to ids if needed
    // we attach a non-enumerable property to avoid interfering with consumers that expect ModulePermissions only
    try {
      Object.defineProperty(out, '__permissionIdIndex', {
        value: permissionIdIndex,
        enumerable: false,
        configurable: true,
        writable: false,
      });
    } catch (e) {
      // ignore if defineProperty is not allowed
    }

    return out;
  } catch (err: any) {
    try {
      handleApiError(err);
    } catch {}
    // Fallback: clear latest index and return empty object so UI uses static defaults
    latestPermissionIdIndex = undefined;
    return {};
  }
}

/**
 * Convert ModulePermissions (boolean flags) into an array of permission ids using the index
 * that was attached by `fetchPermissionsAsModulePermissions`.
 */
export function mapModulePermissionsToIds(modulePermissions: ModulePermissions): number[] {
  const ids: number[] = [];
  // Prefer index attached to the modulePermissions object, otherwise fall back to last fetched index
  const index = (modulePermissions as any).__permissionIdIndex as Record<string, Record<string, Record<string, number>>> | undefined
    || latestPermissionIdIndex;

  if (!index) return ids;

  Object.keys(modulePermissions).forEach((moduleName) => {
    const submodules = modulePermissions[moduleName];
    Object.keys(submodules).forEach((submoduleName) => {
      const perms = submodules[submoduleName] as Permission & Record<string, any>;
      const idxForModule = index[moduleName] && index[moduleName][submoduleName];
      if (!idxForModule) return;
      Object.keys(perms).forEach((action) => {
        if (perms[action] && idxForModule[action]) {
          const id = Number(idxForModule[action]);
          if (id && !ids.includes(id)) ids.push(id);
        }
      });
    });
  });

  return ids;
}

export async function createRole(payload: Record<string, any>) {
  try {
    const body = { ...payload };

    // If permissions were provided as ModulePermissions (object), attempt to map to ids
    if (body.permissions && !Array.isArray(body.permissions) && typeof body.permissions === 'object') {
      try {
        const ids = mapModulePermissionsToIds(body.permissions as ModulePermissions);
        body.permissions = ids;
      } catch (e) {
        // fallback: if mapping fails, leave as-is and let API respond with an error
        console.warn('Failed to map modulePermissions to ids', e);
      }
    }

    const res = await apiClient.post<any>(ENDPOINTS.ROLES, body);
    return res.data;
  } catch (err: any) {
    try { handleApiError(err); } catch {}
    throw err;
  }
}

export default {
  fetchPermissionsAsModulePermissions,
  createRole,
};
