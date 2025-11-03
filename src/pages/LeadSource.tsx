import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ActionMenu from '../components/ui/ActionMenu';
import { Loader2 } from 'lucide-react';
import Pagination from '../components/ui/Pagination';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { MasterHeader, NotificationPopup } from '../components/ui';
import SearchBar from '../components/ui/SearchBar';
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
        const data = await listLeadSources();
        if (isMounted) setItems(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load lead sources');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const _q_ls = String(searchQuery || '').trim().toLowerCase();
  const filtered = _q_ls
    ? items.filter((it) => (
        (String(it.id || '').toLowerCase().startsWith(_q_ls)) ||
        (String(it.source || '').toLowerCase().startsWith(_q_ls)) ||
        (String(it.subSource || '').toLowerCase().startsWith(_q_ls))
      ))
    : items;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filtered.slice(startIndex, endIndex);

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
        <MasterView title={`View Lead Source ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} />
      ) : editItem ? (
        <MasterEdit item={editItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} onSave={handleSaveEdit} />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreate}
            createButtonLabel="Create Source"
          />
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Lead Sources</h2>
                      <SearchBar placeholder="Search Lead Source" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
                </div>
              </div>

              {error && (
                <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-[var(--border-color)]">{error}</div>
              )}
              {loading ? (
                <div className="px-6 py-12 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Sr. No.</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Source</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Sub-Source</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {currentData.map((item, index) => (
                        <tr key={item.id + (item.subSource || '') + index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{item.source}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{item.subSource || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.dateTime || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <ActionMenu
                              isLast={index >= currentData.length - 2}
                              onEdit={() => handleEdit(item)}
                              onView={() => handleView(item)}
                              onDelete={() => handleDelete(item)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Lead Sources</h2>
            </div>
            {loading ? (
              <div className="px-4 py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              currentData.map((item, index) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className="text-sm text-[var(--text-secondary)]">Sr. No.:</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</span>
                    </div>
                    <ActionMenu
                      isLast={index === currentData.length - 1}
                      onEdit={() => handleEdit(item)}
                      onView={() => handleView(item)}
                      onDelete={() => handleDelete(item)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Source:</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Sub-Source:</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{item.subSource || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                      <span className="text-sm text-[var(--text-secondary)]">{item.dateTime || '-'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default LeadSource;
