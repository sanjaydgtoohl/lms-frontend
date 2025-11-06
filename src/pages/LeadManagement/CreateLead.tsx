import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import CreateLeadForm from '../../components/forms/CreateLeadForm';

const CreateLead: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      // TODO: Implement API call
      console.log('Form data:', data);
      navigate("/lead-management/all-leads");
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterCreateHeader 
        title="Create Lead" 
        onClose={() => navigate("/lead-management/all-leads")} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
        <CreateLeadForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default CreateLead;