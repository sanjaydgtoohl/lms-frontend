import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { createLeadSubSource, fetchLeadSources, type LeadSource } from '../services/CreateSourceForm';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
};

const CreateSourceForm: React.FC<Props> = ({ onClose }) => {
  const [source, setSource] = useState('');
  const [subSource, setSubSource] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<LeadSource[]>([]);
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLeadSources()
      .then((list) => {
        if (!mounted) return;
        setOptions(list);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : 'Failed to load sources';
        setLoadError(msg);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!source) next.source = 'Please select Source';
    if (!subSource || subSource.trim() === '') next.subSource = 'Please enter Sub-Source';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      setSaving(true);
      await createLeadSubSource({
        lead_source_id: source,
        name: subSource,
        status: 1,
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create sub-source';
      setErrors((prev) => ({ ...prev, form: msg }));
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
              disabled={loading}
            >
              <option value="">{loading ? 'Loading...' : 'Select Source Name'}</option>
              {!loading && options.map(opt => (
                <option key={String(opt.id)} value={String(opt.id)}>{opt.name}</option>
              ))}
            </select>
            {errors.source && <div className="text-xs text-red-500 mt-1">{errors.source}</div>}
            {loadError && <div className="text-xs text-red-500 mt-1">{loadError}</div>}
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Sub-Source</label>
            <input
              value={subSource}
              onChange={(e) => { setSubSource(e.target.value); setErrors(prev => ({ ...prev, subSource: '' })); }}
              placeholder="Enter Sub-Source"
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {errors.subSource && <div className="text-xs text-red-500 mt-1">{errors.subSource}</div>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Source'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateSourceForm;
