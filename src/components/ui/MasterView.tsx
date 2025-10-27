import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title?: string;
  item: Record<string, any> | null;
  onClose: () => void;
};

const MasterView: React.FC<Props> = ({ title = 'View', item, onClose }) => {
  if (!item) return null;

  // produce key/value pairs excluding internal fields if needed
  const entries = Object.entries(item).filter(([k]) => k !== 'id');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <button onClick={onClose} className="flex items-center space-x-2 text-[var(--text-secondary)]">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="p-6 bg-[#F9FAFB] space-y-4">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <div className="text-sm text-[var(--text-secondary)]">{k.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{String(v)}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MasterView;
