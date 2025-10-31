import React, { useEffect, useState } from 'react';
import { 
  listAgencyTypes, 
  listGroupAgencies, 
  createGroupAgency, 
  listAgencyClients,
  type GroupAgency,
  type AgencyClient 
} from '../services';
import { motion } from 'framer-motion';
import { Check, Plus, Loader2 } from 'lucide-react';
import { MasterFormHeader } from '../components/ui';

type Props = {
  onClose: () => void;
  onSave?: (data: any) => void;
  inline?: boolean;
};

type AgencyBlock = {
  id: string;
  name: string;
  type: string;
  client: string;
};
// Agency types are fetched from the API; keep a default placeholder option


const blankAgency = (): AgencyBlock => ({ id: String(Date.now()) + Math.random().toString(36).slice(2, 6), name: '', type: '', client: '' });

// Small helper to show client initials in a round avatar when client selected
const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const CreateAgencyForm: React.FC<Props> = ({ onClose, onSave }) => {
  const [existingGroup, setExistingGroup] = useState('');
  const [newGroupInput, setNewGroupInput] = useState('');
  const [groupConfirmed, setGroupConfirmed] = useState(false);
  // groupMode: 'existing' | 'new' | 'direct'
  // Default to 'direct' so the Direct option is selected on first render
  const [groupMode, setGroupMode] = useState<'existing' | 'new' | 'direct'>('direct');

  const [agencies, setAgencies] = useState<AgencyBlock[]>([]);
  const [groupAgencies, setGroupAgencies] = useState<GroupAgency[]>([]);
  const [isLoading, setIsLoading] = useState({
    groupAgencies: true,
    agencyTypes: true,
    createGroup: false,
    agencyClients: true,
  });
  
  const [agencyClients, setAgencyClients] = useState<AgencyClient[]>([]);

  // Agency types fetched from API for the Agency Type dropdown
  const [agencyTypes, setAgencyTypes] = useState<string[]>(['Select Type']);
  
  // Fetch both agency types and group agencies on mount
  useEffect(() => {
    let mounted = true;
    
    // Load agency types
    (async () => {
      try {
        const items = await listAgencyTypes();
        if (!mounted) return;
        const names = items.map(i => i.name || String(i.id));
        setAgencyTypes(['Select Type', ...names]);
      } catch (err) {
        console.error('Failed to load agency types', err);
      } finally {
        if (mounted) {
          setIsLoading(prev => ({ ...prev, agencyTypes: false }));
        }
      }
    })();
    
    // Load group agencies
    (async () => {
      try {
        const items = await listGroupAgencies();
        if (!mounted) return;
        setGroupAgencies(items);
      } catch (err) {
        console.error('Failed to load group agencies', err);
      } finally {
        if (mounted) {
          setIsLoading(prev => ({ ...prev, groupAgencies: false }));
        }
      }
    })();

    // Load agency clients (brands)
    (async () => {
      try {
        const items = await listAgencyClients();
        if (!mounted) return;
        setAgencyClients(items.filter(item => item.status !== "0")); // Only active clients
      } catch (err) {
        console.error('Failed to load agency clients:', err);
      } finally {
        if (mounted) {
          setIsLoading(prev => ({ ...prev, agencyClients: false }));
        }
      }
    })();
    
    return () => { mounted = false; };
  }, []);

  // Determine visibility of agency form block per requirements
  const agencyBlockVisible = groupMode === 'direct' || 
    (groupMode === 'existing' && groupConfirmed) || 
    (groupMode === 'new' && groupConfirmed);
  
  // Debug log for visibility state
  console.log('Form visibility state:', {
    groupMode,
    existingGroup,
    groupConfirmed,
    agencyBlockVisible
  });

  useEffect(() => {
    // When becoming visible, ensure at least one agency block present
    if (agencyBlockVisible && agencies.length === 0) {
      setAgencies([blankAgency()]);
    }
  }, [agencyBlockVisible]);

  const handleSelectExisting = (val: string) => {
    console.log('Selected value:', val);
    console.log('Current group agencies:', groupAgencies);
    
    if (val) {
      // First set the mode
      setGroupMode('existing');
      
      // Then find and set the group
      const selectedGroup = groupAgencies.find(g => g.id.toString() === val);
      console.log('Found group:', selectedGroup);
      
      if (selectedGroup) {
        setExistingGroup(val);
        setGroupConfirmed(true);
      }
    } else {
      setExistingGroup('');
      setGroupMode('existing');
      setGroupConfirmed(false);
    }
  };

  const handleConfirmNewGroup = async () => {
    const groupName = newGroupInput.trim();
    if (!groupName) return;
    
    setIsLoading(prev => ({ ...prev, createGroup: true }));
    try {
      const newGroup = await createGroupAgency({ name: groupName });
      setGroupAgencies(prev => [...prev, newGroup]);
      setExistingGroup(newGroup.id.toString());
      setGroupConfirmed(true);
      setNewGroupInput('');
      setGroupMode('existing'); // Switch to existing mode since we're using the newly created group
    } catch (err) {
      console.error('Failed to create group agency:', err);
      // Error shown via UI store from the service
    } finally {
      setIsLoading(prev => ({ ...prev, createGroup: false }));
    }
  };

  const handleBypass = () => {
    setGroupMode('direct');
    setExistingGroup('');
    setGroupConfirmed(false);
  };

  const addAgency = () => setAgencies(prev => [...prev, blankAgency()]);

  const updateAgency = (id: string, key: keyof AgencyBlock, value: string) => {
    setAgencies(prev => prev.map(a => (a.id === id ? { ...a, [key]: value } : a)));
  };

  const removeAgency = (id: string) => {
    setAgencies(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: require at least one agency name
    if (!agencyBlockVisible) {
      // Shouldn't be able to submit, but guard
      return;
    }
    const cleaned = agencies.map(a => ({ name: a.name.trim(), type: a.type, client: a.client }));
    if (cleaned.length === 0 || cleaned.some(a => !a.name)) {
      // simple validation: every agency must have a name
      alert('Please provide Agency Name for each agency block before saving.');
      return;
    }

    const payload = {
      group: groupMode === 'direct' ? null : existingGroup || null,
      bypassGroup: groupMode === 'direct',
      agencies: cleaned,
    };

    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="flex-1 overflow-auto w-full overflow-x-hidden"
    >
      <div className="space-y-6 p-6">
        <MasterFormHeader onBack={onClose} title="Create Agency" />
        <div className="w-full bg-white rounded-lg sm:rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">

            <div className="p-3 sm:p-6 bg-[#F9FAFB] space-y-4 sm:space-y-6">
        {/* Top: Group selection / creation / bypass using radio options */}
        <div className="space-y-4">
          <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-lg border border-[var(--border-color)] flex flex-col sm:grid sm:grid-cols-3 sm:gap-6 items-start sm:items-center space-y-2 sm:space-y-0">
            {/* Place Direct first and default to direct on initial load */}
            <label className="inline-flex items-center space-x-2 w-full">
              <input
                type="radio"
                name="groupMode"
                checked={groupMode === 'direct'}
                onChange={() => handleBypass()}
                className="form-radio"
              />
              <span className="text-sm font-medium">Direct Agency</span>
            </label>

            <label className="inline-flex items-center space-x-2 w-full">
              <input
                type="radio"
                name="groupMode"
                checked={groupMode === 'existing'}
                onChange={() => setGroupMode('existing')}
                className="form-radio"
              />
              <span className="text-sm font-medium">Select Existing Group Agency</span>
            </label>

            <label className="inline-flex items-center space-x-2 w-full">
              <input
                type="radio"
                name="groupMode"
                checked={groupMode === 'new'}
                onChange={() => setGroupMode('new')}
                className="form-radio"
              />
              <span className="text-sm font-medium">Create New Group Agency</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Existing group input */}
            {groupMode === 'existing' && (
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Choose a Group Agency</label>
                <div className="relative">
                  <select
                    value={existingGroup}
                    onChange={(e) => handleSelectExisting(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    disabled={isLoading.groupAgencies}
                  >
                    <option value="">Select a Group Agency</option>
                    {!isLoading.groupAgencies && groupAgencies
                      .filter(g => g.status !== "0") // Only show active groups
                      .map(g => (
                        <option key={g.id} value={g.id.toString()}>{g.name}</option>
                      ))
                    }</select>
                  {isLoading.groupAgencies && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New group input */}
            {groupMode === 'new' && (
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Enter Group Agency Name</label>
                <div className="flex items-center space-x-2">
                  <input
                    value={newGroupInput}
                    onChange={(e) => setNewGroupInput(e.target.value)}
                    placeholder="Enter Group Agency Name"
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {/* Confirm icon appears when input has value */}
                  {newGroupInput.trim() ? (
                    <button
                      type="button"
                      onClick={handleConfirmNewGroup}
                      title="Confirm new group"
                      className="px-3 py-2 bg-green-100 rounded-lg text-green-700"
                    >
                      {isLoading.createGroup ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {agencyBlockVisible && (
              <div className="text-sm text-[var(--text-secondary)] md:col-span-2">
                Group selected: <span className="font-medium text-[var(--text-primary)]">
                  {groupMode === 'direct' ? 'Direct' : (
                    groupMode === 'existing' && existingGroup ? (
                      groupAgencies.find(g => g.id.toString() === existingGroup)?.name || 'Loading...'
                    ) : (
                      groupMode === 'new' ? newGroupInput : ''
                    )
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Agency blocks: hidden by default until group selected/created or bypass */}
        {agencyBlockVisible && (
          <div className="space-y-5">
            {/* Agency list header with Add Agency button aligned right */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={addAgency}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-100 text-black"
              >
                <Plus className="w-4 h-4" />
                <span>Add Agency</span>
              </button>
            </div>

            {agencies.map((a, idx) => (
              <div key={a.id} className="p-3 sm:p-5 border border-[var(--border-color)] rounded-lg bg-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-5 space-y-2 sm:space-y-0">
                  <div className="text-sm font-medium">Agency {idx + 1}</div>
                  <div className="flex items-center space-x-3 sm:space-x-5">
                    <button
                      type="button"
                      onClick={() => updateAgency(a.id, 'name', '')}
                      className="text-xs text-[var(--text-secondary)]"
                    >Clear</button>
                    {agencies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAgency(a.id)}
                        className="text-xs text-red-500"
                      >Remove</button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name <span className="text-red-500">*</span></label>
                    <input
                      value={a.name}
                      onChange={(e) => updateAgency(a.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      placeholder="Enter Agency Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Type</label>
                    <select
                      value={a.type}
                      onChange={(e) => updateAgency(a.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="">Select Agency Type</option>
                      {agencyTypes.filter(t => t !== 'Select Type').map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Client</label>
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <select
                          value={a.client}
                          onChange={(e) => updateAgency(a.id, 'client', e.target.value)}
                          className="w-full px-3 py-2 text-sm sm:text-base border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          disabled={isLoading.agencyClients}
                        >
                          <option value="">
                            {isLoading.agencyClients ? 'Loading clients...' : 'Select Brand'}
                          </option>
                          {!isLoading.agencyClients && agencyClients.map(client => (
                            <option key={client.id} value={client.id.toString()}>{client.name}</option>
                          ))}
                        </select>
                        {isLoading.agencyClients && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>

                      {a.client ? (
                        <div className="ml-3 w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]">
                          {getInitials(agencyClients.find(c => c.id.toString() === a.client)?.name || '')}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
          >
            Save
          </button>
        </div>
          </div>
        </div>
      
    </div>
    </motion.div>
  );
};

export default CreateAgencyForm;
