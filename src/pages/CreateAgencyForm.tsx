import React, { useEffect, useRef, useState } from 'react';
import { listAgencyTypes, listAgencyClients } from '../services';
import { motion } from 'framer-motion';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { MasterFormHeader, NotificationPopup } from '../components/ui';

// --- Types used by this form
interface ParentAgency {
  name: string;
  type: string;
  client: string;
}

interface ChildAgency {
  id: string;
  name: string;
  type: string;
  client: string;
}

interface Props {
  onClose: () => void;
  onSave?: (payload: { parent: ParentAgency; children: Array<{ name: string; type: string; client: string }> }) => Promise<any> | any;
}

// helper to create a new blank child entry
const blankChild = (): ChildAgency => ({
  id: `child-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  name: '',
  type: '',
  client: '',
});
const CreateAgencyForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [parent, setParent] = useState<ParentAgency>({ name: '', type: '', client: '' });
  const [children, setChildren] = useState<ChildAgency[]>([]);
  const childNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [parentErrors, setParentErrors] = useState<{ name?: string; type?: string; client?: string }>({});
  const [childErrors, setChildErrors] = useState<Record<string, { name?: string; type?: string; client?: string }>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [agencyTypes, setAgencyTypes] = useState<string[]>([]);
  const [agencyClients, setAgencyClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({ agencyTypes: true, agencyClients: true });

  // Confirmation modal removed
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

  // Confirmation modal removed
  // Remove unused modal-related functions
  const handleAddChild = () => {
    const nc = blankChild();
    setChildren(prev => [...prev, nc]);
    setLastAddedId(nc.id);
  };
  const handleUpdateChild = (id: string, key: keyof ChildAgency, value: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [key]: value } : c));
  };
  // legacy remove (not used) -- removed to avoid unused variable lint
  // Remove a child agency (allow zero children so the form can start closed)
  const safeRemoveChild = (id: string) => {
    // remove the ref entry to avoid memory leak
    if (childNameRefs.current[id]) delete childNameRefs.current[id];
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  // autofocus the newly added child's name input when added
  useEffect(() => {
    if (!lastAddedId) return;
    const tryFocus = () => {
      const el = childNameRefs.current[lastAddedId!];
      if (el) {
        try {
          el.focus();
        } catch (e) {
          // ignore
        }
        setLastAddedId(null);
        return true;
      }
      return false;
    };

    // first immediate attempt
    if (tryFocus()) return;

    // element may not be mounted yet; try again shortly
    const t = setTimeout(() => {
      tryFocus();
    }, 60);
    return () => clearTimeout(t);
  }, [lastAddedId]);

  const validate = (): { ok: boolean; message?: string } => {
    let valid = true;
    const newParentErrors: { name?: string; type?: string; client?: string } = {};
    const newChildErrors: Record<string, { name?: string; type?: string; client?: string }> = {};

    if (!parent.name.trim()) {
      newParentErrors.name = 'Please enter agency name';
      valid = false;
    }
    if (!parent.type.trim()) {
      newParentErrors.type = 'Please select agency type';
      valid = false;
    }
    if (!parent.client.trim()) {
      newParentErrors.client = 'Please select agency client';
      valid = false;
    }
    children.forEach(c => {
      const childErr: { name?: string; type?: string; client?: string } = {};
      if (!c.name.trim()) {
        childErr.name = 'Please enter agency name';
        valid = false;
      }
      if (!c.type.trim()) {
        childErr.type = 'Please select agency type';
        valid = false;
      }
      if (!c.client.trim()) {
        childErr.client = 'Please select agency client';
        valid = false;
      }
      if (Object.keys(childErr).length > 0) {
        newChildErrors[c.id] = childErr;
      }
    });
    setParentErrors(newParentErrors);
    setChildErrors(newChildErrors);
    return { ok: valid };
  };

  const submitAll = async () => {
    const v = validate();
    if (!v.ok) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="flex-1 overflow-auto w-full overflow-x-hidden bg-[#F6F8FB] min-h-screen"
    >
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Agency created successfully"
        type="success"
      />

      <div className="space-y-6 p-6">
        <MasterFormHeader onBack={onClose} title="Create Group Agency" />

  <div className="w-full max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-[#E3E8EF] overflow-hidden">
          <div className="p-8 bg-[#F9FAFB] space-y-8">
            <div className="space-y-3">
              <div className="text-base font-semibold text-[#344054] mb-2">Group Agency Details</div>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm text-[#667085] mb-1">Agency Name <span className="text-red-500">*</span></label>
                  <input
                    value={parent.name}
                    onChange={e => {
                      setParent(prev => ({ ...prev, name: e.target.value }));
                      setParentErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Please Enter Agency Name"
                    className={`w-full px-4 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${parentErrors.name ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                  />
                  {parentErrors.name && (
                    <div className="text-xs text-red-500 mt-1">{parentErrors.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-[#667085] mb-1">Agency Type</label>
                  <div className="relative">
                    <select
                      value={parent.type}
                      onChange={e => {
                        setParent(prev => ({ ...prev, type: e.target.value }));
                        setParentErrors(prev => ({ ...prev, type: undefined }));
                      }}
                      className={`w-full appearance-none px-4 pr-10 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${parentErrors.type ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                    >
                      <option value="">Please Select Agency Type</option>
                      {agencyTypes.map((t: string) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                  </div>
                  {parentErrors.type && (
                    <div className="text-xs text-red-500 mt-1">{parentErrors.type}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-[#667085] mb-1">Agency Client</label>
                  <div className="relative">
                    <select
                      value={parent.client}
                      onChange={e => {
                        setParent(prev => ({ ...prev, client: e.target.value }));
                        setParentErrors(prev => ({ ...prev, client: undefined }));
                      }}
                      className={`w-full appearance-none px-4 pr-10 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${parentErrors.client ? 'border-red-500' : 'border-[#D0D5DD]'}`}
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
                  {parentErrors.client && (
                    <div className="text-xs text-red-500 mt-1">{parentErrors.client}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between mb-2">
                <div className="text-base font-semibold text-[#344054]">Add child agency</div>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg btn-primary text-white font-medium shadow-sm transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Child Agency</span>
                </button>
              </div>
              <div className="space-y-6">
                {children.map((c, idx) => (
                  <div key={c.id} className="p-6 border border-[#E3E8EF] rounded-xl bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-[#344054]">Child Agency {idx + 1}</div>
                      <button
                        type="button"
                        onClick={() => safeRemoveChild(c.id)}
                        className="text-sm px-4 py-2 rounded-lg bg-[#F5F0F0] text-[#D92D20] font-medium flex items-center justify-center hover:bg-[#FFD7D7] transition-colors duration-200"
                        aria-label={`Delete child agency ${idx + 1}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm text-[#667085] mb-1">Agency Name <span className="text-red-500">*</span></label>
                        <input
                          value={c.name}
                          onChange={e => {
                            handleUpdateChild(c.id, 'name', e.target.value);
                            setChildErrors(prev => ({ ...prev, [c.id]: { ...prev[c.id], name: undefined } }));
                          }}
                          placeholder="Please Enter Agency Name"
                            ref={el => { childNameRefs.current[c.id] = el }}
                            className={`w-full px-4 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${childErrors[c.id]?.name ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                        />
                        {childErrors[c.id]?.name && (
                          <div className="text-xs text-red-500 mt-1">{childErrors[c.id].name}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-[#667085] mb-1">Agency Type</label>
                        <div className="relative">
                          <select
                            value={c.type}
                            onChange={e => {
                              handleUpdateChild(c.id, 'type', e.target.value);
                              setChildErrors(prev => ({ ...prev, [c.id]: { ...prev[c.id], type: undefined } }));
                            }}
                            className={`w-full appearance-none px-4 pr-10 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${childErrors[c.id]?.type ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                          >
                            <option value="">Please Select Agency Type</option>
                            {agencyTypes.map((t: string) => (<option key={t} value={t}>{t}</option>))}
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                        </div>
                        {childErrors[c.id]?.type && (
                          <div className="text-xs text-red-500 mt-1">{childErrors[c.id].type}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-[#667085] mb-1">Agency Client</label>
                        <div className="relative">
                          <select
                            value={c.client}
                            onChange={e => {
                              handleUpdateChild(c.id, 'client', e.target.value);
                              setChildErrors(prev => ({ ...prev, [c.id]: { ...prev[c.id], client: undefined } }));
                            }}
                            className={`w-full appearance-none px-4 pr-10 py-2 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${childErrors[c.id]?.client ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                            disabled={isLoading.agencyClients}
                          >
                            <option value="">{isLoading.agencyClients ? 'Loading clients...' : 'Please Select Brand'}</option>
                            {!isLoading.agencyClients && agencyClients.map((cc: any) => (<option key={cc.id} value={cc.id.toString()}>{cc.name}</option>))}
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                        </div>
                        {childErrors[c.id]?.client && (
                          <div className="text-xs text-red-500 mt-1">{childErrors[c.id].client}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end mt-8">
              <button
                type="button"
                onClick={submitAll}
                className="px-6 py-2 rounded-lg btn-primary text-white font-semibold shadow-sm transition-colors duration-200"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal removed */}
    </motion.div>
  );
};

export default CreateAgencyForm;
