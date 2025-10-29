import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ActionMenu from '../components/ui/ActionMenu';
import Pagination from '../components/ui/Pagination';
import CreateSourceForm from './CreateSourceForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { listLeadSources, type LeadSourceItem } from '../services/LeadSource';

const LeadSource: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LeadSourceItem[]>([]);
  const [viewItem, setViewItem] = useState<LeadSourceItem | null>(null);
  const [editItem, setEditItem] = useState<LeadSourceItem | null>(null);

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

  const handleCreate = () => setShowCreate(true);
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
    setShowCreate(false);
  };

  const handleView = (item: LeadSourceItem) => setViewItem(item);
  const handleEdit = (item: LeadSourceItem) => setEditItem(item);
  const handleSaveEdit = (updated: Record<string, any>) => {
    setItems(prev => prev.map(i => (i.id === updated.id ? { ...i, ...updated } : i)));
    setEditItem(null);
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateSourceForm inline onClose={() => setShowCreate(false)} onSave={handleSaveSource} />
      ) : viewItem ? (
        <MasterView title={`View Lead Source ${viewItem.id}`} item={viewItem} onClose={() => setViewItem(null)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Lead Source ${editItem.id}`} item={editItem} onClose={() => setEditItem(null)} onSave={handleSaveEdit} />
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
                              onDelete={() => console.log('Delete lead source:', item.id)}
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
                    onDelete={() => console.log('Delete lead source:', item.id)}
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
