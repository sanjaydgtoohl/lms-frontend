import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft } from 'lucide-react';
import ActionMenu from '../components/ui/ActionMenu';
import Pagination from '../components/ui/Pagination';
import { motion } from 'framer-motion';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import {
  listDesignations,
  deleteDesignation,
  updateDesignation,
  createDesignation,
  type Designation as ApiDesignation,
} from '../services/DesignationMaster';

interface Designation {
  id: string;
  name: string;
  dateTime: string;
}

// Inline CreateDesignationForm component
const CreateDesignationForm: React.FC<{
  onClose: () => void;
  onSave?: (data: any) => void;
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Designation Name is required');
      return;
    }
    if (onSave) {
      onSave({ name, dateTime: formatDateTime(new Date()) });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Designation</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-black"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="p-6 bg-[#F9FAFB]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Designation Name *</label>
            <input
              name="designationName"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter designation name"
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
            >
              Save Designation
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const DesignationMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const itemsPerPage = 10;

  // Store designations in state fetched from API
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = designations.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateDesignation = () => {
    navigate(`${ROUTES.DESIGNATION_MASTER}/create`);
  };

  const handleSaveDesignation = (data: any) => {
    // create on server then refresh list
    (async () => {
      try {
        await createDesignation({ name: data.name });
        await refresh();
        setCurrentPage(1);
      } catch (e: any) {
        alert(e?.message || 'Failed to create designation');
      }
    })();
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.DESIGNATION_MASTER}/${encodeURIComponent(id)}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.DESIGNATION_MASTER}/${encodeURIComponent(id)}`);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Delete this designation?');
    if (!confirm) return;
    try {
      await deleteDesignation(id);
      setDesignations(prev => prev.filter(d => d.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [viewItem, setViewItem] = useState<Designation | null>(null);
  const [editItem, setEditItem] = useState<Designation | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDesignations();
      const mapped: Designation[] = (data as ApiDesignation[]).map((it) => ({
        id: String(it.id),
        name: it.name,
        dateTime: it.created_at || '',
      }));
      setDesignations(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load designations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

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
      const found = designations.find(d => d.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = designations.find(d => d.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, designations]);

  const handleSaveEditedDesignation = (updated: Record<string, any>) => {
    (async () => {
      try {
        await updateDesignation(updated.id, { name: updated.name });
        setDesignations(prev => prev.map(d => (d.id === updated.id ? { ...d, name: updated.name } as Designation : d)));
      } catch (e: any) {
        alert(e?.message || 'Failed to update');
      }
    })();
  };

  const renderPagination = () => {
    return (
      <Pagination
        currentPage={currentPage}
        totalItems={designations.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateDesignationForm onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} onSave={handleSaveDesignation} />
      ) : viewItem ? (
        <MasterView title={`View Designation ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} />
      ) : editItem ? (
  <MasterEdit title={`Edit Designation ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} onSave={handleSaveEditedDesignation} hideSource nameLabel="Designation" />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
                <button
                  onClick={handleCreateDesignation}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Designation</span>
                </button>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Designation ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Designation Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {currentData.map((item, index) => (
                      <tr 
                        key={item.id + item.name}
                        className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {item.dateTime}
                        </td>
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
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
                <button
                  onClick={handleCreateDesignation}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              </div>
            </div>
            
            {currentData.map((item, index) => (
                <div 
                key={item.id + item.name}
                className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4 hover:shadow-lg transition-all duration-200"
              >
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
                    <span className="text-sm text-[var(--text-secondary)]">Designation Name:</span>
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

export default DesignationMaster;