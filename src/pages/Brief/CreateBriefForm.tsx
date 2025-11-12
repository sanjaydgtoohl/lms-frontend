import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader, NotificationPopup, Button, SelectField } from '../../components/ui';
import ChevronDropdownIcon from '../../components/ui/ChevronDropdownIcon';
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

  // Contact person dropdown state
  const contactPersons = [
    'John Smith',
    'Emily Chen',
    'Lisa Brown',
    'Alex Green',
    'Robert Taylor',
    'Sarah Jones',
    'Michael Wong',
    'David Miller',
    'Emma White',
    'Jennifer Lee',
  ];
  // contact dropdown is handled by SelectField

  // Brand Name dropdown state
  const brands = [
    'CoolBrand',
    'TechGear',
    'JoyGifts',
    'EcoLife',
    'GlobalFoods',
    'Nike',
    'Puma',
    'Apple',
    'Pepsi',
    'Coca Cola',
  ];
  // brand dropdown is handled by SelectField
  // Agency Name dropdown state
  const agencies = [
    'Agency One',
    'Agency Two',
    'Agency Three',
    'Global Media',
    'Digital Solutions',
    'Creative Works',
    'Media Masters',
    'Ad Agency Pro',
    'Marketing Hub',
    'Brand Connect',
  ];
  // agency dropdown is handled by SelectField

  // dropdowns are handled by SelectField; it manages outside-click and blur

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

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
      const payload = { ...form } as Record<string, any>;
      if (initialData && initialData.id) payload.id = initialData.id;
      const res: any = onSave ? (onSave as any)(payload) : null;
      if (res && typeof res.then === 'function') await res;
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
                    placeholder="Auto Select"
                    options={brands}
                    value={form.brandName}
                    onChange={(v) => { setForm(prev => ({ ...prev, brandName: v })); }}
                    searchable
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
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
                    placeholder="Please Assign To Planner"
                    options={['Planner 1', 'Planner 2', 'Planner 3', 'Planner 4', 'Planner 5']}
                    value={form.assignTo}
                    onChange={(v) => setForm(prev => ({ ...prev, assignTo: v }))}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Status</label>
                  <SelectField
                    name="status"
                    placeholder="Select Brief Status"
                    options={['Not Interested', 'Submission', 'Negotiation', 'Approve', 'Closed']}
                    value={form.status}
                    onChange={(v) => { setForm(prev => ({ ...prev, status: v })); }}
                    inputClassName="border border-[var(--border-color)] focus:ring-blue-500"
                  />
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
                    onChange={(v) => setForm(prev => ({ ...prev, type: v }))}
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
                    placeholder="Search or select contact person"
                    options={contactPersons}
                    value={form.contactPerson}
                    onChange={(v) => { setForm(prev => ({ ...prev, contactPerson: v })); setErrors(prev => ({ ...prev, contactPerson: '' })); }}
                    searchable
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
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name</label>
                  <SelectField
                    name="createdBy"
                    placeholder="Search or select agency"
                    options={agencies}
                    value={form.createdBy}
                    onChange={(v) => setForm(prev => ({ ...prev, createdBy: v }))}
                    searchable
                  />
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
                          disabled
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
