import React, { useState } from 'react';
import LeadManagementSection from '../../components/forms/CreateLead/LeadManagementSection';
import ContactPersonsCard from '../../components/forms/CreateLead/ContactPersonsCard';
import AssignPriorityCard from '../../components/forms/CreateLead/AssignPriorityCard';
import CommentSection from '../../components/forms/CreateLead/CommentSection';
import { MasterFormHeader, Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

const CreateLead: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'brand'|'agency'>('brand');
  const navigate = useNavigate();

  const handleSave = () => {
    // TODO: Collect form state and submit to API
    navigate('/lead-management/all-leads');
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full">
      <MasterFormHeader onBack={() => navigate(-1)} title="Create Lead" />

      <div>
        <LeadManagementSection selectedOption={selectedOption} onSelectOption={setSelectedOption} />

        <ContactPersonsCard />

        <AssignPriorityCard />

        <CommentSection />

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateLead;
