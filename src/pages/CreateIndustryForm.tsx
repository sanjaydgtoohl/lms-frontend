import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
};

const CreateIndustryForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Industry Name is required');
      return;
    }
    if (onSave) onSave({ name, dateTime: formatDateTime(new Date()) });
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
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Industry</h3>
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
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Industry Name *</label>
            <input
              name="industryName"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter industry name"
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
            >
              Save Industry
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateIndustryForm;
