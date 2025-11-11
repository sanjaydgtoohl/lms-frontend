import React, { useState } from 'react';
import { rolePermissionsData } from '../../data/rolePermissionsData';
import type { Permission } from '../../data/rolePermissionsData';
import { FolderIcon, FileIcon, PencilIcon, EyeIcon, Trash2Icon, PlusIcon } from 'lucide-react';

interface ModulePermissions {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
}

interface Props {
  modulePermissions: ModulePermissions;
  onToggle: (module: string, submodule: string, perm: keyof Permission) => void;
}

const permissionIcons = {
  create: PlusIcon,
  update: PencilIcon,
  view: EyeIcon,
  delete: Trash2Icon,
  read: EyeIcon,
};

const RolePermissionTree: React.FC<Props> = ({ modulePermissions, onToggle }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const handleExpand = (module: string) => {
    setExpanded((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const filterModules = (modules: typeof rolePermissionsData) => {
    if (!search.trim()) return modules;
    return modules
      .map((mod) => {
        const filteredSubs = mod.submodules.filter((sub) =>
          sub.name.toLowerCase().includes(search.toLowerCase())
        );
        if (mod.name.toLowerCase().includes(search.toLowerCase()) || filteredSubs.length > 0) {
          return { ...mod, submodules: filteredSubs };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredModules = filterModules(rolePermissionsData);

  return (
    <div className="bg-white rounded-lg border border-[var(--border-color)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search"
          className="border px-2 py-1 rounded w-48 text-sm"
        />
      </div>
      <div className="flex flex-col gap-0">
        {filteredModules.map((module) => (
          module ? (
            <div key={module.name} className="mb-2">
              <div
                className="flex items-center gap-2 px-2 py-1 bg-gray-100 cursor-pointer border-b border-gray-200 rounded"
                onClick={() => handleExpand(module.name)}
                style={{ minHeight: 36 }}
              >
                <FolderIcon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-base">{module.name} <span className="text-xs text-gray-400">({module.submodules.length})</span></span>
                <span className="ml-auto text-xs text-gray-400">{expanded[module.name] ? '-' : '+'}</span>
              </div>
              {expanded[module.name] && (
                <div className="pl-8 border-l-2 border-gray-200">
                  {module.submodules.map((submodule, idx) => (
                    <React.Fragment key={submodule.name}>
                      <div className="flex items-center gap-2 py-1" style={{ minHeight: 32 }}>
                        <FileIcon className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-sm text-gray-700 font-medium" style={{ minWidth: 140 }}>{submodule.name}</span>
                        <div className="flex gap-2 ml-2">
                          {Object.keys(modulePermissions[module.name][submodule.name]).map((permKey) => {
                            const perm = permKey as keyof Permission;
                            const Icon = permissionIcons[perm];
                            const isActive = modulePermissions[module.name][submodule.name][perm];
                            return (
                              <span
                                key={perm}
                                className={`cursor-pointer inline-flex items-center justify-center rounded-full border border-gray-200 bg-white ${isActive ? 'shadow border-green-400' : 'border-blue-300'} ${isActive ? '' : 'opacity-60'}`}
                                style={{ width: 36, height: 36 }}
                                onClick={() => onToggle(module.name, submodule.name, perm)}
                                title={perm.charAt(0).toUpperCase() + perm.slice(1)}
                              >
                                <Icon className={isActive ? 'text-green-400 w-6 h-6' : 'text-blue-400 w-6 h-6'} />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {idx !== module.submodules.length - 1 ? (
                        <div className="ml-5 border-l border-gray-200" style={{ height: 8 }} />
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default RolePermissionTree;
