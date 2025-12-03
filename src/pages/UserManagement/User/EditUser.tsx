import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup, MultiSelectDropdown } from '../../../components/ui';
import { apiClient } from '../../../utils/apiClient';
import { getUserForEdit, updateUserDetails } from '../../../services/EditUser';
import type { EditUserPayload } from '../../../services/EditUser';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    roles: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch initial user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        if (id) {
          console.log('Fetching user with ID:', id);
          const user = await getUserForEdit(id);
          console.log('User data received:', user);
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            password_confirmation: '',
            roles: user.roles && Array.isArray(user.roles) 
              ? user.roles.map(r => String(r.id)) 
              : (user.role_id ? [String(user.role_id)] : []),
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrors({ submit: 'Failed to load user data. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        // Request a reasonably large page so we get all roles in one go
        const resp = await apiClient.get<any>('/roles?per_page=100');

        // resp may be the api wrapper with `data` or direct array/object depending on server
        // Try a few common shapes to extract the array of items
        let items: any[] = [];
        if (!resp) items = [];
        else if (Array.isArray((resp as any).data)) items = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data)) items = (resp as any).data.data;
        else if (Array.isArray((resp as any).data?.items)) items = (resp as any).data.items;
        else if (Array.isArray((resp as any).data?.roles)) items = (resp as any).data.roles;
        else if (Array.isArray((resp as any).roles)) items = (resp as any).roles;
        else if (Array.isArray((resp as any).data?.data?.data)) items = (resp as any).data.data.data;
        else if (Array.isArray((resp as any))) items = (resp as any);
        else items = [];

        const opts = items.map((it: any) => {
          // Prefer numeric id if available; strip non-digits if server returns decorated ids
          const rawId = it.id ?? it.role_id ?? it.value ?? '';
          const numeric = String(rawId).replace(/[^0-9]/g, '') || String(rawId);
          return {
            label: it.name ?? it.title ?? it.role ?? String(it.label ?? ''),
            value: String(numeric),
          };
        });

        if (mounted) {
          setRoleOptions(opts);
        }
      } catch (err: any) {
        console.error('Failed to load roles', err);
        if (mounted) setRolesError(err?.message || 'Failed to load roles');
      } finally {
        if (mounted) setRolesLoading(false);
      }
    };

    loadRoles();

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
    if (!form.name || form.name.trim() === '') next.name = 'Please enter name';
    if (!form.email || form.email.trim() === '') next.email = 'Please enter email';
    else if (!validateEmail(form.email)) next.email = 'Please enter a valid email address';
    
    if (form.phone && !validatePhone(form.phone)) next.phone = 'Please enter a valid phone number';
    
    if (!form.roles || form.roles.length === 0) next.roles = 'Please select at least one role';

    // If editing and password fields provided, ensure confirmation matches
    if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
      next.password_confirmation = 'Password confirmation does not match';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const base = { ...form } as Record<string, any>;
      // Build payload expected by backend
      const payload: EditUserPayload = {
        name: String(base.name || ''),
        email: base.email || '',
        phone: base.phone || null,
      };

      // roles is array of role ids -> send as role_ids (array)
      if (base.roles && base.roles.length > 0) {
        payload.role_ids = base.roles.map((r: string) => Number(r));
      }

      // include password only when provided (optional on edit)
      if (base.password && String(base.password).trim() !== '') {
        payload.password = base.password;
        payload.password_confirmation = base.password_confirmation;
      }

      if (id) {
        await updateUserDetails(id, payload);
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.USER.ROOT);
      }, 1200);
    } catch (err: any) {
      console.error('Error updating user:', err);

      // try to extract structured validation errors from API
      const respData = err?.responseData || err?.response?.data || null;
      if (respData && respData.errors && typeof respData.errors === 'object') {
        const nextErrs: Record<string, string> = {};
        Object.keys(respData.errors).forEach((k) => {
          const v = respData.errors[k];
          // map backend field names to form field names
          let mappedKey = k;
          if (k === 'role_ids' || k === 'role_id') mappedKey = 'roles';
          if (k === 'first_name' || k === 'full_name') mappedKey = 'name';
          if (k === 'name') mappedKey = 'name';
          // take first message if array
          nextErrs[mappedKey] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors((prev) => ({ ...prev, ...nextErrs }));
      } else {
        const msg = respData?.message || err?.message || 'Failed to update user';
        setErrorMessage(String(msg));
        setShowErrorToast(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.USER.ROOT);
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
        title="Edit User" 
      />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="User updated successfully"
        type="success"
      />
      <NotificationPopup
        isOpen={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={errorMessage}
        type="error"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Name <span className="text-[#FF0000]">*</span>
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

            {/* Password */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Leave blank to keep current password"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <div id="password-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Password confirmation */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Confirm Password
              </label>
              <input
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, password_confirmation: '' }));
                }}
                placeholder="Leave blank to keep current password"
                className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                  errors.password_confirmation
                    ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                    : 'border border-[var(--border-color)] focus:ring-blue-500'
                }`}
                aria-invalid={errors.password_confirmation ? 'true' : 'false'}
                aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
              />
              {errors.password_confirmation && (
                <div id="password_confirmation-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password_confirmation}
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
              <MultiSelectDropdown
                name="roles"
                placeholder={rolesLoading ? 'Loading roles...' : 'Search or select roles'}
                options={roleOptions}
                value={form.roles}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, roles: v }));
                  setErrors((prev) => ({ ...prev, roles: '' }));
                }}
                disabled={rolesLoading}
                inputClassName={`${errors.roles ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-blue-500'}`}
                maxVisibleOptions={2}
              />
              {rolesError && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {rolesError}
                </div>
              )}
              {errors.roles && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.roles}
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
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default EditUser;
