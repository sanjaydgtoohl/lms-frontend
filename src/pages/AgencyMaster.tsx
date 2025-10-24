import React from 'react';
import MainContent from '../components/layout/MainContent';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';

const AgencyMaster: React.FC = () => {
  const handleCreateAgency = () => {
    console.log('Create new agency');
    // Add your create agency logic here
  };

  const headerActions = (
    <Button
      variant="primary"
      size="sm"
      onClick={handleCreateAgency}
      className="flex items-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Create Agency</span>
    </Button>
  );

  return <MainContent title="Agency Master" headerActions={headerActions} dataType="agency" />;
};

export default AgencyMaster;
