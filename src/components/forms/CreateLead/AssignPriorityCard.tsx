import React, { useEffect, useState } from 'react';
import SelectField from '../../ui/SelectField';
import { getUsers } from '../../../services/CreateLead';
import { getPriorities, getPrioritiesByCallStatus } from '../../../services/Priority';

import { getCallStatuses } from '../../../services/CallStatus';

interface AssignPriorityCardProps {
  assignTo?: string;
  assignedLabel?: string;
  priority?: string;
  callFeedback?: string;
  onChange?: (values: { assignTo?: string; priority?: string; callFeedback?: string }) => void;
}

const AssignPriorityCard: React.FC<AssignPriorityCardProps> = ({
  assignTo,
  assignedLabel,
  priority,
  callFeedback,
  onChange
}) => {
  // Assign To dropdown state
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Priority dropdown state
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  // Call Feedback dropdown state
  const [callStatusOptions, setCallStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [callStatusLoading, setCallStatusLoading] = useState(false);
  const [callStatusError, setCallStatusError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    setCallStatusLoading(true);
    setCallStatusError(null);
    getCallStatuses()
      .then((data: any) => {
        if (!isMounted) return;
        setCallStatusOptions(
          Array.isArray(data)
            ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
            : []
        );
        setCallStatusLoading(false);
      })
      .catch((error: any) => {
        if (!isMounted) return;
        setCallStatusError(error?.message || 'Failed to load call statuses');
        setCallStatusOptions([]);
        setCallStatusLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setUserLoading(true);
    setUserError(null);
    getUsers()
      .then((data: any) => {
        if (!isMounted) return;
        const fetched = Array.isArray(data)
          ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
          : [];
        // If assignTo prop exists but is not in fetched options, prepend it using assignedLabel if available
        if (assignTo) {
          const exists = fetched.find((o: any) => String(o.value) === String(assignTo));
          if (!exists) {
            fetched.unshift({ value: String(assignTo), label: String((assignedLabel) ? assignedLabel : assignTo) });
          }
        }
        setUserOptions(fetched);
        setUserLoading(false);
      })
      .catch((error: any) => {
        if (!isMounted) return;
        setUserError(error?.message || 'Failed to load users');
        setUserOptions([]);
        setUserLoading(false);
      });
    return () => { isMounted = false; };
  }, [assignTo, assignedLabel]);

  useEffect(() => {
    let isMounted = true;
    setPriorityLoading(true);
    setPriorityError(null);
    const fetchFn = callFeedback ? getPrioritiesByCallStatus(callFeedback) : getPriorities();
    fetchFn
      .then((data: any) => {
        if (!isMounted) return;
        const fetched = Array.isArray(data)
          ? data.map((item: any) => ({ value: String(item.id), label: item.name }))
          : [];
        setPriorityOptions(fetched);

        // Check if current priority is still valid, if not, clear it
        const isCurrentPriorityValid = priority && fetched.some(option => option.value === priority);
        if (priority && !isCurrentPriorityValid) {
          onChange?.({ assignTo, priority: undefined, callFeedback });
        }

        // Auto-select if only one priority and no priority is currently selected
        if (fetched.length === 1 && !priority) {
          onChange?.({ assignTo, priority: fetched[0].value, callFeedback });
        }
        setPriorityLoading(false);
      })
      .catch((error: any) => {
        if (!isMounted) return;
        setPriorityError(error?.message || 'Failed to load priorities');
        setPriorityOptions([]);
        setPriorityLoading(false);
      });
    return () => { isMounted = false; };
  }, [callFeedback]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
      <div className="p-6 bg-[#F9FAFB]">
        <h3 className="text-base font-semibold text-[#344054] mb-4">Assignment & Priority</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Assign To</label>
            <SelectField
              options={userOptions}
              placeholder="Select Team Member"
              value={assignTo}
              onChange={(value) => onChange?.({ assignTo: typeof value === 'string' ? value : value[0] ?? '', priority, callFeedback })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={userLoading}
            />
            {userLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
            {userError && <div className="text-xs text-red-500 mt-1">{userError}</div>}
            {!userLoading && !userError && userOptions.length === 0 && (
              <div className="text-xs text-gray-400 mt-1">No users found.</div>
            )}
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
            <SelectField
              options={priorityOptions}
              placeholder="Select Priority"
              value={priority}
              onChange={(value) => onChange?.({ assignTo, priority: typeof value === 'string' ? value : value[0] ?? '', callFeedback })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={priorityLoading}
            />
            {priorityLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
            {priorityError && <div className="text-xs text-red-500 mt-1">{priorityError}</div>}
            {!priorityLoading && !priorityError && priorityOptions.length === 0 && (
              <div className="text-xs text-gray-400 mt-1">No priorities found.</div>
            )}
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Call Feedback</label>
            <SelectField
              options={callStatusOptions}
              placeholder="Please Select Feedback"
              value={callFeedback}
              onChange={(value: any) => onChange?.({ assignTo, priority, callFeedback: value })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={callStatusLoading}
            />
            {callStatusLoading && <div className="text-xs text-gray-400 mt-1">Loading...</div>}
            {callStatusError && <div className="text-xs text-red-500 mt-1">{callStatusError}</div>}
            {!callStatusLoading && !callStatusError && callStatusOptions.length === 0 && (
              <div className="text-xs text-gray-400 mt-1">No call statuses found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPriorityCard;
