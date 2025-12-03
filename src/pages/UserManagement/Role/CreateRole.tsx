import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup } from '../../../components/ui';
// removed static rolePermissionsData import to use dynamic API data only
import type { Permission } from '../../../data/rolePermissionsData';
import { fetchPermissionsAsModulePermissions, createRole as apiCreateRole } from '../../../services/CreateRole';
import RolePermissionTree from '../../../components/ui/RolePermissionTree';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};

interface ModulePermissions {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
}

const CreateRole: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentPermission: '',
  });

  // start with an empty permissions object; will be populated from API
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions>({});

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
      if (initialData.permissions) {
        setModulePermissions(initialData.permissions);
      }
    }
  }, [initialData]);

  // Fetch permissions from API and replace the default/static permissions if available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const perms = await fetchPermissionsAsModulePermissions();
        if (mounted && perms && Object.keys(perms).length > 0) {
          setModulePermissions(perms);
        }
      } catch (err) {
        // ignore, fallback to static data is already in place
        console.error('Error loading permissions:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionToggle = (
    moduleName: string,
    submoduleName: string,
    permissionType: keyof Permission
  ) => {
    setModulePermissions((prev) => {
      const moduleEntry = prev[moduleName] || {};
      const submoduleEntry = moduleEntry[submoduleName] || { read: false, create: false, update: false, delete: false };

      return {
        ...prev,
        [moduleName]: {
          ...moduleEntry,
          [submoduleName]: {
            ...submoduleEntry,
            [permissionType]: !submoduleEntry[permissionType],
          },
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!form.name || form.name.trim() === '') next.name = 'Please Enter Role Name';
    if (!form.description || form.description.trim() === '') next.description = 'Please Enter Description';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const payload = {
        ...form,
        permissions: modulePermissions,
      } as Record<string, any>;
      if (initialData && initialData.id) payload.id = initialData.id;

      // Call API: create or update depending on mode
      if (mode === 'edit' && initialData && initialData.id) {
        // user can add updateRole call here if needed (AllRoles service)
        await apiCreateRole(payload); // fallback to same endpoint if update is not separated
      } else {
        await apiCreateRole(payload);
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.ROLE.ROOT);
      }, 1200);
    } catch (err: any) {
      console.error('Error saving role:', err);

      const respData = err?.responseData || err?.response?.data || null;
      if (respData && respData.errors && typeof respData.errors === 'object') {
        const nextErrs: Record<string, string> = {};
        Object.keys(respData.errors).forEach((k) => {
          const v = respData.errors[k];
          nextErrs[k] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors((prev) => ({ ...prev, ...nextErrs }));
      } else {
        const msg = respData?.message || err?.message || 'Failed to save role';
        setErrorMessage(String(msg));
        setShowErrorToast(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.ROLE.ROOT);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader 
        onBack={handleBack} 
        title={mode === 'edit' ? 'Edit Role' : 'Create Role'} 
      />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={mode === 'edit' ? 'Role updated successfully' : 'Role created successfully'}
        type="success"
      />
      <NotificationPopup
        isOpen={showErrorToast}
        onClose={() => {
          setShowErrorToast(false);
          setErrorMessage('');
        }}
        message={errorMessage || 'Failed to save role'}
        type="error"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Role Name <span className="text-[#FF0000]">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Please enter role name"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <div id="name-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name}
                </div>
              )}
            </div>

            {/* Description - Textarea */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Description <span className="text-[#FF0000]">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Please enter role description"
                rows={4}
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.description
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <div id="description-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Role Permission Section - Tree Style */}
            <div className="mt-8">
              
              <RolePermissionTree
                modulePermissions={modulePermissions}
                onToggle={handlePermissionToggle}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateRole;
