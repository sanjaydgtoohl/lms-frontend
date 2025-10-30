import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { fetchLeadSources, type LeadSource } from '../../services/CreateSourceForm';

type Props = {
  title?: string;
  item: Record<string, any> | null;
  onClose: () => void;
  onSave?: (updated: Record<string, any>) => void;
  hideSource?: boolean;
  /** Optional label to use when the field key is `name` (useful when hideSource is true) */
  nameLabel?: string;
};

const MasterEdit: React.FC<Props> = ({ title = 'Edit', item, onClose, onSave, hideSource = false, nameLabel }) => {
  const [form, setForm] = useState<Record<string, any>>(item || {});
  const [options, setOptions] = useState<LeadSource[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!item) return null;

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // clear per-field error when user edits
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  useEffect(() => {
    let mounted = true;
    setLoadingOptions(true);
    fetchLeadSources()
      .then(list => {
        if (!mounted) return;
        setOptions(list);
        // If the form does not have a source value, default to the first option's name
        // If source field is not hidden and the form does not have a source value, default to the first option's name
        if (!hideSource && ((!form.source || form.source === '') && list.length > 0)) {
          setForm(prev => ({ ...prev, source: list[0].name }));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setOptions([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingOptions(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine sub-source field key if present in the form
    const possibleSubKeys = ['subSource', 'sub_source', 'name'];
    const subKey = possibleSubKeys.find(k => Object.prototype.hasOwnProperty.call(form, k));

    // Validate source if present
    if (Object.prototype.hasOwnProperty.call(form, 'source')) {
      if (!form.source || String(form.source).trim() === '') {
        setErrors({ ...errors, source: 'Please select Source' });
        return;
      }
    }

    // Validate sub-source/name field if present
    if (subKey) {
      const val = form[subKey];
      if (!val || String(val).trim() === '') {
        const fieldMessage = subKey === 'name'
          ? `Please enter ${nameLabel ?? (hideSource ? 'Industry' : 'Sub-Source')}`
          : 'Please enter Sub-Source';
        setErrors({ ...errors, [subKey]: fieldMessage });
        return;
      }
    }

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
  {Object.entries(form).filter(([k]) => k !== 'id' && k !== 'dateTime' && k !== 'date_time' && !(hideSource && k === 'source')).map(([k]) => (
          <div key={k}>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">{(k === 'name' && nameLabel) ? nameLabel : k.replace(/([A-Z])/g, ' $1')}</label>
            {k === 'source' ? (
              <>
                <select
                  value={form[k] ?? ''}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  disabled={loadingOptions}
                >
                  {!loadingOptions && options.map(opt => (
                    <option key={String(opt.id)} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
                {errors[k] && <div className="text-xs text-red-500 mt-1">{errors[k]}</div>}
              </>
            ) : (
              <>
                <input
                  value={form[k] ?? ''}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {errors[k] && <div className="text-xs text-red-500 mt-1">{errors[k]}</div>}
              </>
            )}
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
