import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import { ROUTES } from '../../constants';

const EditLead: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterCreateHeader 
        title="Edit Lead" 
        onClose={() => navigate(ROUTES.LEAD_MANAGEMENT)} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
        {/* Form will be added here */}
        <div className="text-center text-gray-500">
          Lead edit form will be implemented here
        </div>
      </div>
    </div>
  );
};

export default EditLead;