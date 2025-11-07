import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader, NotificationPopup } from '../components/ui';
import { createIndustry } from '../services/IndustryMaster';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
};

const CreateIndustryForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Industry Name Is Required');
      return;
    }
    try {
      setSaving(true);
      await createIndustry({ name });
      if (onSave) (onSave as any)({ name, dateTime: formatDateTime(new Date()) });
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
        window.location.reload();
      }, 5000);
    } catch (err: any) {
      setError(err?.message || 'Failed to create industry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader onBack={onClose} title="Create Industry" />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Industry created successfully"
        type="success"
      />
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Industry Name <span className="text-red-500">*</span></label>
              <input
                name="industryName"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Please Enter Industry Name"
              />
              {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateIndustryForm;
