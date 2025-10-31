import React, { useState } from 'react';
import MainContent from '../components/layout/MainContent';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import type { LeadSource as ILeadSource } from '../components/layout/MainContent';

const LeadSource: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<ILeadSource | null>(null);
  const [editItem, setEditItem] = useState<ILeadSource | null>(null);

  const handleCreateSource = () => {
    setShowCreate(true);
  };

  const handleSaveSource = (data: any) => {
    // For now we simply log the saved source. If the list is local, prepend here.
    console.log('Saved source:', data);
    // Optionally update local list state here.
    setShowCreate(false);
  };

  const handleView = (item: ILeadSource) => {
    setViewItem(item);
  };

  const handleEdit = (item: ILeadSource) => {
    setEditItem(item);
  };

  const handleSaveEdit = (updated: Record<string, any>) => {
    // Update in API/store as needed
    console.log('Save edited source:', updated);
    setEditItem(null);
  };

  const headerActions = (
    <Button
      variant="master"
      size="sm"
      onClick={handleCreateSource}
      className="flex items-center space-x-2"
    >
      <Plus className="w-4 h-4" />
      <span>Create Source</span>
    </Button>
  );

  return (
    <div className="flex-1 pt-0 px-6 pb-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateSourceForm inline onClose={() => setShowCreate(false)} onSave={handleSaveSource} />
      ) : viewItem ? (
        <MasterView title={`View Lead Source ${viewItem.id}`} item={viewItem} onClose={() => setViewItem(null)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Lead Source ${editItem.id}`} item={editItem} onClose={() => setEditItem(null)} onSave={handleSaveEdit} />
      ) : (
        <MainContent<ILeadSource>
          title="Lead Sources" 
          headerActions={headerActions} 
          dataType="leadSource"
          onView={handleView}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default LeadSource;
