import React, { useState, useEffect } from 'react';
import ActionMenu from '../components/ui/ActionMenu';
import CreateIndustryForm from './CreateIndustryForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MasterHeader } from '../components/ui';
import { listIndustries, deleteIndustry, updateIndustry, type Industry as ApiIndustry } from '../services/IndustryMaster';

interface Industry {
  id: string;
  name: string;
  dateTime: string;
}

const IndustryMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const itemsPerPage = 10;

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = industries.slice(startIndex, endIndex);

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
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const [viewItem, setViewItem] = useState<Industry | null>(null);
  const [editItem, setEditItem] = useState<Industry | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listIndustries();
      const mapped: Industry[] = (data as ApiIndustry[]).map((it) => ({
        id: String(it.id),
        name: it.name,
        dateTime: it.created_at || '',
      }));
      setIndustries(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load industries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

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
        totalItems={industries.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateIndustryForm onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveIndustry} />
      ) : viewItem ? (
        <MasterView title={`View Industry ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} />
      ) : editItem ? (
  <MasterEdit title={`Edit Industry ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveEditedIndustry} hideSource nameLabel="Industry" />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreateIndustry}
            createButtonLabel="Create Industry"
          />
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Industry ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Industry Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {currentData.map((item, index) => (
                      <tr key={item.id + item.name + index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.dateTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ActionMenu
                            isLast={index >= currentData.length - 2}
                            onEdit={() => handleEdit(item.id)}
                            onView={() => handleView(item.id)}
                            onDelete={() => handleDelete(item.id)}
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
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
            </div>

            {currentData.map((item, index) => (
              <div key={item.id + item.name} className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
                  <ActionMenu
                    isLast={index === currentData.length - 1}
                    onEdit={() => handleEdit(item.id)}
                    onView={() => handleView(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Industry Name:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                    <span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default IndustryMaster;
