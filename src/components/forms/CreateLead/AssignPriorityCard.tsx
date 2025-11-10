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
    <div className="bg-white border border-[#E6E8EC] rounded-2xl shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Assign To</label>
          <SelectField 
            options={['Sales Man 1', 'Sales Man 2', 'Sales Man 3']} 
            placeholder="Select Team Member" 
            value={assignTo}
            onChange={(value) => onChange?.({ assignTo: value, priority, callFeedback })}
            inputClassName="h-11" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Priority</label>
          <SelectField 
            options={[
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' }
            ]} 
            placeholder="Select Priority" 
            value={priority}
            onChange={(value) => onChange?.({ assignTo, priority: value as 'high' | 'medium' | 'low', callFeedback })}
            inputClassName="h-11" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Call Feedback</label>
          <SelectField
            options={[...CALL_STATUS_OPTIONS]}
            placeholder="Please Select Feedback"
            value={callFeedback}
            onChange={(value: any) => onChange?.({ assignTo, priority, callFeedback: value })}
            inputClassName="h-11"
          />
        </div>
      </div>
    </div>
  );
};

export default AssignPriorityCard;
