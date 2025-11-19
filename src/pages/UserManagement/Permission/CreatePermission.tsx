import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup, SelectField } from '../../../components/ui';
import { createPermission, updatePermission } from '../../../services/CreatePermission';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};

const CreatePermission: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    name: '',
    url: '',
    parentPermission: '',
    description: '',
    icon: '',
    iconText: '',
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
    if (!form.displayName || form.displayName.trim() === '') next.displayName = 'Please Enter Display Name';
    if (!form.name || form.name.trim() === '') next.name = 'Please Enter Name';
    if (!form.description || form.description.trim() === '') next.description = 'Please Enter Description';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const payload = {
        displayName: form.displayName,
        name: form.name,
        url: form.url,
        parentPermission: form.parentPermission || null,
        description: form.description,
        icon: form.icon,
        iconText: form.iconText,
      };

      if (mode === 'edit' && initialData?.id) {
        // Update existing permission
        await updatePermission(initialData.id, payload);
      } else {
        // Create new permission
        await createPermission(payload);
      }
      
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.PERMISSION.ROOT);
      }, 1200);
    } catch (err) {
      console.error('Error saving permission:', err);
      setErrors({ submit: 'Failed to save permission. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.PERMISSION.ROOT);
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
            {/* Display Name */}
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

            {/* Name (Route Name) */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Name (Route Name) <span className="text-[#FF0000]">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Please enter name"
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


            {/* URL */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                URL
              </label>
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="Please enter URL"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors border border-[var(--border-color)] focus:ring-blue-500`}
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Icon
              </label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="Please enter icon name or path"
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors border border-[var(--border-color)] focus:ring-blue-500"
              />
            </div>

            {/* Icon Text */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Icon Text
              </label>
              <input
                name="iconText"
                value={form.iconText}
                onChange={handleChange}
                placeholder="Please enter icon text"
                className="w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors border border-[var(--border-color)] focus:ring-blue-500"
              />
            </div>

            {/* Select Parent Permission */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Select Parent Permission
              </label>
              <SelectField
                name="parentPermission"
                placeholder="Please select parent permission"
                options={[]}
                value={form.parentPermission}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, parentPermission: v }));
                  setErrors((prev) => ({ ...prev, parentPermission: '' }));
                }}
                searchable
                inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Description <span className="text-[#FF0000]">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Please enter description"
                value={form.description}
                onChange={handleChange}
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
