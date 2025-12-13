import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES, API_ENDPOINTS } from '../../../constants';
import { MasterFormHeader, NotificationPopup } from '../../../components/ui';
import { createRole as apiCreateRole } from '../../../services/CreateRole';
import http from '../../../services/http';
import PermissionTree from '../../../components/ui/PermissionTree';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};



const CreateRole: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentPermission: '',
  });

  // Permission tree data from API
  const [permissionTreeData, setPermissionTreeData] = useState<any[]>([]);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [permissionError, setPermissionError] = useState('');

  // Fetch permission tree from API on mount
  useEffect(() => {
    const fetchPermissionTree = async () => {
      try {
        setPermissionLoading(true);
        setPermissionError('');
        const response = await http.get(API_ENDPOINTS.PERMISSION.ALL_TREE);
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setPermissionTreeData(response.data.data);
        } else {
          setPermissionError('Failed to load permissions');
        }
      } catch (err: any) {
        console.error('Failed to fetch permission tree', err);
        const errorMsg = err?.response?.data?.message || 'Failed to load permissions. Please try again.';
        setPermissionError(errorMsg);
      } finally {
        setPermissionLoading(false);
      }
    };
    fetchPermissionTree();
  }, []);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
      // Optionally, set selectedPermissionIds from initialData.permissions if needed
    }
  }, [initialData]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
        permissions: selectedPermissionIds,
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
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Role Permission <span className="text-[#FF0000]">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select permissions for this role</p>
              {permissionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{permissionError}</span>
                </div>
              )}
              <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-white shadow-sm">
                {permissionLoading ? (
                  <div className="p-6 flex items-center justify-center min-h-[250px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 font-medium">Loading permissions...</p>
                    </div>
                  </div>
                ) : (
                  <PermissionTree
                    data={permissionTreeData}
                    selectedPermissionIds={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                  />
                )}
              </div>
              {selectedPermissionIds.length > 0 && !permissionLoading && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {selectedPermissionIds.length} permission(s) selected
                </p>
              )}
              {selectedPermissionIds.length === 0 && !permissionLoading && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Select at least one permission
                </p>
              )}
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
