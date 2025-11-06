import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

type Props = {
  title?: string;
  item: Record<string, any> | null;
  onClose: () => void;
};

const MasterView: React.FC<Props> = ({ title, item, onClose }) => {
  if (!item) return null;

  // produce key/value pairs excluding internal fields if needed
  const entries = Object.entries(item).filter(([k]) => k !== 'id');

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <Breadcrumb />
        </div>
        <button onClick={onClose} className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Go Back</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
      >
        {title && (
          <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          </div>
        )}

        <div className="p-6 bg-[#F9FAFB] space-y-4">
          {entries.map(([k, v]) => {
            // convert camelCase / snake_case / kebab-case to Title Case
            const spaced = k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ');
            const title = spaced
              .split(' ')
              .filter(Boolean)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');

            // special casing
            const label = title.toLowerCase() === 'datetime' || title.toLowerCase() === 'date time' ? 'Date & Time' : title;

            return (
              <div key={k} className="flex justify-between">
                <div className="text-sm text-[var(--text-secondary)]">{label}</div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{String(v)}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default MasterView;
