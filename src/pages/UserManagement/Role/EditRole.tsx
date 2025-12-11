import React, { useState, useEffect } from 'react';
import { updateRoleById } from '../../../services/EditRole';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup } from '../../../components/ui';
import PermissionTree from '../../../components/ui/PermissionTree';



const EditRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    parentPermission: '',
  });


  // Permission tree data from API
  const [permissionTreeData, setPermissionTreeData] = useState<any[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);


  // Fetch permission tree and role data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get token from localStorage (same as CreateRole)
        let token = '';
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.token || '';
          } catch (e) {
            console.error('Failed to parse auth-storage', e);
          }
        }
        // Fetch permission tree
        const permRes = await fetch('https://apislms.dgtoohl.com/api/v1/permissions/all-permission-tree', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
        const permJson = await permRes.json();
        if (permJson && permJson.success && Array.isArray(permJson.data)) {
          setPermissionTreeData(permJson.data);
        }
        // Fetch role data by ID
        if (id) {
          // Ensure only the numeric ID is sent to the API
          const numericId = id.replace(/[^\d]/g, '');
          const roleRes = await fetch(`https://apislms.dgtoohl.com/api/v1/roles/${numericId}`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          });
          const roleJson = await roleRes.json();
          if (roleJson && roleJson.success && roleJson.data) {
            setForm({
              name: roleJson.data.name || '',
              description: roleJson.data.description || '',
              parentPermission: roleJson.data.parentPermission || '',
            });
            // If permissions are stored as array of IDs
            if (Array.isArray(roleJson.data.permissions)) {
              setSelectedPermissionIds(roleJson.data.permissions);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ submit: 'Failed to load role data' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
      // Use 'permission' as the key to match backend API
      const payload = {
        ...form,
        permission: selectedPermissionIds, // key must be 'permission' (not 'permissions')
      } as Record<string, any>;
      if (id) payload.id = id;
      // Make API call to update role
      const numericId = id ? id.replace(/[^\d]/g, '') : '';
      await updateRoleById(numericId, payload);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.ROLE.ROOT);
      }, 1200);
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.ROLE.ROOT);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

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
        title="Edit Role" 
      />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Role updated successfully"
        type="success"
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
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Role Permission</label>
              <PermissionTree
                data={permissionTreeData}
                selectedPermissionIds={selectedPermissionIds}
                onChange={setSelectedPermissionIds}
              />
                {/* Selected IDs display removed */}
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
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default EditRole;
