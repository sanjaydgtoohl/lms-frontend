import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader } from '../components/ui';
import { createIndustry } from '../services/IndustryMaster';
import { showSuccess, showError } from '../utils/notifications';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
};

const CreateIndustryForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  

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
      const created = await createIndustry({ name });

      // If parent provided onSave (inline mode), let it handle updates/navigation
      if (onSave) {
        try {
          onSave({ name: created?.name || name, dateTime: formatDateTime(new Date()), id: created?.id });
        } catch (e) {
          // swallow parent errors
        }
      } else {
        // Use global notification (same behaviour as Lead Source)
        showSuccess('Industry created successfully');
        onClose();
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to create industry';
      setError(msg);
      showError(msg);
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
      <MasterFormHeader onBack={onClose} title="Create Industry" />
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
                className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm disabled:opacity-60"
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
