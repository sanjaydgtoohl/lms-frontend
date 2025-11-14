import React from 'react';
import SelectField from '../../ui/SelectField';

import { CALL_STATUS_OPTIONS } from '../../../constants';

interface AssignPriorityCardProps {
  assignTo?: string;
  priority?: 'high' | 'medium' | 'low';
  callFeedback?: string;
  onChange?: (values: { assignTo?: string; priority?: 'high' | 'medium' | 'low'; callFeedback?: string }) => void;
}

const AssignPriorityCard: React.FC<AssignPriorityCardProps> = ({
  assignTo,
  priority,
  callFeedback,
  onChange
}) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
      <div className="p-6 bg-[#F9FAFB]">
        <h3 className="text-base font-semibold text-[#344054] mb-4">Assignment & Priority</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Assign To</label>
            <SelectField 
              options={['Sales Man 1', 'Sales Man 2', 'Sales Man 3']} 
              placeholder="Select Team Member" 
              value={assignTo}
              onChange={(value) => onChange?.({ assignTo: value, priority, callFeedback })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Priority</label>
            <SelectField 
              options={[
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' }
              ]} 
              placeholder="Select Priority" 
              value={priority}
              onChange={(value) => onChange?.({ assignTo, priority: value as 'high' | 'medium' | 'low', callFeedback })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Call Feedback</label>
            <SelectField
              options={[...CALL_STATUS_OPTIONS]}
              placeholder="Please Select Feedback"
              value={callFeedback}
              onChange={(value: any) => onChange?.({ assignTo, priority, callFeedback: value })}
              inputClassName="px-3 py-2 rounded-lg bg-white text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPriorityCard;
