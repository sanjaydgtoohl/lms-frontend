import React, { useEffect, useRef, useState } from 'react';
import { listAgencyTypes, listAgencyClients, createGroupAgency } from '../services';
import { motion } from 'framer-motion';
// ChevronDropdownIcon replaced by unified SelectDropdown; keep import removed
import { Plus, Trash2 } from 'lucide-react';
import { MasterFormHeader, SelectField, MultiSelectDropdown } from '../components/ui';
import { showSuccess, showError } from '../utils/notifications';
import { updateAgency } from '../services/AgencyMaster';

// --- Types used by this form
interface ParentAgency {
  name: string;
  type: string;
  client: string[];
}

interface ChildAgency {
  id: string;
  name: string;
  type: string;
  client: string[];
}

interface Props {
  onClose: () => void;
  onSave?: (payload: { parent: ParentAgency; children: Array<{ name: string; type: string; client: string[] }> }) => Promise<any> | any;
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
}

// helper to create a new blank child entry
const blankChild = (): ChildAgency => ({
  id: `child-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
  name: '',
  type: '',
  client: [],
});
const CreateAgencyForm: React.FC<Props> = ({ onClose, onSave, mode = 'create', initialData }) => {
  const [parent, setParent] = useState<ParentAgency>({ name: '', type: '', client: [] });
  const [children, setChildren] = useState<ChildAgency[]>([]);
  const childNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [parentErrors, setParentErrors] = useState<{ name?: string; type?: string; client?: string }>({});
  const [childErrors, setChildErrors] = useState<Record<string, { name?: string; type?: string; client?: string }>>({});
  // use global notification utility (showSuccess/showError) like other masters

  const [agencyTypes, setAgencyTypes] = useState<Array<{ value: string; label: string }>>([]);
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
  // keep both id and label so SelectField provides id as value (server expects numeric id)
  const opts = items.map((it: any) => ({ value: String(it.id), label: it.name || String(it.id) }));
  setAgencyTypes(opts);
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

    // If initialData provided (edit mode), populate the form
    if (initialData && mode === 'edit') {
      const parentData = initialData.parent || initialData;
      
      // Extract agency type - could be nested object or string
      let parentTypeId = '';
      const rawParentType = parentData.type || parentData.agency_type;
      if (typeof rawParentType === 'object' && rawParentType?.id) {
        parentTypeId = String(rawParentType.id);
      } else if (rawParentType) {
        parentTypeId = String(rawParentType);
      }

      // Extract agency clients - could be array of objects or array of ids
      // Also check for brand data in the response
      let parentClientIds: string[] = [];
      let rawParentClient = parentData.client || parentData.clients || [];
      
      // If no client data but brand data exists, use brand IDs as clients
      if ((!rawParentClient || rawParentClient.length === 0) && parentData.brand && Array.isArray(parentData.brand)) {
        rawParentClient = parentData.brand;
      }
      
      if (Array.isArray(rawParentClient)) {
        parentClientIds = rawParentClient.map((c: any) => {
          if (typeof c === 'object' && c?.id) return String(c.id);
          return String(c);
        });
      }

      setParent({
        name: parentData.name || parentData.agencyName || '',
        type: parentTypeId,
        client: parentClientIds,
      });

        // Handle child agencies (support both 'children' and 'childs' keys)
        const childAgencies = Array.isArray(initialData.children)
          ? initialData.children
          : Array.isArray(initialData.childs)
            ? initialData.childs
            : [];

        if (childAgencies.length > 0) {
          setChildren(childAgencies.map((c: any, idx: number) => {
            // Extract child agency type
            let childTypeId = '';
            const rawChildType = c.type || c.agency_type;
            if (typeof rawChildType === 'object' && rawChildType?.id) {
              childTypeId = String(rawChildType.id);
            } else if (rawChildType) {
              childTypeId = String(rawChildType);
            }

            // Extract child agency clients
            // Also check for brand data in the response
            let childClientIds: string[] = [];
            let rawChildClient = c.client || c.clients || [];

            // If no client data but brand data exists, use brand IDs as clients
            if ((!rawChildClient || rawChildClient.length === 0) && c.brand && Array.isArray(c.brand)) {
              rawChildClient = c.brand;
            }

            if (Array.isArray(rawChildClient)) {
              childClientIds = rawChildClient.map((cc: any) => {
                if (typeof cc === 'object' && cc?.id) return String(cc.id);
                return String(cc);
              });
            }

            return {
              id: `child-${idx}-${Date.now()}`,
              name: c.name || '',
              type: childTypeId,
              client: childClientIds,
            };
          }));
        }
    }

    return () => { mounted = false; };
  }, []);

  // Confirmation modal removed
  // Remove unused modal-related functions
  const handleAddChild = () => {
    const nc = blankChild();
    setChildren(prev => [...prev, nc]);
    setLastAddedId(nc.id);
  };
  const handleUpdateChild = (id: string, key: keyof ChildAgency, value: any) => {
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
    if (!parent.client || parent.client.length === 0) {
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
      if (!c.client || c.client.length === 0) {
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

    try {
      setSubmitting(true);

      // Build FormData arrays to match backend expectations.
      // Backend expects name[] and type[] arrays and nested client arrays like client[0][].
      const form = new FormData();

      const allNames = [parent.name.trim(), ...children.map(c => c.name.trim())];
      allNames.forEach(n => form.append('name[]', n));

      const allTypes = [parent.type, ...children.map(c => c.type)];
      allTypes.forEach(t => {
        const match = agencyTypes.find(a => String(a.value) === String(t) || String(a.label) === String(t));
        const typeVal = match ? String(match.value) : String(t);
        form.append('type[]', typeVal);
      });

      const allClients = [
        Array.isArray(parent.client) ? parent.client : (parent.client ? [parent.client] : []),
        ...children.map(c => Array.isArray(c.client) ? c.client : (c.client ? [c.client] : []))
      ];
      allClients.forEach((clientsForAgency, idx) => {
        (clientsForAgency || []).forEach((clientId) => {
          form.append(`client[${idx}][]`, clientId);
        });
      });

      // Call appropriate API based on mode
      if (mode === 'edit' && initialData?.id) {
        form.append('_method', 'PUT');
        await updateAgency(initialData.id, form);
      } else {
        await createGroupAgency(form);
      }
      
      if (onSave && typeof onSave === 'function') {
        const payload = {
          parent: { ...parent, name: parent.name.trim() },
          children: children.map(c => ({ name: c.name.trim(), type: c.type, client: c.client })),
        };
        const customRes = onSave(payload);
        if (customRes && typeof customRes.then === 'function') await customRes;
      }

      showSuccess(mode === 'edit' ? 'Agency updated successfully' : 'Agency created successfully');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      // Handle API validation errors for parent and child agency names (name.0, name.1, ...)
      const responseData = err?.responseData;
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const newParentErrors: { name?: string; type?: string; client?: string } = {};
        const newChildErrors: Record<string, { name?: string; type?: string; client?: string }> = {};
        // Map 'name.0' to parent agency name error, 'name.1' to first child, etc.
        Object.keys(responseData.errors).forEach((key) => {
          const match = key.match(/^name\.(\d+)$/);
          if (match) {
            const idx = parseInt(match[1], 10);
            if (idx === 0) {
              newParentErrors.name = Array.isArray(responseData.errors[key]) ? responseData.errors[key].join(' ') : String(responseData.errors[key]);
            } else {
              // idx-1 because children array starts after parent
              const child = children[idx - 1];
              if (child) {
                newChildErrors[child.id] = {
                  ...(newChildErrors[child.id] || {}),
                  name: Array.isArray(responseData.errors[key]) ? responseData.errors[key].join(' ') : String(responseData.errors[key]),
                };
              }
            }
          }
        });
        setParentErrors(prev => ({ ...prev, ...newParentErrors }));
        setChildErrors(prev => ({ ...prev, ...newChildErrors }));
        // Do not show global error toast for this case
        return;
      }
      console.error('Submit failed', err);
      try {
        showError((err as any)?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} agency`);
      } catch (e) {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex-1 overflow-hidden w-full overflow-x-hidden bg-[#F6F8FB] min-h-screen"
    >
      {/* global notification used via showSuccess/showError; local popup removed */}

      <div className="">
        <MasterFormHeader onBack={onClose} title={mode === 'edit' ? 'Edit Group Agency' : 'Create Group Agency'} />

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
                    className={`w-full px-3 py-2 h-11 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${parentErrors.name ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                  />
                  {parentErrors.name && (
                    <div className="text-xs text-red-500 mt-1">{parentErrors.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-[#667085] mb-1">Agency Type <span className="text-red-500">*</span></label>
                    <SelectField
                      name="parentType"
                      value={parent.type}
                      options={agencyTypes}
                      onChange={(v) => { setParent(prev => ({ ...prev, type: typeof v === 'string' ? v : v[0] ?? '' })); setParentErrors(prev => ({ ...prev, type: undefined })); }}
                      placeholder="Please Select Agency Type"
                      inputClassName={`${parentErrors.type ? 'border-red-500' : 'border-[#D0D5DD]'} px-3 py-2 h-11`}
                    />
                  {parentErrors.type && (
                    <div className="text-xs text-red-500 mt-1">{parentErrors.type}</div>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm text-[#667085] mb-1">Agency Client <span className="text-red-500">*</span></label>
                  <div className="w-full">
                    <MultiSelectDropdown
                      name="parentClient"
                      value={parent.client}
                      options={agencyClients.map((c: any) => ({ value: String(c.id), label: c.name }))}
                       onChange={(v) => { setParent(prev => ({ ...prev, client: Array.isArray(v) ? v : [v] })); setParentErrors(prev => ({ ...prev, client: undefined })); }}
                      placeholder={isLoading.agencyClients ? 'Loading clients...' : 'Search or select options'}
                      inputClassName={`border ${parentErrors.client ? 'border-red-500' : 'border-[#D0D5DD]'} px-3 py-2 h-11`}
                      disabled={isLoading.agencyClients}
                      multi={true}
                      horizontalScroll={true}
                    />
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
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors duration-200"
                  data-btn-label="Add"
                  style={{ backgroundColor: 'var(--color-orange-400)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Child Agency</span>
                </button>
              </div>
              <div className="space-y-6">
                {children.map((c, idx) => (
                  <div key={c.id} className="p-4 md:p-6 border border-[#E3E8EF] rounded-xl bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-[#344054]">Child Agency {idx + 1}</div>
                      <button
                        type="button"
                        onClick={() => safeRemoveChild(c.id)}
                        className="text-sm px-4 py-2 rounded-lg bg-[#F5F0F0] text-[#D92D20] font-medium flex items-center justify-center hover:bg-[#FFD7D7] transition-colors duration-200"
                        style={{ backgroundColor: '#F5F0F0' }}
                        aria-label={`Delete child agency ${idx + 1}`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
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
                            className={`w-full px-3 py-2 h-11 text-sm border rounded-lg bg-white text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#1570EF] ${childErrors[c.id]?.name ? 'border-red-500' : 'border-[#D0D5DD]'}`}
                        />
                        {childErrors[c.id]?.name && (
                          <div className="text-xs text-red-500 mt-1">{childErrors[c.id].name}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-[#667085] mb-1">Agency Type <span className="text-red-500">*</span></label>
                        <SelectField
                          name={`child-${c.id}-type`}
                          value={c.type}
                          options={agencyTypes}
                          onChange={(v) => { handleUpdateChild(c.id, 'type', typeof v === 'string' ? v : v[0] ?? ''); setChildErrors(prev => ({ ...prev, [c.id]: { ...prev[c.id], type: undefined } })); }}
                          placeholder="Please Select Agency Type"
                          inputClassName={`${childErrors[c.id]?.type ? 'border-red-500' : 'border-[#D0D5DD]'} px-3 py-2 h-11`}
                        />
                        {childErrors[c.id]?.type && (
                          <div className="text-xs text-red-500 mt-1">{childErrors[c.id].type}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-[#667085] mb-1">Agency Client <span className="text-red-500">*</span></label>
                        <div className="w-full">
                          <MultiSelectDropdown
                            name={`child-${c.id}-client`}
                            value={Array.isArray(c.client) ? c.client : (c.client ? [c.client] : [])}
                            options={agencyClients.map((cc: any) => ({ value: String(cc.id), label: cc.name }))}
                             onChange={(v) => { handleUpdateChild(c.id, 'client', Array.isArray(v) ? v : [v]); setChildErrors(prev => ({ ...prev, [c.id]: { ...prev[c.id], client: undefined } })); }}
                            placeholder={isLoading.agencyClients ? 'Loading clients...' : 'Search or select options'}
                            inputClassName={`border ${childErrors[c.id]?.client ? 'border-red-500' : 'border-[#D0D5DD]'} px-3 py-2 h-11`}
                            disabled={isLoading.agencyClients}
                            multi={true}
                            horizontalScroll={true}
                          />
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
                className="px-6 py-2 rounded-lg text-white font-semibold shadow-sm transition-colors duration-200"
                disabled={submitting}
                data-btn-label="Save"
                style={{ backgroundColor: 'var(--color-orange-400)' }}
              >
                {submitting ? (mode === 'edit' ? 'Updating...' : 'Saving...') : (mode === 'edit' ? 'Update' : 'Save')}
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
