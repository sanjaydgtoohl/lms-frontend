import React, { useState, useEffect } from 'react';
import { listBrands } from '../../services/BrandMaster';
import { listAgencies } from '../../services/AgencyMaster';
import { listUsers } from '../../services/AllUsers';
import { listLeads } from '../../services/AllLeads';
import { fetchBriefStatuses } from '../../services/BriefStatus';
import { motion } from 'framer-motion';
import { MasterFormHeader, NotificationPopup, Button, SelectField } from '../../components/ui';
// Dropdown UI uses SelectField component

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
};

const CreateBriefForm: React.FC<Props> = ({ onClose, onSave, initialData, mode = 'create' }) => {
  const [form, setForm] = useState({
    briefId: '',
    briefName: '',
    brandName: '',
    productName: '',
    contactPerson: '',
    modeOfCampaign: '',
    mediaType: '',
    priority: '',
    budget: '',
    createdBy: '',
    assignTo: '',
    status: '',
    briefDetail: '',
    submissionDate: '',
    programmatic: 'Programmatic',
    type: '',
  });

  // Contact person dropdown state (loaded from API - leads list)
  const [contactPersons, setContactPersons] = useState<Array<string | { value: string; label: string }>>([]);
  const [contactPersonsLoading, setContactPersonsLoading] = useState(false);
  const [contactPersonsError, setContactPersonsError] = useState<string | null>(null);

  // Brand Name dropdown state (will be loaded from API)
  const [brands, setBrands] = useState<Array<string | { value: string; label: string }>>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  // Agency Name dropdown state (will be loaded from API)
  const [agencies, setAgencies] = useState<Array<string | { value: string; label: string }>>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [agenciesError, setAgenciesError] = useState<string | null>(null);
  // Assign To users dropdown state (will be loaded from API)
  const [users, setUsers] = useState<Array<string | { value: string; label: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  // Brief Status dropdown state (will be loaded from API)
  const [briefStatuses, setBriefStatuses] = useState<Array<string | { value: string; label: string }>>([]);
  const [briefStatusesLoading, setBriefStatusesLoading] = useState(false);
  const [briefStatusesError, setBriefStatusesError] = useState<string | null>(null);

  // dropdowns are handled by SelectField; it manages outside-click and blur

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Load brand options on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBrandsLoading(true);
        const res = await listBrands(1, 200); // fetch up to 200 brands; adjust if needed
        if (!mounted) return;
        const opts = (res.data || []).map(b => ({ value: String(b.id), label: String(b.name) }));
        setBrands(opts);

        // if initialData had a brand name, try to reconcile to id
        if (initialData && initialData.brandName) {
          const foundById = opts.find(o => o.value === String(initialData.brandName));
          const foundByName = opts.find(o => o.label === String(initialData.brandName));
          if (foundById) setForm(prev => ({ ...prev, brandName: foundById.value }));
          else if (foundByName) setForm(prev => ({ ...prev, brandName: foundByName.value }));
        }
      } catch (err: any) {
        console.error('Failed to load brands', err);
        if (!mounted) return;
        setBrandsError(err?.message || 'Failed to load brands');
      } finally {
        if (mounted) setBrandsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [initialData]);

  // Load agency options on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAgenciesLoading(true);
        const res = await listAgencies(1, 200);
        if (!mounted) return;
        const opts = (res.data || []).map(a => ({ value: String(a.id), label: String(a.name) }));
        setAgencies(opts);

        // if initialData had a createdBy value, try to reconcile to id
        if (initialData && initialData.createdBy) {
          const foundById = opts.find(o => o.value === String(initialData.createdBy));
          const foundByName = opts.find(o => o.label === String(initialData.createdBy));
          if (foundById) setForm(prev => ({ ...prev, createdBy: foundById.value }));
          else if (foundByName) setForm(prev => ({ ...prev, createdBy: foundByName.value }));
        }
      } catch (err: any) {
        console.error('Failed to load agencies', err);
        if (!mounted) return;
        setAgenciesError(err?.message || 'Failed to load agencies');
      } finally {
        if (mounted) setAgenciesLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [initialData]);

  // Load user options on mount (for Assign To)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setUsersLoading(true);
        const res = await listUsers(1, 200);
        if (!mounted) return;
        const opts = (res.data || []).map(u => ({ value: String(u.id), label: String(u.name) }));
        setUsers(opts);

        // if initialData had an assignTo value, try to reconcile to id
        if (initialData && initialData.assignTo) {
          const foundById = opts.find(o => o.value === String(initialData.assignTo));
          const foundByName = opts.find(o => o.label === String(initialData.assignTo));
          if (foundById) setForm(prev => ({ ...prev, assignTo: foundById.value }));
          else if (foundByName) setForm(prev => ({ ...prev, assignTo: foundByName.value }));
        }
      } catch (err: any) {
        console.error('Failed to load users', err);
        if (!mounted) return;
        setUsersError(err?.message || 'Failed to load users');
      } finally {
        if (mounted) setUsersLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [initialData]);

  // Load contact persons (from leads) on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setContactPersonsLoading(true);
        const res = await listLeads(1, 200);
        if (!mounted) return;
        const opts = (res.data || []).map((l) => ({ value: String(l.id), label: String(l.name || l.contact_person || l.email || `Lead ${l.id}`) }));
        setContactPersons(opts);

        // if initialData had a contactPerson value, try to reconcile to id or name
        if (initialData && initialData.contactPerson) {
          const foundById = opts.find(o => o.value === String(initialData.contactPerson));
          const foundByLabel = opts.find(o => o.label === String(initialData.contactPerson));
          if (foundById) setForm(prev => ({ ...prev, contactPerson: foundById.value }));
          else if (foundByLabel) setForm(prev => ({ ...prev, contactPerson: foundByLabel.value }));
        }
      } catch (err: any) {
        console.error('Failed to load contact persons', err);
        if (!mounted) return;
        setContactPersonsError(err?.message || 'Failed to load contact persons');
      } finally {
        if (mounted) setContactPersonsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [initialData]);

  // Load brief status options on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBriefStatusesLoading(true);
        const res = await fetchBriefStatuses();
        if (!mounted) return;
        
        // Map brief statuses to SelectField options
        let opts: Array<string | { value: string; label: string }> = [];
        if (res.data && Array.isArray(res.data)) {
          opts = res.data.map((s: any) => {
            const id = String(s.id ?? s.status_id ?? '');
            const name = String(s.name ?? s.status ?? s.brief_status ?? '');
            return { value: id, label: name };
          });
        }
        setBriefStatuses(opts);
      } catch (err: any) {
        console.error('Failed to load brief statuses', err);
        if (!mounted) return;
        setBriefStatusesError(err?.message || 'Failed to load brief statuses');
      } finally {
        if (mounted) setBriefStatusesLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // When brief status changes, map it to a default priority
  const [priorityAutoSet, setPriorityAutoSet] = useState(true);

  // When brief status changes, map it to a default priority.
  // Only auto-set when priority hasn't been manually changed (priorityAutoSet=true) or priority is empty.
  useEffect(() => {
    const mapStatusToPriority = (status: string) => {
      if (!status) return undefined;
      const s = String(status).toLowerCase();
      if (s === 'not interested') return 'Low';
      if (s === 'submission' || s === 'negotiation') return 'Medium';
      if (s === 'approve' || s === 'closed') return 'High';
      return undefined;
    };

    const mapped = mapStatusToPriority(form.status as string);
    if (mapped && (priorityAutoSet || !form.priority)) {
      setForm(prev => ({ ...prev, priority: mapped }));
      setPriorityAutoSet(true);
    }
  }, [form.status, priorityAutoSet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // If programmatic mode changes, ensure the currently selected `type` is valid for the new mode.
    if (name === 'programmatic') {
      const newProgrammatic = value;
      const typeOptions = newProgrammatic === 'Non-Programmatic' ? ['DOOH', 'OOH'] : ['DOOH', 'CTV'];
      setForm(prev => ({ ...prev, programmatic: newProgrammatic, type: typeOptions.includes(prev.type) ? prev.type : '' }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const next: Record<string, string> = {};
  if (!form.briefName || form.briefName.trim() === '') next.briefName = 'Please Enter Brief Name';
  if (!form.contactPerson || String(form.contactPerson).trim() === '') next.contactPerson = 'Please Select Contact Person';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSaving(true);
      // Build payload matching backend expected field names
      const payload: Record<string, any> = {};
      // Basic fields
      payload.name = form.briefName;
      // IDs from select components (they may be strings or option objects). Convert to integers when possible.
      const toInt = (val: any) => {
        if (val === null || val === undefined) return undefined;
        const raw = typeof val === 'object' ? (val.value ?? val.id ?? '') : String(val);
        const n = parseInt(String(raw), 10);
        return Number.isNaN(n) ? undefined : n;
      };

      const bid = toInt(form.brandName);
      if (bid !== undefined) payload.brand_id = bid;
      const aid = toInt(form.createdBy);
      if (aid !== undefined) payload.agency_id = aid;
      const cp = toInt(form.contactPerson);
      if (cp !== undefined) payload.contact_person_id = cp;
      const assignId = toInt(form.assignTo);
      if (assignId !== undefined) payload.assign_user_id = assignId;
      const statusId = toInt(form.status);
      if (statusId !== undefined) payload.brief_status_id = statusId;

      // Product / mode / media / budget / comment
      if (form.productName) payload.product_name = form.productName;
      // programmatic value chosen by user may be 'Programmatic'|'Non-Programmatic'
      if (form.programmatic) payload.mode_of_campaign = String(form.programmatic).toLowerCase().replace(/\s+/g, '_');
      // Use `type` field from UI as media type (Select name="type")
      if (form.type) payload.media_type = String(form.type).toLowerCase();
      if (form.budget) payload.budget = form.budget;
      if (form.briefDetail) payload.comment = form.briefDetail;

      // submission date/time - normalize to `YYYY-MM-DD HH:mm:ss` when possible
      const submissionDate = (form as any).submissionDate;
      const submissionTime = (form as any).submissionTime;
      if (submissionDate && submissionTime) {
        let dateStr = String(submissionDate).trim();
        // convert DD-MM-YYYY -> YYYY-MM-DD
        const dmy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dmy) dateStr = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
        // if time is HH:mm, add seconds
        let timeStr = String(submissionTime).trim();
        if (/^\d{2}:\d{2}$/.test(timeStr)) timeStr = `${timeStr}:00`;
        payload.submission_date = `${dateStr} ${timeStr}`;
      } else if (submissionDate) {
        let dateStr = String(submissionDate).trim();
        const dmy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dmy) dateStr = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
        payload.submission_date = dateStr;
      }

      // Priority mapping: UI uses labels, backend expects priority_id (1/2/3)
      const priorityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
      if (form.priority) {
        // priority may be a label like 'Low'|'Medium'|'High' - map to numeric ids when possible
        const mapped = priorityMap[String(form.priority)];
        payload.priority_id = mapped ?? toInt(form.priority) ?? form.priority;
      }

      if (initialData && initialData.id) payload.id = initialData.id;
      // If parent provided an onSave handler, use it. Otherwise use the
      // built-in API wiring available in services/CreateBriefForm.ts
      let res: any = null;
      if (onSave) {
        res = (onSave as any)(payload);
        if (res && typeof res.then === 'function') await res;
      } else {
        // Lazy import to avoid circular dependency issues and keep bundle small
        const svc = await import('../../services/CreateBriefForm');
        res = svc.submitCreateBrief ? svc.submitCreateBrief(payload) : null;
        if (res && typeof res.then === 'function') await res;
      }
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1200);
    } catch (err) {
      // noop - parent handles errors
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader onBack={onClose} title={mode === 'edit' ? 'Edit Brief' : 'Create Brief'} />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={mode === 'edit' ? 'Brief updated successfully' : 'Brief created successfully'}
        type="success"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Name <span className="text-[#FF0000]">*</span></label>
                  <input name="briefName" value={form.briefName} onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, briefName: '' })); }}
                    placeholder="Please enter product name"
                    className={`w-full px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 transition-colors ${errors.briefName ? 'border border-red-500 bg-red-50 focus:ring-red-500' : 'border border-[var(--border-color)] focus:ring-blue-500'}`}
                    aria-invalid={errors.briefName ? 'true' : 'false'}
                    aria-describedby={errors.briefName ? 'briefName-error' : undefined}
                  />
                  {errors.briefName && (
                    <div id="briefName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.briefName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brand Name</label>
                  <SelectField
                    name="brandName"
                    placeholder={brandsLoading ? 'Loading brands...' : 'Auto Select'}
                    options={brands}
                    value={form.brandName}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, brandName: val })); }}
                    searchable
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={brandsLoading}
                  />
                  {brandsError && <div className="text-xs text-red-600 mt-1">{brandsError}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Product Name</label>
                  <input name="productName" value={form.productName} onChange={handleChange}
                    placeholder="Please enter product name"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Assign To</label>
                  <SelectField
                    name="assignTo"
                    placeholder={usersLoading ? 'Loading users...' : 'Please Assign To Planner'}
                    options={users}
                    value={form.assignTo}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, assignTo: val })); }}
                    searchable
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={usersLoading}
                  />
                  {usersError && <div className="text-xs text-red-600 mt-1">{usersError}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Status</label>
                  <SelectField
                    name="status"
                    placeholder={briefStatusesLoading ? 'Loading statuses...' : 'Select Brief Status'}
                    options={briefStatuses}
                    value={form.status}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, status: val })); }}
                    searchable
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                    disabled={briefStatusesLoading}
                  />
                  {briefStatusesError && <div className="text-xs text-red-600 mt-1">{briefStatusesError}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Mode Of Campaign</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="programmatic"
                        value="Programmatic"
                        checked={form.programmatic === 'Programmatic'}
                        onChange={handleChange}
                        className="form-radio accent-blue-600"
                      />
                      <span className="ml-2 text-sm">Programmatic</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="programmatic"
                        value="Non-Programmatic"
                        checked={form.programmatic === 'Non-Programmatic'}
                        onChange={handleChange}
                        className="form-radio accent-blue-600"
                      />
                      <span className="ml-2 text-sm">Non-Programmatic</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Select Type</label>
                  <SelectField
                    name="type"
                    placeholder="Select Type"
                    options={form.programmatic === 'Non-Programmatic' ? ['DOOH', 'OOH'] : ['DOOH', 'CTV']}
                    value={form.type}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, type: val })); }}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Contact Person Name <span className="text-[#FF0000]">*</span></label>
                  <SelectField
                    name="contactPerson"
                    placeholder={contactPersonsLoading ? 'Loading contacts...' : 'Search or select contact person'}
                    options={contactPersons}
                    value={form.contactPerson}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, contactPerson: val })); setErrors(prev => ({ ...prev, contactPerson: '' })); }}
                    searchable
                    disabled={contactPersonsLoading}
                    inputClassName={errors.contactPerson ? 'border border-red-500 bg-red-50 focus:ring-red-500' : 'border border-[var(--border-color)] focus:ring-blue-500'}
                    className=""
                  />
                  {errors.contactPerson && (
                    <div id="contactPerson-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.contactPerson}
                    </div>
                  )}
                  {contactPersonsError && <div className="text-xs text-red-600 mt-1">{contactPersonsError}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name</label>
                  <SelectField
                    name="createdBy"
                    placeholder={agenciesLoading ? 'Loading agencies...' : 'Search or select agency'}
                    options={agencies}
                    value={form.createdBy}
                    onChange={(v) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, createdBy: val })); }}
                    searchable
                    disabled={agenciesLoading}
                  />
                  {agenciesError && <div className="text-xs text-red-600 mt-1">{agenciesError}</div>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Budget</label>
                  <input name="budget" value={form.budget} onChange={handleChange}
                    placeholder="Please Enter Est. Budget"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Submission Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      name="submissionDate"
                      value={form.submissionDate}
                      onChange={handleChange}
                      placeholder="DD-MM-YYYY"
                      className="w-1/2 px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                    />
                    <input
                      name="submissionTime"
                      type="time"
                      onChange={handleChange}
                      className="w-1/2 px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(['Low', 'Medium', 'High'] as const).map((p) => {
                      const active = form.priority === p;
                      const colorMap: Record<string, { base: string; border: string; focus: string }> = {
                        Low: { base: 'bg-blue-600', border: 'border-blue-400 text-blue-600', focus: 'focus:ring-blue-300' },
                        Medium: { base: 'bg-orange-500', border: 'border-orange-300 text-orange-500', focus: 'focus:ring-orange-300' },
                        High: { base: 'bg-red-600', border: 'border-red-400 text-red-600', focus: 'focus:ring-red-300' },
                      };

                      const colors = colorMap[p];

                      // inactive: transparent background, colored border and text
                      const inactiveClasses = `bg-transparent ${colors.border}`;
                      // active: filled background, white text
                      const activeClasses = `${colors.base} text-white border-transparent`;

                      return (
                        <Button
                          key={p}
                          variant="priority"
                          size="sm"
                          className={`px-5 py-1.5 text-sm font-medium leading-none min-h-[32px] ${active ? activeClasses : inactiveClasses} ${colors.focus}`}
                          onClick={() => { setForm(prev => ({ ...prev, priority: p })); setPriorityAutoSet(false); }}
                          aria-pressed={active}
                        >
                          {p}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Detail</label>
                  <textarea name="briefDetail" value={form.briefDetail} onChange={handleChange} rows={4}
                    placeholder="Show all data regarding to Brief"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="submit" className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm disabled:opacity-60" disabled={saving}>
                {saving ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* When editing a brief, show call history / pipeline table similar to design */}
      {mode === 'edit' && (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                    <th className="py-3 px-4">Assigned TO</th>
                    <th className="py-3 px-4">Call Status</th>
                    <th className="py-3 px-4">FollowUp Date &amp; Time</th>
                    <th className="py-3 px-4">Last Call Status</th>
                    <th className="py-3 px-4">Submission Date &amp; Time</th>
                    <th className="py-3 px-4">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { assignedTo: 'Planner 1', callStatus: 'Not Interested', followUp: '-', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                    { assignedTo: 'Planner 1', callStatus: 'Submission', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                    { assignedTo: 'Planner 1', callStatus: 'Negotiation', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                    { assignedTo: 'Planner 1', callStatus: 'Approve', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                    { assignedTo: 'Planner 1', callStatus: 'Closed', followUp: '-', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                  ] as const).map((r, idx) => (
                    <tr key={idx} className={`border-b border-[var(--border-color)]`}>
                      <td className="py-3 px-4 align-top">{r.assignedTo}</td>
                      <td className="py-3 px-4 align-top">{r.callStatus}</td>
                      <td className="py-3 px-4 align-top">{r.followUp}</td>
                      <td className="py-3 px-4 align-top">{r.lastCall}</td>
                      <td className="py-3 px-4 align-top">{r.submission}</td>
                      <td className="py-3 px-4 align-top">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateBriefForm;
