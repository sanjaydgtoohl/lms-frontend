import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
};

const CreateSourceForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [source, setSource] = useState('');
  const [subSource, setSubSource] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!source) next.source = 'Please select Source';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const payload = { source, subSource };
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Source</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-black"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="p-6 bg-[#F9FAFB]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Source Name *</label>
            <select
              value={source}
              onChange={(e) => { setSource(e.target.value); setErrors(prev => ({ ...prev, source: '' })); }}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">Select Source Name</option>
              <option value="Social Media">Social Media</option>
              <option value="Web">Web</option>
              <option value="Referral">Referral</option>
              <option value="Event">Event</option>
            </select>
            {errors.source && <div className="text-xs text-red-500 mt-1">{errors.source}</div>}
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Sub-Source</label>
            <input
              value={subSource}
              onChange={(e) => setSubSource(e.target.value)}
              placeholder="Enter Sub-Source"
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
            >
              Save Source
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateSourceForm;
