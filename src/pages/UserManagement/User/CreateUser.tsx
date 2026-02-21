import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, MultiSelectDropdown } from '../../../components/ui';
import { apiClient } from '../../../utils/apiClient';
import { createUser, updateUser } from '../../../services/CreateUser';
import SweetAlert from '../../../utils/SweetAlert';

type Props = {
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
};

// roleOptions will be fetched from the API

// status removed — backend doesn't require a status field from the frontend

const CreateUser: React.FC<Props> = ({ mode = 'create', initialData }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  roles: [] as string[],
  managers: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [managerOptions, setManagerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Avoid copying sensitive fields like `email`, `password`, and
      // `password_confirmation` from `initialData` so they are not
      // autofilled when opening the edit form.
      setForm((prev) => ({
        ...prev,
        // Only copy safe fields we want pre-filled
        name: initialData.name ?? initialData.full_name ?? prev.name,
        phone: initialData.phone ?? prev.phone,
        // normalize role id(s) to select value(s)
        roles: initialData.roles && Array.isArray(initialData.roles)
          ? initialData.roles.map((r: any) => String(r.id))
          : (initialData.role_id ? [String(initialData.role_id)] : (initialData.role ? [String(initialData.role)] : prev.roles)),
        managers: initialData.managers && Array.isArray(initialData.managers)
          ? initialData.managers.map((m: any) => String(m.id))
          : prev.managers,
        // Ensure password inputs remain empty
        password: '',
        password_confirmation: '',
      }));
    }
  }, [initialData]);

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

  useEffect(() => {
    let mounted = true;

    const loadManagers = async () => {
      setManagersLoading(true);
      setManagersError(null);
      try {
        // Request a reasonably large page so we get all users in one go
        const resp = await apiClient.get<any>('/users?per_page=100');

        // resp may be the api wrapper with `data` or direct array/object depending on server
        // Try a few common shapes to extract the array of items
        let items: any[] = [];
        if (!resp) items = [];
        else if (Array.isArray((resp as any).data)) items = (resp as any).data;
        else if (Array.isArray((resp as any).data?.data)) items = (resp as any).data.data;
        else if (Array.isArray((resp as any).data?.items)) items = (resp as any).data.items;
        else if (Array.isArray((resp as any).data?.users)) items = (resp as any).data.users;
        else if (Array.isArray((resp as any).users)) items = (resp as any).users;
        else if (Array.isArray((resp as any).data?.data?.data)) items = (resp as any).data.data.data;
        else if (Array.isArray((resp as any))) items = (resp as any);
        else items = [];

        const opts = items.map((it: any) => {
          // Prefer numeric id if available; strip non-digits if server returns decorated ids
          const rawId = it.id ?? it.user_id ?? it.value ?? '';
          const numeric = String(rawId).replace(/[^0-9]/g, '') || String(rawId);
          return {
            label: it.name ?? it.full_name ?? it.email ?? String(it.label ?? ''),
            value: String(numeric),
          };
        });

        if (mounted) {
          setManagerOptions(opts);
        }
      } catch (err: any) {
        console.error('Failed to load managers', err);
        if (mounted) setManagersError(err?.message || 'Failed to load managers');
      } finally {
        if (mounted) setManagersLoading(false);
      }
    };

    loadManagers();

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

    // Password required on create
    if (mode !== 'edit') {
      if (!form.password || String(form.password).trim() === '') next.password = 'Please enter password';
      if (!form.password_confirmation || String(form.password_confirmation).trim() === '') next.password_confirmation = 'Please confirm password';
      else if (form.password !== form.password_confirmation) next.password_confirmation = 'Password confirmation does not match';
    } else {
      // If editing and password fields provided, ensure confirmation matches
      if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
        next.password_confirmation = 'Password confirmation does not match';
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      const base = { ...form } as Record<string, any>;
      // Build payload expected by backend
      const payload: Record<string, any> = {
        name: String(base.name || ''),
        email: base.email || '',
        phone: base.phone || null,
      };

      // roles is array of role ids -> send as role_ids (array)
      if (base.roles && base.roles.length > 0) {
        payload.role_ids = base.roles.map((r: string) => Number(r));
      }

      // managers is array of manager ids -> send as manager_ids (array)
      if (base.managers && base.managers.length > 0) {
        payload.manager_ids = base.managers.map((m: string) => Number(m));
        // Set is_parent as array of manager ids
        payload.is_parent = base.managers.map((m: string) => Number(m));
      }

      // include password only when provided (required on create)
      if (base.password && String(base.password).trim() !== '') {
        payload.password = base.password;
        payload.password_confirmation = base.password_confirmation;
      }

      if (initialData && initialData.id) payload.id = initialData.id;

      // Call API service
      if (mode === 'edit' && initialData && initialData.id) {
        await updateUser(String(initialData.id), payload);
        SweetAlert.showUpdateSuccess();
      } else {
        await createUser(payload);
        SweetAlert.showCreateSuccess();
      }
      setTimeout(() => {
        navigate(ROUTES.USER.ROOT);
      }, 1800);
    } catch (err: any) {
      console.error('Error saving user:', err);

      // try to extract structured validation errors from API
      const respData = err?.responseData || err?.response?.data || null;
      if (respData && respData.errors && typeof respData.errors === 'object') {
        const nextErrs: Record<string, string> = {};
        Object.keys(respData.errors).forEach((k) => {
          const v = respData.errors[k];
          // map backend field names to form field names
          let mappedKey = k;
          if (k === 'role_ids' || k === 'role_id') mappedKey = 'roles';
          if (k === 'manager_ids' || k === 'manager_id') mappedKey = 'managers';
          if (k === 'first_name' || k === 'full_name') mappedKey = 'name';
          if (k === 'name') mappedKey = 'name';
          // take first message if array
          nextErrs[mappedKey] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors((prev) => ({ ...prev, ...nextErrs }));
      } else {
        const msg = respData?.message || err?.message || 'Failed to save user';
        try { SweetAlert.showError(String(msg)); } catch (_) {}
      }
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

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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
                Password {mode !== 'edit' && <span className="text-[#FF0000]">*</span>}
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => {
                    handleChange(e);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'Please enter password'}
                  className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border border-[var(--border-color)] focus:ring-blue-500'
                  }`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <span
                  role="button"
                  tabIndex={0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer select-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
                >
                  {showPassword ? (
                    // Eye open icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Eye closed icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.671-2.712A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  )}
                </span>
              </div>
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
                Confirm Password {mode !== 'edit' && <span className="text-[#FF0000]">*</span>}
              </label>
              <div className="relative">
                <input
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={(e) => {
                    handleChange(e);
                    setErrors((prev) => ({ ...prev, password_confirmation: '' }));
                  }}
                  placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'Please confirm password'}
                  className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${
                    errors.password_confirmation
                      ? 'border border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border border-[var(--border-color)] focus:ring-blue-500'
                  }`}
                  aria-invalid={errors.password_confirmation ? 'true' : 'false'}
                  aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
                />
                <span
                  role="button"
                  tabIndex={0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer select-none"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(v => !v); }}
                >
                  {showConfirmPassword ? (
                    // Eye open icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    // Eye closed icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.671-2.712A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  )}
                </span>
              </div>
              {errors.password_confirmation && (
                <div id="password_confirmation-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password_confirmation}
                </div>
              )}
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                Managers
              </label>
              <MultiSelectDropdown
                name="managers"
                placeholder={managersLoading ? 'Loading managers...' : 'Select manager(s)'}
                options={managerOptions}
                value={form.managers}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, managers: v }));
                  setErrors((prev) => ({ ...prev, managers: '' }));
                }}
                disabled={managersLoading}
                inputClassName={`${errors.managers ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-blue-500'}`}
                maxVisibleOptions={2}
              />
              {managersError && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {managersError}
                </div>
              )}
              {errors.managers && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.managers}
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
                autoComplete="off"
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
                maxLength={10}
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
                  onChange={(v) => { setForm((prev) => ({ ...prev, roles: v })); setErrors((prev) => ({ ...prev, roles: '' })); }}
                  disabled={rolesLoading}
                  inputClassName={`border ${errors.roles ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[var(--border-color)] focus:ring-blue-500'}`}
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

            {/* status removed */}

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
