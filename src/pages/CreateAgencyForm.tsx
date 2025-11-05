import React, { useEffect, useState } from 'react';
import { listAgencyTypes, listAgencyClients } from '../services';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { MasterFormHeader, NotificationPopup } from '../components/ui';
const CreateAgencyForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [parent, setParent] = useState<ParentAgency>({ name: '', type: '', client: '' });
  const [children, setChildren] = useState<ChildAgency[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [agencyTypes, setAgencyTypes] = useState<string[]>([]);
  const [agencyClients, setAgencyClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({ agencyTypes: true, agencyClients: true });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await listAgencyTypes();
        if (!mounted) return;
        const names = items.map((i: any) => i.name || String(i.id));
        setAgencyTypes(names);
      } catch (err) {
        console.error('Failed to load agency types', err);
      } finally {
        if (mounted) setIsLoading(prev => ({ ...prev, agencyTypes: false }));
      }
    })();

    (async () => {
      try {
        const items = await listAgencyClients();
        if (!mounted) return;
        setAgencyClients(items.filter((i: any) => i.status !== '0'));
      } catch (err) {
        console.error('Failed to load agency clients:', err);
      } finally {
        if (mounted) setIsLoading(prev => ({ ...prev, agencyClients: false }));
      }
    })();

    return () => { mounted = false; };
  }, []);

  const openConfirm = () => setConfirmModalOpen(true);
  const closeConfirm = () => setConfirmModalOpen(false);

  const handleAddChild = () => setChildren(prev => [...prev, blankChild()]);
  const handleUpdateChild = (id: string, key: keyof ChildAgency, value: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [key]: value } : c));
  };
  const handleRemoveChild = (id: string) => setChildren(prev => prev.filter(c => c.id !== id));

  const validate = (): { ok: boolean; message?: string } => {
    if (!parent.name.trim()) return { ok: false, message: 'Parent agency name is required' };
    for (const c of children) {
      if (!c.name.trim()) return { ok: false, message: 'All child agencies must have a name' };
    }
    return { ok: true };
  };

  const submitAll = async () => {
    const v = validate();
    if (!v.ok) {
      alert(v.message || 'Validation failed');
      return;
    }

    const payload = {
      parent: { ...parent, name: parent.name.trim() },
      children: children.map(c => ({ name: c.name.trim(), type: c.type, client: c.client })),
    };

    try {
      setSubmitting(true);
      const res: any = onSave ? (onSave as any)(payload) : null;
      if (res && typeof res.then === 'function') await res;
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Submit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  // User chose No in confirm modal — immediately submit parent only
  const handleConfirmNo = async () => {
    closeConfirm();
    await submitAll();
  };

  // User chose Yes — close modal and show child section (at least one)
  const handleConfirmYes = () => {
    closeConfirm();
    if (children.length === 0) handleAddChild();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="flex-1 overflow-auto w-full overflow-x-hidden"
    >
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Agency created successfully"
        type="success"
      />

      <div className="space-y-6 p-6">
        <MasterFormHeader onBack={onClose} title="Create Group Agency" />

        <div className="w-full bg-white rounded-lg sm:rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 sm:p-6 bg-[#F9FAFB] space-y-6">
            <div className="space-y-3">
              <div className="text-sm text-[var(--text-secondary)]">Group Agency Details</div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name <span className="text-red-500">*</span></label>
                  <input
                    value={parent.name}
                    onChange={e => setParent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Please Enter Agency Name"
                    className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Type</label>
                  <div className="relative">
                    <select
                      value={parent.type}
                      onChange={e => setParent(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full appearance-none px-3 pr-8 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Please Select Agency Type</option>
                      {agencyTypes.map((t: string) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Client</label>
                  <div className="relative">
                    <select
                      value={parent.client}
                      onChange={e => setParent(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full appearance-none px-3 pr-10 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      disabled={isLoading.agencyClients}
                    >
                      <option value="">{isLoading.agencyClients ? 'Loading clients...' : 'Please Select Brand'}</option>
                      {!isLoading.agencyClients && agencyClients.map((c: any) => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                      ))}
                    </select>
                    {isLoading.agencyClients ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {children.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--text-secondary)]">Add Child Agency : {children.length}</div>
                  <button type="button" onClick={handleAddChild} className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-100 text-black">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Child Agency</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {children.map((c, idx) => (
                    <div key={c.id} className="p-3 border border-[var(--border-color)] rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">Child Agency {idx + 1}</div>
                        <button type="button" onClick={() => handleRemoveChild(c.id)} className="text-sm text-red-600">Delete</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name <span className="text-red-500">*</span></label>
                          <input value={c.name} onChange={e => handleUpdateChild(c.id, 'name', e.target.value)} placeholder="Please Enter Agency Name" className="w-full px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)]" />
                        </div>

                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Type</label>
                          <div className="relative">
                            <select value={c.type} onChange={e => handleUpdateChild(c.id, 'type', e.target.value)} className="w-full appearance-none px-3 pr-8 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)]">
                              <option value="">Please Select Agency Type</option>
                              {agencyTypes.map((t: string) => (<option key={t} value={t}>{t}</option>))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Client</label>
                          <div className="relative">
                            <select value={c.client} onChange={e => handleUpdateChild(c.id, 'client', e.target.value)} className="w-full appearance-none px-3 pr-8 py-2 text-sm border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)]" disabled={isLoading.agencyClients}>
                              <option value="">{isLoading.agencyClients ? 'Loading clients...' : 'Please Select Brand'}</option>
                              {!isLoading.agencyClients && agencyClients.map((cc: any) => (<option key={cc.id} value={cc.id.toString()}>{cc.name}</option>))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={openConfirm}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal (simple inline implementation) */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="text-lg font-medium mb-4">Do you want a child agency?</div>
            <div className="flex justify-end space-x-3">
              <button onClick={handleConfirmYes} className="px-4 py-2 rounded-lg bg-green-100 text-black">Yes</button>
              <button onClick={handleConfirmNo} className="px-4 py-2 rounded-lg bg-red-100 text-red-700">No</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateAgencyForm;
