import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MasterFormHeader, NotificationPopup } from '../../components/ui';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
};

const CreateBriefForm: React.FC<Props> = ({ onClose, onSave, initialData, mode = 'create' }) => {
  const [form, setForm] = useState({
    briefId: '',
    briefName: '',
    brandName: '',
    productName: '',
    contactPerson: '',
    modeOfCampaign: '',
    mediaType: '',
    priority: '',
    budget: '',
    createdBy: '',
    assignTo: '',
    status: '',
    briefDetail: '',
    submissionDate: '',
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form } as Record<string, any>;
      if (initialData && initialData.id) payload.id = initialData.id;
      const res: any = onSave ? (onSave as any)(payload) : null;
      if (res && typeof res.then === 'function') await res;
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1200);
    } catch (err) {
      // noop - parent handles errors
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
      <MasterFormHeader onBack={onClose} title={mode === 'edit' ? 'Edit Brief' : 'Create Brief'} />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message={mode === 'edit' ? 'Brief updated successfully' : 'Brief created successfully'}
        type="success"
      />

      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Name</label>
                <input name="briefName" value={form.briefName} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Brand Name</label>
                <input name="brandName" value={form.brandName} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Product Name</label>
                <input name="productName" value={form.productName} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Contact Person</label>
                <input name="contactPerson" value={form.contactPerson} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Mode Of Campaign</label>
                <input name="modeOfCampaign" value={form.modeOfCampaign} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Media Type</label>
                <input name="mediaType" value={form.mediaType} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
                <input name="priority" value={form.priority} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Budget</label>
                <input name="budget" value={form.budget} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Brief Detail</label>
                <textarea name="briefDetail" value={form.briefDetail} onChange={handleChange} rows={4}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="submit" className="px-4 py-2 rounded-lg btn-primary text-white shadow-sm">
                {mode === 'edit' ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBriefForm;
