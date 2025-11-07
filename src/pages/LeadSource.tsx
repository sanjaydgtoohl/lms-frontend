import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Pagination from '../components/ui/Pagination';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { MasterHeader, NotificationPopup } from '../components/ui';
import SearchBar from '../components/ui/SearchBar';
import Table, { type Column } from '../components/ui/Table';
import { listLeadSources, deleteLeadSubSource, updateLeadSubSource, type LeadSourceItem } from '../services/LeadSource';
import { fetchLeadSources } from '../services/CreateSourceForm';
import { ROUTES } from '../constants';

const LeadSource: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LeadSourceItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewItem, setViewItem] = useState<LeadSourceItem | null>(null);
  const [editItem, setEditItem] = useState<LeadSourceItem | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  // track deletion in-flight if needed (not used currently)

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await listLeadSources(currentPage, itemsPerPage);
        if (isMounted) {
          let mapped = resp.data;
          // If search is present, filter client-side (optional)
          if (searchQuery) {
            const _q_ls = String(searchQuery).trim().toLowerCase();
            mapped = mapped.filter((it) => (
              (String(it.id || '').toLowerCase().startsWith(_q_ls)) ||
              (String(it.source || '').toLowerCase().startsWith(_q_ls)) ||
              (String(it.subSource || '').toLowerCase().startsWith(_q_ls))
            ));
          }
          setItems(mapped);
          // When a search is active we want the footer and pagination to reflect
          // the filtered result set (client-side). Otherwise use server total if available.
          if (searchQuery) {
            setTotalItems(mapped.length);
          } else {
            setTotalItems(resp.meta?.pagination?.total || mapped.length);
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load lead sources');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentPage, searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = items;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreate = () => {
    navigate(`${ROUTES.SOURCE_MASTER}/create`);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSaveSource = (data: any) => {
    // Optimistic prepend (API create can be wired later)
    const newItem: LeadSourceItem = {
      id: `LS${String(items.length + 1).padStart(3, '0')}`,
      source: data.source,
      subSource: data.subSource,
      dateTime: new Date().toLocaleString(),
    };
    setItems(prev => [newItem, ...prev]);
    setCurrentPage(1);
    navigate(ROUTES.SOURCE_MASTER);
  };

  const handleView = (item: LeadSourceItem) => {
    navigate(`${ROUTES.SOURCE_MASTER}/${encodeURIComponent(item.id)}`);
  };

  const handleEdit = (item: LeadSourceItem) => {
    navigate(`${ROUTES.SOURCE_MASTER}/${encodeURIComponent(item.id)}/edit`);
  };

  const handleSaveEdit = async (updated: Record<string, any>) => {
    try {
      // Map UI fields to API payload
      const name = updated.subSource ?? updated.name ?? '';
      const leadSourceName = updated.source; // UI holds name
      // Resolve source id by name
      const sourceOptions = await fetchLeadSources();
      const matched = sourceOptions.find(s => s.name === leadSourceName);
      const leadSourceId = matched ? matched.id : leadSourceName; // fallback to given value
      await updateLeadSubSource(updated.id, {
        name,
        lead_source_id: leadSourceId,
        status: 1,
      });
      setItems(prev => prev.map(i => (i.id === updated.id ? { ...i, subSource: name, source: leadSourceName } : i)));
      // Show success toast then navigate back to listing after a short delay
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate(ROUTES.SOURCE_MASTER);
      }, 5000);
    } catch (e: any) {
      alert(e?.message || 'Failed to update');
      // preserve previous behavior of returning to listing on error
      navigate(ROUTES.SOURCE_MASTER);
    }
  };

  // helper to refresh list is available if needed (removed because unused)

  const handleDelete = async (item: LeadSourceItem) => {
    const confirm = window.confirm(`Delete sub-source "${item.subSource || item.id}"?`);
    if (!confirm) return;
    try {
      await deleteLeadSubSource(item.id);
      // remove locally, then optionally refresh
      setItems(prev => prev.filter(i => i.id !== item.id));
      // show delete success toast
      setShowDeleteToast(true);
      setTimeout(() => setShowDeleteToast(false), 3000);
      // await refreshList(); // keep commented for performance; enable if needed
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    } finally {
    }
  };

  // Sync view/edit/create state from the current URL
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
      const found = items.find(i => i.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = items.find(i => i.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    // default listing state
    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, items]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Source updated successfully"
        type="success"
      />
      <NotificationPopup
        isOpen={showDeleteToast}
        onClose={() => setShowDeleteToast(false)}
        message="Source deleted successfully"
        type="success"
        customStyle={{
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-l-4 border-red-500',
          text: 'text-red-800',
          icon: 'text-red-500'
        }}
      />
      {showCreate ? (
        <CreateSourceForm inline onClose={() => navigate(ROUTES.SOURCE_MASTER)} onSave={handleSaveSource} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} />
      ) : editItem ? (
        <MasterEdit item={editItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} onSave={handleSaveEdit} />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreate}
            createButtonLabel="Create Source"
            showBreadcrumb={true}
          />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Lead Sources</h2>
                <SearchBar 
                  placeholder="Search Lead Source" 
                  delay={300}
                  onSearch={(q: string) => { 
                    setSearchQuery(q); 
                    setCurrentPage(1); 
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

            <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'id', header: 'ID', render: (it: any) => it.id || '-' },
                { key: 'source', header: 'Source', render: (it: any) => it.source || '-' },
                { key: 'subSource', header: 'Sub-Source', render: (it: any) => it.subSource || '-' },
                { key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime ? new Date(it.dateTime).toLocaleString() : '-' },
              ] as Column<any>[])}
              onEdit={(it: any) => handleEdit(it)}
              onView={(it: any) => handleView(it)}
              onDelete={(it: any) => handleDelete(it)}
            />
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default LeadSource;
