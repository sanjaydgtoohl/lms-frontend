import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { listBrands } from '../../services/BrandMaster';
import { listAgencies } from '../../services/AgencyMaster';
import { listUsers } from '../../services/AllUsers';
import { listLeads } from '../../services/AllLeads';
import { fetchBriefStatuses } from '../../services/BriefStatus';
import { motion } from 'framer-motion';
import { MasterFormHeader, NotificationPopup, SelectField } from '../../components/ui';
// Dropdown UI uses SelectField component

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
};

const CreateBriefForm: React.FC<Props> = ({ onClose, onSave, initialData, mode = 'create' }) => {
    useEffect(() => {
      console.log('CreateBriefForm initialData:', initialData);
    }, [initialData]);
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
    submissionDate: '', // will store date as string (DD-MM-YYYY)
    submissionTime: '', // will store time as string (HH:mm)
    programmatic: 'Programmatic',
    type: '',
  });

  // State for calendar pickers
  const [calendarDate, setCalendarDate] = useState<Date | null>(null); // For date only
  const [calendarTime, setCalendarTime] = useState<Date | null>(null); // For time only

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
      let patched = { ...initialData };
      // Autofill 'type' from mediaType or media_type
      if (!patched.type && (patched.mediaType || patched.media_type)) {
        let mediaTypeVal = patched.mediaType || patched.media_type;
        if (typeof mediaTypeVal === 'object' && mediaTypeVal !== null && 'value' in mediaTypeVal) {
          mediaTypeVal = mediaTypeVal.value;
        }
        if (typeof mediaTypeVal === 'string') {
          const upper = mediaTypeVal.toUpperCase();
          if (["DOOH", "OOH", "CTV"].includes(upper)) {
            patched.type = upper;
          } else if (upper === 'DOOH' || upper === 'OOH' || upper === 'CTV') {
            patched.type = upper;
          } else {
            patched.type = mediaTypeVal.charAt(0).toUpperCase() + mediaTypeVal.slice(1).toLowerCase();
          }
        }
      }
      // Autofill 'briefDetail' from comment if not already set
      if (!patched.briefDetail && patched.comment) {
        patched.briefDetail = patched.comment;
      }
      // Normalize priority when initial data provides an object or id
      if (patched.priority) {
        const pr = patched.priority as any;
        // If priority is an object with a name, use the name
        if (typeof pr === 'object' && pr !== null) {
          if ('name' in pr) patched.priority = String(pr.name ?? '');
          else if ('id' in pr) {
            const rev: Record<number | string, string> = { 1: 'High', 2: 'Medium', 3: 'Low' };
            patched.priority = String(rev[pr.id] ?? pr.id ?? '');
          }
        } else {
          // If priority is a numeric id in string form, map it back to label when possible
          const n = Number(pr);
          if (!Number.isNaN(n)) {
            const rev: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' };
            patched.priority = String(rev[n] ?? pr);
          }
        }
      }

      // Autofill Submission Date and Time from initialData.submission_date or initialData.submissionDate
      let dateObj: Date | null = null;
      let isoDateStr = initialData.submission_date || initialData.submissionDate;
      if (isoDateStr && typeof isoDateStr === 'string' && isoDateStr.includes('T')) {
        try {
          dateObj = new Date(isoDateStr);
          if (!isNaN(dateObj.getTime())) {
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dateObj.getFullYear();
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            patched.submissionDate = `${dd}-${mm}-${yyyy}`;
            patched.submissionTime = `${hh}:${min}`;
            console.log('Parsed submissionDate:', patched.submissionDate, 'submissionTime:', patched.submissionTime);
          }
        } catch {}
      }

      setForm(prev => ({ ...prev, ...patched }));
      // Always update calendarDate and calendarTime from initialData
      if (patched.submissionDate && patched.submissionTime) {
        // Convert DD-MM-YYYY and HH:mm to Date object
        const [dd, mm, yyyy] = patched.submissionDate.split('-');
        const [hh, min] = patched.submissionTime.split(':');
        const dateObj2 = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
        setCalendarDate(dateObj2);
        setCalendarTime(dateObj2);
        console.log('Set calendarDate/calendarTime:', dateObj2);
      }
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

        // Autofill Agency Name field for edit mode
        let agencyVal = initialData?.createdBy || initialData?.agency;
        if (agencyVal) {
          let agencyId = '';
          let agencyName = '';
          if (typeof agencyVal === 'object' && agencyVal !== null) {
            agencyId = String(agencyVal.id);
            agencyName = String(agencyVal.name);
          } else {
            agencyId = String(agencyVal);
            agencyName = String(agencyVal);
          }
          const foundById = opts.find(o => o.value === agencyId);
          const foundByName = opts.find(o => o.label === agencyName);
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

        // Autofill Assign To field for edit mode
        if (initialData && initialData.assignTo) {
          let assignId = '';
          if (typeof initialData.assignTo === 'object' && initialData.assignTo !== null && 'id' in initialData.assignTo) {
            assignId = String(initialData.assignTo.id);
          } else {
            assignId = String(initialData.assignTo);
          }
          const foundById = opts.find(o => o.value === assignId);
          const foundByName = opts.find(o => o.label === String(initialData.assignTo.name || initialData.assignTo));
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

        // Autofill Contact Person field for edit mode
        let contactVal = initialData?.contactPerson || initialData?.contact_person;
        if (contactVal) {
          let contactId = '';
          let contactName = '';
          if (typeof contactVal === 'object' && contactVal !== null) {
            contactId = String(contactVal.id);
            contactName = String(contactVal.name);
          } else {
            contactId = String(contactVal);
            contactName = String(contactVal);
          }
          const foundById = opts.find(o => o.value === contactId);
          const foundByLabel = opts.find(o => o.label === contactName);
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
        // fetchBriefStatuses now returns BriefStatusItem[] directly
        let opts: Array<string | { value: string; label: string }> = [];
        if (Array.isArray(res)) {
          opts = res.map((s: any) => {
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
      // Debug: log form state before submission
      console.log('Form state before submit:', form);
      // Build payload matching backend expected field names
      const payload: Record<string, any> = {};
      // Basic fields
      payload.name = form.briefName;
      // IDs from select components (they may be strings or option objects). Convert to integers when possible.
      const toInt = (val: any) => {
        if (val === null || val === undefined) return undefined;
        const raw = typeof val === 'object' ? (val.value ?? val.id ?? '') : String(val);
        const rawStr = String(raw).trim();
        
        // Handle formatted IDs like #USR001, #AGN045, #LEAD010 - extract the numeric part
        const formatMatch = rawStr.match(/#[A-Z]+(\d+)/);
        if (formatMatch && formatMatch[1]) {
          const n = parseInt(formatMatch[1], 10);
          return Number.isNaN(n) ? undefined : n;
        }
        
        // Try to parse as regular integer
        const n = parseInt(rawStr, 10);
        return Number.isNaN(n) ? undefined : n;
      };

      const bid = toInt(form.brandName);
      if (bid !== undefined) payload.brand_id = bid;
      const aid = toInt(form.createdBy);
      if (aid !== undefined) payload.agency_id = aid;
      const cp = toInt(form.contactPerson);
      if (cp !== undefined) payload.contact_person_id = cp;
      const assignId = toInt(form.assignTo);
      console.log('assignTo value:', form.assignTo, 'converted to:', assignId);
      payload.assign_user_id = assignId || null;
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
      
      // Debug: log the final payload
      console.log('Final payload before submit:', payload);
      
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
                    onChange={(v: any) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, brandName: val })); }}
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
                    value={String(form.assignTo || '')}
                    onChange={(v: any) => { 
                      const val = String(v || '').trim();
                      console.log('Assign To onChange fired with value:', v, 'parsed as:', val);
                      setForm(prev => ({ ...prev, assignTo: val })); 
                    }}
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
                    onChange={(v: any) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, status: val })); }}
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
                    onChange={(v: any) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, type: val })); }}
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
                    onChange={(v: any) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, contactPerson: val })); setErrors(prev => ({ ...prev, contactPerson: '' })); }}
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
                    onChange={(v: any) => { const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v; setForm(prev => ({ ...prev, createdBy: val })); }}
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
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Submission Date</label>
                    <DatePicker
                      selected={calendarDate}
                      onChange={date => {
                        setCalendarDate(date);
                        if (date) {
                          const d = date;
                          const dd = String(d.getDate()).padStart(2, '0');
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const yyyy = d.getFullYear();
                          setForm(prev => ({
                            ...prev,
                            submissionDate: `${dd}-${mm}-${yyyy}`
                          }));
                        }
                      }}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Submission Time</label>
                    <DatePicker
                      selected={calendarTime}
                      onChange={date => {
                        setCalendarTime(date);
                        if (date) {
                          const d = date;
                          const hh = String(d.getHours()).padStart(2, '0');
                          const min = String(d.getMinutes()).padStart(2, '0');
                          setForm(prev => ({
                            ...prev,
                            submissionTime: `${hh}:${min}`
                          }));
                        }
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="HH:mm"
                      placeholderText="HH:mm"
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
                  <SelectField
                    name="priority"
                    placeholder="Select Priority"
                    options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }]}
                    value={form.priority}
                    onChange={(v: any) => {
                      const val = (typeof v === 'object') ? (v.value ?? v.id ?? v) : v;
                      setForm(prev => ({ ...prev, priority: val }));
                    }}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Detail</label>
                  <textarea
                    name="briefDetail"
                    value={form.briefDetail}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Show all data regarding to Brief"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white resize-none"
                  />
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
        <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden mt-6">
          <div className="p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">History</h3>
            <div className="overflow-x-auto">
              {/* Use the Table component for consistent design */}
              <Table
                data={[
                  { assignedTo: 'Planner 1', callStatus: 'Not Interested', followUp: '-', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                  { assignedTo: 'Planner 1', callStatus: 'Submission', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                  { assignedTo: 'Planner 1', callStatus: 'Negotiation', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                  { assignedTo: 'Planner 1', callStatus: 'Approve', followUp: '02-07-2025 22:23', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                  { assignedTo: 'Planner 1', callStatus: 'Closed', followUp: '-', lastCall: '02-07-2025 22:23', submission: '02-07-2025 22:23', comment: 'According to Client Email' },
                ]}
                columns={[
                  { key: 'assignedTo', header: 'Assigned TO', className: 'whitespace-nowrap overflow-hidden truncate' },
                  { key: 'callStatus', header: 'Call Status', className: 'whitespace-nowrap overflow-hidden truncate' },
                  { key: 'followUp', header: 'FollowUp Date & Time', className: 'whitespace-nowrap overflow-hidden truncate' },
                  { key: 'lastCall', header: 'Last Call Status', className: 'whitespace-nowrap overflow-hidden truncate' },
                  { key: 'submission', header: 'Submission Date & Time', className: 'whitespace-nowrap overflow-hidden truncate' },
                  { key: 'comment', header: 'Comment', className: 'whitespace-nowrap overflow-hidden truncate' },
                ]}
                desktopOnMobile={true}
                keyExtractor={(_, idx) => `history-row-${idx}`}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateBriefForm;
