import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup, SelectField } from '../../../components/ui';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};

const descriptionOptions = [
  'Allows viewing user information and profiles',
  'Allows creating new user accounts',
  'Allows updating user information',
  'Allows deleting user accounts',
  'Allows viewing user profile details',
  'Allows viewing permission information',
  'Allows creating new permissions',
  'Allows updating permissions',
  'Allows deleting permissions',
  'Allows viewing role information',
];

const CreatePermission: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
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
    if (!form.name || form.name.trim() === '') next.name = 'Please Enter Permission Name';
    if (!form.displayName || form.displayName.trim() === '') next.displayName = 'Please Enter Display Name';
    if (!form.description || form.description.trim() === '') next.description = 'Please Enter Description';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const payload = { ...form } as Record<string, any>;
      if (initialData && initialData.id) payload.id = initialData.id;
      
      // TODO: Make API call to save permission
      console.log('Saving permission:', payload);
      
      // Mock API success
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.PERMISSION.ROOT);
      }, 1200);
    } catch (err) {
      console.error('Error saving permission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.PERMISSION.ROOT);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader 
        onBack={handleBack} 
        title={mode === 'edit' ? 'Edit Permission' : 'Create Permission'} 
      />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={mode === 'edit' ? 'Permission updated successfully' : 'Permission created successfully'}
        type="success"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Permission Name <span className="text-[#FF0000]">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) => {
                      handleChange(e);
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="Please enter permission name"
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
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Display Name <span className="text-[#FF0000]">*</span>
                  </label>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={(e) => {
                      handleChange(e);
                      setErrors((prev) => ({ ...prev, displayName: '' }));
                    }}
                    placeholder="Please enter display name"
                    className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                      errors.displayName
                        ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                        : 'border border-[var(--border-color)] focus:ring-blue-500'
                    }`}
                    aria-invalid={errors.displayName ? 'true' : 'false'}
                    aria-describedby={errors.displayName ? 'displayName-error' : undefined}
                  />
                  {errors.displayName && (
                    <div id="displayName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.displayName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description - Full width Dropdown using SelectField */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Description <span className="text-[#FF0000]">*</span>
              </label>
              <SelectField
                name="description"
                placeholder="Please select permission description"
                options={descriptionOptions}
                value={form.description}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, description: v }));
                  setErrors((prev) => ({ ...prev, description: '' }));
                }}
                inputClassName={errors.description ? 'border border-red-500 bg-red-50 focus:ring-red-500' : 'border border-[var(--border-color)] focus:ring-blue-500'}
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

            {/* Form Actions */}
            <div className="flex items-center justify-end">
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

export default CreatePermission;
