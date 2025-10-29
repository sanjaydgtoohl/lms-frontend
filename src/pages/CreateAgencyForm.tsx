import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Plus } from 'lucide-react';

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

const sampleExistingGroups = ['Group A', 'Group B', 'Group C'];
const agencyTypes = ['Select Type', 'Online', 'Offline', 'Both'];
const agencyClients = ['Select Client', 'Client 1', 'Client 2', 'Client 3'];

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

  // Determine visibility of agency form block per requirements
  const agencyBlockVisible = groupMode === 'direct' || (groupMode === 'existing' && !!existingGroup) || (groupMode === 'new' && groupConfirmed);

  useEffect(() => {
    // When becoming visible, ensure at least one agency block present
    if (agencyBlockVisible && agencies.length === 0) {
      setAgencies([blankAgency()]);
    }
  }, [agencyBlockVisible]);

  const handleSelectExisting = (val: string) => {
    setExistingGroup(val);
    if (val) {
      setGroupConfirmed(true);
      setGroupMode('existing');
    } else {
      setGroupConfirmed(false);
    }
  };

  const handleConfirmNewGroup = () => {
    if (!newGroupInput.trim()) return;
    setExistingGroup(newGroupInput.trim());
    setGroupConfirmed(true);
    setNewGroupInput('');
    setGroupMode('new');
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
      className="flex-1 overflow-auto w-full overflow-x-hidden" style={{ padding: '10px' }}
    >
      <div className="px-2 sm:px-5">
        {/* Outer purple-ish panel to match mockup depth */}
     
          <div className="w-full bg-white rounded-lg sm:rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Agency</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-black"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          </div>

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
                <select
                  value={existingGroup}
                  onChange={(e) => handleSelectExisting(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">PleaseChoose A Group Agency</option>
                  {sampleExistingGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
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
                      <Check className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {agencyBlockVisible && (
              <div className="text-sm text-[var(--text-secondary)] md:col-span-2">Group selected: <span className="font-medium text-[var(--text-primary)]">{groupMode === 'direct' ? 'Direct' : existingGroup}</span></div>
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
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Agency Name *</label>
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
                      <select
                        value={a.client}
                        onChange={(e) => updateAgency(a.id, 'client', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm sm:text-base border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="">Select Brand</option>
                        {agencyClients.filter(c => c !== 'Select Client').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {a.client ? (
                        <div className="ml-3 w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]">
                          {getInitials(a.client)}
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
