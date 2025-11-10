import React, { useState, useEffect } from 'react';
import Table, { type Column } from '../components/ui/Table';
import CreateIndustryForm from './CreateIndustryForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MasterHeader, NotificationPopup } from '../components/ui';
import SearchBar from '../components/ui/SearchBar';
import { listIndustries, deleteIndustry, updateIndustry, type Industry as ApiIndustry } from '../services/IndustryMaster';

interface Industry {
  id: string;
  name: string;
  dateTime: string;
}

const IndustryMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const itemsPerPage = 10;

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend pagination: no client-side filtering for now
  const currentData = industries;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateIndustry = () => navigate(`${ROUTES.INDUSTRY_MASTER}/create`);

  const handleSaveIndustry = () => {
    // After create form closes, refresh the list from API
    refresh();
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.INDUSTRY_MASTER}/${encodeURIComponent(id)}/edit`);
  };
  const handleView = (id: string) => {
    navigate(`${ROUTES.INDUSTRY_MASTER}/${encodeURIComponent(id)}`);
  };
  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Delete this industry?');
    if (!confirm) return;
    try {
      await deleteIndustry(id);
      setIndustries(prev => prev.filter(i => i.id !== id));
      setShowDeleteToast(true);
      setTimeout(() => setShowDeleteToast(false), 3000);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [viewItem, setViewItem] = useState<Industry | null>(null);
  const [editItem, setEditItem] = useState<Industry | null>(null);

  const refresh = async (page = currentPage, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      // For now, search is not sent to backend, only pagination
      const resp = await listIndustries(page, itemsPerPage);
      let mapped: Industry[] = (resp.data || []).map((it: ApiIndustry) => ({
        id: String(it.id),
        name: it.name,
        dateTime: it.created_at || '',
      }));
      // If search is present, filter client-side
      if (search) {
        const _q_ind = String(search).trim().toLowerCase();
        mapped = mapped.filter(i => (i.name || '').toLowerCase().startsWith(_q_ind));
        // When searching, set totalItems to filtered length
        setTotalItems(mapped.length);
      } else {
        // When not searching, use server total or full length
        setTotalItems(resp.meta?.pagination?.total || mapped.length);
      }
      setIndustries(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load industries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(currentPage, searchQuery); }, [currentPage, searchQuery]);

  // sync UI with route
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
      const found = industries.find(i => i.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = industries.find(i => i.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, industries]);

  const handleSaveEditedIndustry = async (updated: Record<string, any>) => {
    try {
      await updateIndustry(updated.id, { name: updated.name });
      setIndustries(prev => prev.map(i => (i.id === updated.id ? { ...i, name: updated.name } as Industry : i)));
    } catch (e: any) {
      alert(e?.message || 'Failed to update');
    }
  };

  const renderPagination = () => {
    return (
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <NotificationPopup
        isOpen={showDeleteToast}
        onClose={() => setShowDeleteToast(false)}
        message="Industry deleted successfully"
        type="success"
        customStyle={{
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-l-4 border-red-500',
          text: 'text-red-800',
          icon: 'text-red-500'
        }}
      />
      {showCreate ? (
        <CreateIndustryForm onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveIndustry} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} />
      ) : editItem ? (
  <MasterEdit item={editItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveEditedIndustry} hideSource nameLabel="Industry" />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreateIndustry}
            createButtonLabel="Create Industry"
            showBreadcrumb={true}
          />
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Industry Master</h2>
                <SearchBar 
                  placeholder="Search Industry" 
                  delay={300}
                  onSearch={(q: string) => { 
                    setSearchQuery(q); 
                    setCurrentPage(1); 
                    refresh(1, q); 
                  }} 
                />
              </div>
            </div>

            {error && (
              <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="p-4 overflow-visible">
              <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'id', header: 'ID', render: (it: any) => it.id || '-' },
                { key: 'name', header: 'Industry Name', render: (it: any) => it.name || '-' },
                { key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime ? new Date(it.dateTime).toLocaleString() : '-' },
              ] as Column<any>[])}
              onEdit={(it: any) => handleEdit(it.id)}
              onView={(it: any) => handleView(it.id)}
              onDelete={(it: any) => handleDelete(it.id)}
            />
            </div>
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default IndustryMaster;
