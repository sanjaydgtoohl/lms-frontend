import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';
import type { Permission } from '../data/rolePermissionsData';
import rolePermissionsData from '../data/rolePermissionsData';

const ENDPOINTS = {
  PERMISSIONS: '/permissions',
  ROLES: '/roles',
} as const;

export type ModulePermissions = {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
};

// keep the latest permission id index fetched from the server so we can map UI booleans -> ids
let latestPermissionIdIndex: Record<string, Record<string, Record<string, number>>> | undefined = undefined;

function toTitle(s: string) {
  return String(s)
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

/**
 * Fetch permissions from API and transform into ModulePermissions shape expected by the UI.
 * The API returns items like "users.read"; we group by the prefix (module) and
 * create one submodule per prefix (named prettified). Each action (read/create/update/delete/view)
 * becomes a boolean flag on the Permission object.
 */
export async function fetchPermissionsAsModulePermissions(): Promise<ModulePermissions> {
  try {
    const res = await apiClient.get<any>(ENDPOINTS.PERMISSIONS);
    const items = Array.isArray(res.data) ? res.data : [];

    const out: ModulePermissions = {};
    // index to map module/submodule/action -> permission id from API
    const permissionIdIndex: Record<string, Record<string, Record<string, number>>> = {};

    // small custom grouping map for common prefixes that belong to the same UI module
    const CUSTOM_MODULE_MAP: Record<string, string> = {
      users: 'User Management',
      roles: 'User Management',
      profile: 'User Management',
      permissions: 'User Management',
      brand: 'Master Data',
      agency: 'Master Data',
      department: 'Master Data',
      designation: 'Master Data',
      industry: 'Master Data',
      'lead source': 'Master Data',
    };


    items.forEach((it: any) => {
      const rawName = it.name || it.slug || '';
      if (!rawName) return;

      const parts = String(rawName).split('.').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return;

      const moduleKey = parts[0];
      const action = parts[1] || 'read';

      // Determine module group name: prefer CUSTOM_MODULE_MAP, then try to match existing rolePermissionsData modules/submodules,
      // otherwise fallback to a prettified moduleKey
      const lookupKey = String(moduleKey).toLowerCase();
      let moduleName = CUSTOM_MODULE_MAP[lookupKey] || '';

      if (!moduleName) {
        // try to find a module that contains the key in its name or submodules
        const found = rolePermissionsData.find((m) =>
          m.name.toLowerCase().includes(lookupKey) ||
          m.submodules.some((s) => s.name.toLowerCase().includes(lookupKey))
        );
        if (found) moduleName = found.name;
      }

      if (!moduleName) {
        moduleName = toTitle(moduleKey);
      }

      // Submodule display: prefer API display_name if present, otherwise try to map to a submodule in static data, fallback to moduleName
      let submoduleName = (it.display_name && String(it.display_name).trim()) || '';
      if (!submoduleName) {
        // try to match submodule in static data
        const moduleDef = rolePermissionsData.find((m) => m.name === moduleName);
        if (moduleDef) {
          const sfound = moduleDef.submodules.find((s) => s.name.toLowerCase().includes(lookupKey));
          if (sfound) submoduleName = sfound.name;
        }
      }
      if (!submoduleName) submoduleName = toTitle(moduleKey);

      if (!out[moduleName]) out[moduleName] = {};
      if (!out[moduleName][submoduleName]) {
        out[moduleName][submoduleName] = {
          read: false,
          create: false,
          update: false,
          delete: false,
        } as Permission;
      }

      // ensure index structure exists
      permissionIdIndex[moduleName] = permissionIdIndex[moduleName] || {};
      permissionIdIndex[moduleName][submoduleName] = permissionIdIndex[moduleName][submoduleName] || {};

      // Map action to permission key (normalize common synonyms)
      const key = String(action).toLowerCase();
      if (key === 'read' || key === 'view') {
        out[moduleName][submoduleName].read = true;
        permissionIdIndex[moduleName][submoduleName]['read'] = Number(it.id || it.ID || it.permission_id || it.permissionId || it._id || 0);
      } else if (key === 'create' || key === 'add') {
        out[moduleName][submoduleName].create = true;
        permissionIdIndex[moduleName][submoduleName]['create'] = Number(it.id || it.ID || it.permission_id || it.permissionId || it._id || 0);
      } else if (key === 'update' || key === 'edit') {
        out[moduleName][submoduleName].update = true;
        permissionIdIndex[moduleName][submoduleName]['update'] = Number(it.id || it.ID || it.permission_id || it.permissionId || it._id || 0);
      } else if (key === 'delete' || key === 'remove') {
        out[moduleName][submoduleName].delete = true;
        permissionIdIndex[moduleName][submoduleName]['delete'] = Number(it.id || it.ID || it.permission_id || it.permissionId || it._id || 0);
      } else {
        // Unknown action: attach as `view` if Permission has view, else ignore
        if ((out[moduleName][submoduleName] as any).view !== undefined) {
          (out[moduleName][submoduleName] as any).view = true;
          permissionIdIndex[moduleName][submoduleName]['view'] = Number(it.id || it.ID || it.permission_id || it.permissionId || it._id || 0);
        }
      }
    });

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
