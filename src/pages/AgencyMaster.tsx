import React, { useState } from 'react';
import MainContent from '../components/layout/MainContent';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import CreateAgencyForm from './CreateAgencyForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import type { Agency } from '../components/layout/MainContent';

const AgencyMaster: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Agency | null>(null);
  const [editItem, setEditItem] = useState<Agency | null>(null);

  const handleCreateAgency = () => {
    setShowCreate(true);
  };

  const handleSaveAgency = (data: any) => {
    // For now just log the saved data. Integrate with API/store as needed.
    console.log('Saved agencies payload:', data);
    setShowCreate(false);
  };

  const handleView = (item: Agency) => {
    setViewItem(item);
  };

  const handleEdit = (item: Agency) => {
    setEditItem(item);
  };

  const handleSaveEdit = (updated: Record<string, any>) => {
    // Update in API/store as needed
    console.log('Save edited agency:', updated);
    setEditItem(null);
  };

  const headerActions = (
    <Button
      variant="master"
      size="sm"
      onClick={handleCreateAgency}
      className="flex items-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Create Agency</span>
    </Button>
  );

  return (
    <>
      {showCreate ? (
        <CreateAgencyForm inline onClose={() => setShowCreate(false)} onSave={handleSaveAgency} />
      ) : viewItem ? (
        <MasterView title={`View Agency ${viewItem.id}`} item={viewItem} onClose={() => setViewItem(null)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Agency ${editItem.id}`} item={editItem} onClose={() => setEditItem(null)} onSave={handleSaveEdit} />
      ) : (
        <MainContent<Agency>
          title="Agency Master" 
          headerActions={headerActions} 
          dataType="agency" 
          onView={handleView}
          onEdit={handleEdit}
        />
      )}
    </>
  );
};

export default AgencyMaster;
