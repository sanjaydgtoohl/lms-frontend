import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title?: string;
  item: Record<string, any> | null;
  onClose: () => void;
  onSave?: (updated: Record<string, any>) => void;
};

const MasterEdit: React.FC<Props> = ({ title = 'Edit', item, onClose, onSave }) => {
  const [form, setForm] = useState<Record<string, any>>(item || {});

  if (!item) return null;

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave(form);
    onClose();
  };

  return (
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
      >
        <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} type="button" className="flex items-center space-x-2 text-[var(--text-secondary)]">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

      <div className="p-6 bg-[#F9FAFB] space-y-4">
        {Object.entries(form).filter(([k]) => k !== 'id').map(([k]) => (
          <div key={k}>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">{k.replace(/([A-Z])/g, ' $1')}</label>
            <input
              value={form[k] ?? ''}
              onChange={(e) => handleChange(k, e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        ))}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[var(--text-secondary)] hover:text-black">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm">Save</button>
        </div>
      </div>
    </motion.form>
  );
};

export default MasterEdit;
