import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { MasterFormHeader, MultiSelectDropdown } from '../../../components/ui';
import SweetAlert from '../../../utils/SweetAlert';
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
    managers: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch initial user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        if (id) {
          console.log('Fetching user with ID:', id);
          const user = await getUserForEdit(id);
          console.log('User data received:', user);
          // If user has a 'parent' property, treat it as a manager
          let managers: string[] = [];
          if (user.managers && Array.isArray(user.managers) && user.managers.length > 0) {
            managers = user.managers.map((m: any) => String(Number(m.id)));
          }
          // Always ensure parent is in managerOptions and managers if present
          if (user.parent && user.parent.id && user.parent.name) {
            const parentId = String(Number(user.parent.id));
            setManagerOptions((prev) => {
              const exists = prev.some(opt => opt.value === parentId);
              if (!exists) {
                return [
                  { label: user.parent!.name, value: parentId },
                  ...prev
                ];
              }
              // If already present, but label is not correct, update it
              return prev.map(opt =>
                opt.value === parentId
                  ? { ...opt, label: user.parent!.name }
                  : opt
              );
            });
            // If managers is empty or does not include parent, set it
            if (!managers.includes(parentId)) {
              managers = [parentId];
            }
            // Force update form after managerOptions is set
            setTimeout(() => {
              setForm(f => ({
                ...f,
                managers: [parentId],
              }));
            }, 0);
          } else if (!user.managers || !Array.isArray(user.managers) || user.managers.length === 0) {
            managers = [];
          }
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            password_confirmation: '',
            roles: user.roles && Array.isArray(user.roles) 
              ? user.roles.map(r => String(r.id)) 
              : (user.role_id ? [String(user.role_id)] : []),
            managers,
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
            label: it.name ?? it.full_name ?? '',
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

      // managers is array of manager ids -> send as manager_ids (array)
      if (base.managers && base.managers.length > 0) {
        payload.manager_ids = base.managers.map((m: string) => {
          // Ensure only numeric id is sent
          const num = Number(m);
          return isNaN(num) ? undefined : num;
        }).filter((id: number | undefined): id is number => typeof id === 'number' && !isNaN(id));
        // Also send is_parent as the first manager id (string)
        payload.is_parent = payload.manager_ids && payload.manager_ids.length > 0 ? String(payload.manager_ids[0]) : '';
      } else {
        // If no manager selected, clear is_parent
        payload.is_parent = '';
      }

      // include password only when provided (optional on edit)
      if (base.password && String(base.password).trim() !== '') {
        payload.password = base.password;
        payload.password_confirmation = base.password_confirmation;
      }

      if (id) {
        await updateUserDetails(id, payload);
      }

      SweetAlert.showUpdateSuccess();
      setTimeout(() => {
        navigate(ROUTES.USER.ROOT);
      }, 1800);
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
          if (k === 'manager_ids' || k === 'manager_id') mappedKey = 'managers';
          if (k === 'first_name' || k === 'full_name') mappedKey = 'name';
          if (k === 'name') mappedKey = 'name';
          // take first message if array
          nextErrs[mappedKey] = Array.isArray(v) ? String(v[0]) : String(v);
        });
        setErrors((prev) => ({ ...prev, ...nextErrs }));
      } else {
        const msg = respData?.message || err?.message || 'Failed to update user';
        try { SweetAlert.showError(String(msg)); } catch (_) {}
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
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
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
                Select Manager
              </label>
              <MultiSelectDropdown
                name="managers"
                placeholder={managersLoading ? 'Loading managers...' : 'Search or select managers'}
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
