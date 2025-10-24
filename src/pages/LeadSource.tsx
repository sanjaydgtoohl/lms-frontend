import React from 'react';
import MainContent from '../components/layout/MainContent';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';

const LeadSource: React.FC = () => {
  const handleCreateSource = () => {
    console.log('Create new lead source');
    // Add your create source logic here
  };

  const headerActions = (
    <Button
      variant="primary"
      size="sm"
      onClick={handleCreateSource}
      className="flex items-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Create Source</span>
    </Button>
  );

  return <MainContent title="Lead Sources" headerActions={headerActions} dataType="leadSource" />;
};

export default LeadSource;
