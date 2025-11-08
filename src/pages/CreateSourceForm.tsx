import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import ChevronDropdownIcon from '../components/ui/ChevronDropdownIcon';
import { MasterFormHeader } from '../components/ui';
import { createLeadSubSource, fetchLeadSources, type LeadSource } from '../services/CreateSourceForm';
import { showSuccess, showError } from '../utils/notifications';

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
    if (!source) next.source = 'Please Select Source';
    if (!subSource || subSource.trim() === '') next.subSource = 'Please Enter Sub Source';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      setSaving(true);
      await createLeadSubSource({
        lead_source_id: source,
        name: subSource,
        status: 1,
      });
      showSuccess('Sub-source created successfully');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create sub-source';
      showError(msg);
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
      <MasterFormHeader onBack={onClose} title="Create Source" />
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Source Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => { setSource(e.target.value); setErrors(prev => ({ ...prev, source: '' })); }}
                  className={`w-full appearance-none px-3 pr-8 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                    errors.source || loadError ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                  aria-invalid={errors.source || loadError ? 'true' : 'false'}
                  aria-describedby={errors.source || loadError ? 'source-error' : undefined}
                >
                  <option value="">{loading ? 'Loading...' : 'Please Select Source Name'}</option>
                  {!loading && options.map(opt => (
                    <option key={String(opt.id)} value={String(opt.id)}>{opt.name}</option>
                  ))}
                </select>
                {loading ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <ChevronDropdownIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {(errors.source || loadError) && (
                <div id="source-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.source || loadError}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sub Source <span className="text-red-500">*</span>
              </label>
              <input
                value={subSource}
                onChange={(e) => { setSubSource(e.target.value); setErrors(prev => ({ ...prev, subSource: '' })); }}
                placeholder="Please Enter Sub Source"
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                  errors.subSource ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                aria-invalid={errors.subSource ? 'true' : 'false'}
                aria-describedby={errors.subSource ? 'subSource-error' : undefined}
              />
              {errors.subSource && (
                <div id="subSource-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.subSource}
                </div>
              )}
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

export default CreateSourceForm;
