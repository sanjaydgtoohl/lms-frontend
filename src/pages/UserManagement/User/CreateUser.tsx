import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup, SelectField } from '../../../components/ui';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};

const roleOptions = [
  { label: 'S-Admin', value: 's-admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'BDM', value: 'bdm' },
  { label: 'S-BDM', value: 's-bdm' },
  { label: 'Planner', value: 'planner' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const CreateUser: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!form.firstName || form.firstName.trim() === '') next.firstName = 'Please enter first name';
    if (!form.lastName || form.lastName.trim() === '') next.lastName = 'Please enter last name';
    if (!form.email || form.email.trim() === '') next.email = 'Please enter email';
    else if (!validateEmail(form.email)) next.email = 'Please enter a valid email address';
    
    if (form.phone && !validatePhone(form.phone)) next.phone = 'Please enter a valid phone number';
    if (!form.role || form.role.trim() === '') next.role = 'Please select a role';
    if (!form.status || form.status.trim() === '') next.status = 'Please select status';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const payload = { ...form } as Record<string, any>;
      if (initialData && initialData.id) payload.id = initialData.id;
      
      // TODO: Make API call to save user
      console.log('Saving user:', payload);
      
      // Mock API success
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.USER.ROOT);
      }, 1200);
    } catch (err) {
      console.error('Error saving user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.USER.ROOT);
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
        title={mode === 'edit' ? 'Edit User' : 'Add User'} 
      />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={mode === 'edit' ? 'User updated successfully' : 'User created successfully'}
        type="success"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                First Name <span className="text-[#FF0000]">*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                placeholder="Please enter first name"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.firstName
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <div id="firstName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.firstName}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Last Name <span className="text-[#FF0000]">*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, lastName: '' }));
                }}
                placeholder="Please enter last name"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.lastName
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <div id="lastName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.lastName}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Email <span className="text-[#FF0000]">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Please enter email address"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <div id="email-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Please enter phone number"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.phone
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
              />
              {errors.phone && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Role <span className="text-[#FF0000]">*</span>
              </label>
              <SelectField
                name="role"
                placeholder="Please select a role"
                options={roleOptions}
                value={form.role}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, role: v }));
                  setErrors((prev) => ({ ...prev, role: '' }));
                }}
                searchable
                inputClassName={`border ${errors.role ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-blue-500'}`}
              />
              {errors.role && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.role}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Status <span className="text-[#FF0000]">*</span>
              </label>
              <SelectField
                name="status"
                placeholder="Please select status"
                options={statusOptions}
                value={form.status}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, status: v }));
                  setErrors((prev) => ({ ...prev, status: '' }));
                }}
                searchable
                inputClassName={`border ${errors.status ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-blue-500'}`}
              />
              {errors.status && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.status}
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

export default CreateUser;
