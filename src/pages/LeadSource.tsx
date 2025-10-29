import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ActionMenu from '../components/ui/ActionMenu';
import Pagination from '../components/ui/Pagination';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { listLeadSources, deleteLeadSubSource, type LeadSourceItem } from '../services/LeadSource';
import { ROUTES } from '../constants';

const LeadSource: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LeadSourceItem[]>([]);
  const [viewItem, setViewItem] = useState<LeadSourceItem | null>(null);
  const [editItem, setEditItem] = useState<LeadSourceItem | null>(null);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = items.slice(startIndex, endIndex);

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

  const handleSaveEdit = (updated: Record<string, any>) => {
    setItems(prev => prev.map(i => (i.id === updated.id ? { ...i, ...updated } : i)));
    navigate(ROUTES.SOURCE_MASTER);
  };

  // helper to refresh list is available if needed (removed because unused)

  const handleDelete = async (item: LeadSourceItem) => {
    const confirm = window.confirm(`Delete sub-source "${item.subSource || item.id}"?`);
    if (!confirm) return;
    try {
      await deleteLeadSubSource(item.id);
      // remove locally, then optionally refresh
      setItems(prev => prev.filter(i => i.id !== item.id));
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
      {showCreate ? (
        <CreateSourceForm inline onClose={() => navigate(ROUTES.SOURCE_MASTER)} onSave={handleSaveSource} />
      ) : viewItem ? (
        <MasterView title={`View Lead Source ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Lead Source ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.SOURCE_MASTER)} onSave={handleSaveEdit} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Lead Sources</h2>
                <button onClick={handleCreate} className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"><Plus className="w-4 h-4" /><span>Create Source</span></button>
              </div>

              {error && (
                <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-[var(--border-color)]">{error}</div>
              )}
              {loading ? (
                <div className="px-6 py-6 text-sm text-[var(--text-secondary)]">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Source ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Source</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Sub-Source</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {currentData.map((item, index) => (
                        <tr key={item.id + (item.subSource || '') + index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{item.id}</td>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Lead Sources</h2>
                <button onClick={handleCreate} className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"><Plus className="w-4 h-4" /><span>Create</span></button>
              </div>
            </div>

            {currentData.map((item, index) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
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
            ))}
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
