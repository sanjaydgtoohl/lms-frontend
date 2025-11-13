import React, { useState, useEffect } from 'react';
import MainContent from '../components/layout/MainContent';

import CreateAgencyForm from './CreateAgencyForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import type { Agency } from '../components/layout/MainContent';
import { listAgencies as fetchAgencies } from '../services/AgencyMaster';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { getItem } from '../data/masterData';
import { MasterHeader } from '../components/ui';

const AgencyMaster: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Agency | null>(null);
  const [editItem, setEditItem] = useState<Agency | null>(null);
  const [agenciesList, setAgenciesList] = useState<Agency[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateAgency = () => {
    navigate(`${ROUTES.AGENCY_MASTER}/create`);
  };

  const loadAgencies = async (p = 1) => {
    setLoadingList(true);
    try {
      const res = await fetchAgencies(p, perPage);
      // map service Agency -> MainContent Agency shape
      const mapped = (res.data || []).map((a: any) => ({
        id: String(a.id),
        agencyGroup: a.agency_group ? (a.agency_group.name || String(a.agency_group)) : '',
        agencyName: a.name || '',
        agencyType: a.agency_type || (a.type || ''),
        contactPerson: a.contact_person || '',
        dateTime: a.created_at || a.updated_at || '',
      }));
      setAgenciesList(mapped);
  // attempt to read pagination meta if present
  const total = res.meta?.pagination?.total;
  if (typeof total === 'number') setTotalItems(total);
    } catch (err) {
      // handled by service error handler
      console.error('Failed to load agencies', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSaveAgency = (data: { parent: { name: string; type: string; client: string[] }; children: Array<{ name: string; type: string; client: string[] }> }): void => {
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

  const handleSaveEdit = (updated: Record<string, unknown>): void => {
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
      // Try to load full agency data from in-memory sample data
      const fetched = getItem('agency', id);
      if (fetched) setEditItem(fetched as Agency);
      else setEditItem({ id } as Agency);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const fetched = getItem('agency', id);
      if (fetched) setViewItem(fetched as Agency);
      else setViewItem({ id } as Agency);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id]);

  // load list when on list page and when page changes
  useEffect(() => {
    if (!location.pathname.endsWith('/create') && !location.pathname.endsWith('/edit')) {
      loadAgencies(page);
    }
  }, [page, location.pathname]);



  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateAgencyForm onClose={() => navigate(ROUTES.AGENCY_MASTER)} onSave={handleSaveAgency} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.AGENCY_MASTER)} />
      ) : editItem ? (
        <MasterEdit item={editItem} onClose={() => navigate(ROUTES.AGENCY_MASTER)} onSave={handleSaveEdit} />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreateAgency}
            createButtonLabel="Create Agency"
            showBreadcrumb={true}
          />
          <MainContent<Agency>
            title="Agency Master" 
            dataType="agency" 
            onView={handleView}
            onEdit={handleEdit}
            data={agenciesList}
            loading={loadingList}
            totalItems={totalItems}
            currentPage={page}
            itemsPerPage={perPage}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default AgencyMaster;
