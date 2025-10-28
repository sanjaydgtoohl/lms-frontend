import React, { useState, useEffect } from 'react';
import MainContent from '../components/layout/MainContent';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import CreateAgencyForm from './CreateAgencyForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import type { Agency } from '../components/layout/MainContent';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

const AgencyMaster: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Agency | null>(null);
  const [editItem, setEditItem] = useState<Agency | null>(null);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateAgency = () => {
    navigate(`${ROUTES.AGENCY_MASTER}/create`);
  };

  const handleSaveAgency = (data: any) => {
    // For now just log the saved data. Integrate with API/store as needed.
    console.log('Saved agencies payload:', data);
    setShowCreate(false);
  };

  const handleView = (item: Agency) => {
    navigate(`${ROUTES.AGENCY_MASTER}/${encodeURIComponent(item.id)}`);
  };

  const handleEdit = (item: Agency) => {
    navigate(`${ROUTES.AGENCY_MASTER}/${encodeURIComponent(item.id)}/edit`);
  };

  const handleSaveEdit = (updated: Record<string, any>) => {
    // Update in API/store as needed
    console.log('Save edited agency:', updated);
    navigate(ROUTES.AGENCY_MASTER);
  };

  // Sync UI state with route params
  useEffect(() => {
    const rawId = params.id;
    const id = rawId ? decodeURIComponent(rawId) : undefined;

    if (location.pathname.endsWith('/create')) {
      setShowCreate(true);
      setViewItem(null);
      setEditItem(null);
      return;
    }

    if (location.pathname.endsWith('/edit') && id) {
      // find the agency in whatever source; for now we set a placeholder
      setEditItem({ id } as Agency);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      setViewItem({ id } as Agency);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id]);

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
        <CreateAgencyForm inline onClose={() => navigate(ROUTES.AGENCY_MASTER)} onSave={handleSaveAgency} />
      ) : viewItem ? (
        <MasterView title={`View Agency ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.AGENCY_MASTER)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Agency ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.AGENCY_MASTER)} onSave={handleSaveEdit} />
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
