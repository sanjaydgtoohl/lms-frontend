import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Pagination from '../components/ui/Pagination';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { MasterHeader, NotificationPopup } from '../components/ui';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SearchBar from '../components/ui/SearchBar';
import Table, { type Column } from '../components/ui/Table';
import { listLeadSources, deleteLeadSubSource, updateLeadSubSource, type LeadSourceItem } from '../services/LeadSource';
import { fetchLeadSources } from '../services/CreateSourceForm';
import { ROUTES } from '../constants';
import { usePermissions } from '../context/SidebarMenuContext';

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
  const [successMessage, setSuccessMessage] = useState('Source updated successfully');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessageToast, setErrorMessageToast] = useState('');
  // track deletion in-flight if needed (not used currently)

  const { hasPermission } = usePermissions();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async (page = currentPage, search = searchQuery) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await listLeadSources(page, itemsPerPage);
        if (!isMounted) return;
        let mapped = resp.data;
        // If search is present, filter client-side (optional)
        if (search) {
          const _q_ls = String(search).trim().toLowerCase();
          mapped = mapped.filter((it) => (
            (String(it.id || '').toLowerCase().startsWith(_q_ls)) ||
            (String(it.source || '').toLowerCase().startsWith(_q_ls)) ||
            (String(it.subSource || '').toLowerCase().startsWith(_q_ls))
          ));
        }
        setItems(mapped);
        // When a search is active we want the footer and pagination to reflect
        // the filtered result set (client-side). Otherwise use server total if available.
        if (search) {
          setTotalItems(mapped.length);
        } else {
          setTotalItems(resp.meta?.pagination?.total || mapped.length);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load lead sources');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    // Expose refresh function by assigning to a stable name in outer scope via closure
    (async () => { await fetchData(); })();
    return () => { isMounted = false; };
  }, [currentPage, searchQuery]);

  // Helper so other handlers can reload the list after actions
  const refresh = async (page = currentPage, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listLeadSources(page, itemsPerPage);
      let mapped = resp.data;
      if (search) {
        const _q_ls = String(search).trim().toLowerCase();
        mapped = mapped.filter((it) => (
          (String(it.id || '').toLowerCase().startsWith(_q_ls)) ||
          (String(it.source || '').toLowerCase().startsWith(_q_ls)) ||
          (String(it.subSource || '').toLowerCase().startsWith(_q_ls))
        ));
        setTotalItems(mapped.length);
      } else {
        setTotalItems(resp.meta?.pagination?.total || mapped.length);
      }
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lead sources');
    } finally {
      setLoading(false);
    }
  };

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
      dateTime: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
    setCurrentPage(1);
    // Show create success popup, then navigate and reload to refresh listing
    setSuccessMessage('Source created successfully');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      navigate(ROUTES.SOURCE_MASTER);
      // Force reload to ensure fresh data
      window.location.reload();
    }, 1800);
  };

  const handleView = (item: LeadSourceItem) => {
    navigate(`${ROUTES.SOURCE_MASTER}/${encodeURIComponent(item.id)}`);
  };

  const handleEdit = (item: LeadSourceItem) => {
    navigate(`${ROUTES.SOURCE_MASTER}/${encodeURIComponent(item.id)}/edit`);
  };

  const handleSaveEdit = async (updated: Record<string, any>) => {
    // Let MasterEdit handle errors inline by returning a promise
    return (async () => {
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
      // Refresh the list from server so table shows latest data
      await refresh();
      // Show success toast and navigate back to listing immediately
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 1800);
      navigate(ROUTES.SOURCE_MASTER);
    })();
  };

  // helper to refresh list is available if needed (removed because unused)

  // open confirmation modal instead of browser confirm
  const handleDelete = (item: LeadSourceItem) => {
    setConfirmDeleteId(item.id);
    setConfirmDeleteLabel(item.subSource || item.id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteLeadSubSource(confirmDeleteId);
      // Refetch the lead sources list after delete
      await refresh();
    } catch (e: any) {
      setErrorMessageToast(e?.message || 'Failed to delete');
      setShowErrorToast(true);
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
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
        message={successMessage}
        type="success"
      />
      {/* Delete success popup removed to avoid showing success toast after delete */}
      <NotificationPopup
        isOpen={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={errorMessageToast}
        type="error"
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={`Delete sub-source "${confirmDeleteLabel}"?`}
        message="This will permanently remove the sub-source. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
      {showCreate ? (
        <CreateSourceForm
          inline
          onClose={() => {
            navigate(ROUTES.SOURCE_MASTER);
            window.location.reload();
          }}
          onSave={(data: any) => {
            handleSaveSource(data);
          }}
        />
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
            showCreateButton={hasPermission('source.create')}
          />
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Lead Sources</h2>
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

            <div className="pt-0 overflow-visible">
              <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              desktopOnMobile={true}
              keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Id', render: (it: any) => `#${it.id}` },
                { key: 'source', header: 'Source', render: (it: any) => it.source || '-' },
                { key: 'subSource', header: 'Sub-Source', render: (it: any) => it.subSource || '-' },
                { key: 'dateTime', header: 'Date & Time', render: (it: any) => {
                    if (!it.dateTime) return '-';
                    const d = new Date(it.dateTime);
                    return isNaN(d.getTime()) ? String(it.dateTime) : d.toLocaleString();
                  }
                },
              ] as Column<any>[])}
              onEdit={(it: any) => handleEdit(it)}
              onView={(it: any) => handleView(it)}
              onDelete={(it: any) => handleDelete(it)}
              editPermissionSlug="source.edit"
              viewPermissionSlug="source.view"
              deletePermissionSlug="source.delete"
            />
            </div>
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
