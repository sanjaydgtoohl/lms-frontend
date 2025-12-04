import React, { useState, useRef, useEffect } from 'react';
import type { Permission } from '../../data/rolePermissionsData';
import { PencilIcon, EyeIcon, Trash2Icon, PlusIcon, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

interface ModulePermissions {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
}

interface Props {
  modulePermissions: ModulePermissions;
  onToggle: (module: string, submodule: string, perm: keyof Permission) => void;
}

const permissionLabels: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  read: 'Read',
};

const permissionIcons = {
  create: PlusIcon,
  update: PencilIcon,
  view: EyeIcon,
  delete: Trash2Icon,
  read: EyeIcon,
};

const RolePermissionTree: React.FC<Props> = ({ modulePermissions, onToggle }) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedSubmodules, setExpandedSubmodules] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExpandModule = (module: string) => {
    setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const handleExpandSubmodule = (key: string) => {
    setExpandedSubmodules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedSubmodules({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter modules derived from dynamic permissions
  const filterModules = (modules: Array<{ name: string; submodules: Array<{ name: string; permissions: Permission }> | any }>) => {
    if (!search.trim()) return modules;
    return modules
      .map((mod) => {
        const filteredSubs = mod.submodules.filter((sub: any) =>
          String(sub.name).toLowerCase().includes(search.toLowerCase()) ||
          Object.keys(sub.permissions || {}).some((p) => p.toLowerCase().includes(search.toLowerCase()))
        );
        if (String(mod.name).toLowerCase().includes(search.toLowerCase()) || filteredSubs.length > 0) {
          return { ...mod, submodules: filteredSubs };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Derive modules from the provided dynamic permissions object
  const deriveModulesFromPermissions = (mp: ModulePermissions) => {
    return Object.keys(mp).map((moduleName) => ({
      name: moduleName,
      submodules: Object.keys(mp[moduleName]).map((subName) => ({
        name: subName,
        permissions: mp[moduleName][subName],
      })),
    }));
  };

  // Always derive modules from modulePermissions (no static fallback)
  const modulesSource = deriveModulesFromPermissions(modulePermissions || {} as ModulePermissions);
  const filteredModules = filterModules(modulesSource as any);

  const getSubmoduleKey = (moduleName: string, submoduleName: string) => `${moduleName}::${submoduleName}`;

  // Calculate checkbox state for a submodule group
  const getSubmoduleCheckboxState = (permissions: Permission) => {
    const values = Object.values(permissions);
    const checkedCount = values.filter((v) => v === true).length;
    const totalCount = values.length;

    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === totalCount) return 'checked';
    return 'indeterminate';
  };

  // Calculate checkbox state for an entire module (all submodules & permissions)
  const getModuleCheckboxState = (moduleName: string) => {
    const module = modulePermissions[moduleName];
    if (!module) return 'unchecked';

    let total = 0;
    let checked = 0;

    Object.keys(module).forEach((subName) => {
      const permissions = module[subName] as Permission;
      Object.values(permissions).forEach((v) => {
        total += 1;
        if (v === true) checked += 1;
      });
    });

    if (checked === 0) return 'unchecked';
    if (checked === total) return 'checked';
    return 'indeterminate';
  };

  // Handle module-level checkbox click to toggle all permissions within the module
  const handleModuleGroupCheckboxClick = (
    moduleName: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    const state = getModuleCheckboxState(moduleName);
    const shouldCheck = state !== 'checked';

    const module = modulePermissions[moduleName];
    if (!module) return;

    Object.keys(module).forEach((subName) => {
      const permissions = module[subName] as Permission;
      Object.keys(permissions).forEach((permKey) => {
        const perm = permKey as keyof Permission;
        const currentState = permissions[perm] as boolean;
        if (currentState !== shouldCheck) {
          onToggle(moduleName, subName, perm);
        }
      });
    });

    // Ensure module is expanded so users can see the result
    if (!expandedModules[moduleName]) {
      setExpandedModules((prev) => ({ ...prev, [moduleName]: true }));
    }
  };

  // Handle submodule group checkbox click
  const handleSubmoduleGroupCheckboxClick = (
    module: string,
    submodule: string,
    permissions: Permission,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    const state = getSubmoduleCheckboxState(permissions);
    const shouldCheck = state !== 'checked';

    // Toggle all permissions
    Object.keys(permissions).forEach((permKey) => {
      const perm = permKey as keyof Permission;
      const currentState = permissions[perm] as boolean;
      if (currentState !== shouldCheck) {
        onToggle(module, submodule, perm);
      }
    });

    // Ensure group is expanded
    const submoduleKey = getSubmoduleKey(module, submodule);
    if (!expandedSubmodules[submoduleKey]) {
      setExpandedSubmodules((prev) => ({ ...prev, [submoduleKey]: true }));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[var(--border-color)] p-4" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-semibold text-[var(--text-primary)]">Role Permission</h4>
        <SearchBar
          delay={300}
          placeholder="Search Permissions"
          onSearch={(q: string) => setSearch(q)}
        />
      </div>
      <div className="flex flex-col gap-0">
        {filteredModules.map((module: any) => (
          module ? (
            <div key={module.name} className="mb-2">
              <div
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 cursor-pointer border-b border-gray-200 rounded hover:bg-gray-150 transition-colors"
                onClick={() => handleExpandModule(module.name)}
                style={{ minHeight: 40 }}
              >
                <input
                  type="checkbox"
                  checked={getModuleCheckboxState(module.name) === 'checked'}
                  ref={(el) => {
                    if (el && getModuleCheckboxState(module.name) === 'indeterminate') {
                      (el as HTMLInputElement).indeterminate = true;
                    }
                  }}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleModuleGroupCheckboxClick(module.name, e as any);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-blue-500 flex-shrink-0"
                />
                <span className="font-semibold text-base text-gray-800">{module.name}</span>
                <span className="text-xs text-gray-500 ml-2">({module.submodules.length})</span>
                <span className="ml-auto text-gray-500 transition-transform" style={{ transform: expandedModules[module.name] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>
              
              {expandedModules[module.name] && (
                <div className="pl-4 border-l-2 border-gray-200 bg-gray-50">
                  {module.submodules.map((submodule: any) => {
                    const submoduleKey = getSubmoduleKey(module.name, submodule.name);
                    const isExpanded = expandedSubmodules[submoduleKey];
                    const permissions = modulePermissions[module.name]?.[submodule.name] || submodule.permissions;
                    
                    return (
                      <div key={submodule.name} className="py-1">
                        <div
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleExpandSubmodule(submoduleKey)}
                          style={{ minHeight: 40 }}
                        >
                          <input
                            type="checkbox"
                            checked={getSubmoduleCheckboxState(permissions) === 'checked'}
                            ref={(el) => {
                              if (el && getSubmoduleCheckboxState(permissions) === 'indeterminate') {
                                el.indeterminate = true;
                              }
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSubmoduleGroupCheckboxClick(module.name, submodule.name, permissions, e as any);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-500 flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-gray-700 flex-1">{submodule.name}</span>
                          <span
                            className="ml-auto text-gray-500 transition-transform cursor-pointer"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="ml-8 py-2 border-l-2 border-blue-200">
                            <div className="space-y-2">
                              {Object.keys(permissions).map((permKey) => {
                                const perm = permKey as keyof Permission;
                                const Icon = permissionIcons[perm];
                                const isActive = permissions[perm] as boolean;
                                const label = permissionLabels[perm] || perm.charAt(0).toUpperCase() + perm.slice(1);

                                if (!Icon) return null;

                                return (
                                  <div
                                    key={perm}
                                    className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-blue-50 rounded transition-colors group"
                                    onClick={() => onToggle(module.name, submodule.name, perm)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isActive}
                                      onChange={() => {}}
                                      className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-500"
                                    />
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${isActive ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                      {label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
