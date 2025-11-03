import React, { useState, useEffect } from 'react';
import ActionMenu from '../components/ui/ActionMenu';
import Pagination from '../components/ui/Pagination';
import { motion } from 'framer-motion';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MasterHeader, MasterFormHeader, NotificationPopup } from '../components/ui';
import SearchBar from '../components/ui/SearchBar';
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
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Designation Name is required');
      return;
    }
    try {
      const res: any = onSave ? (onSave as any)({ name, dateTime: formatDateTime(new Date()) }) : null;
      if (res && typeof res.then === 'function') await res;
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
        window.location.reload();
      }, 5000);
    } catch (err) {
      // show server validation messages when available
      const e: any = err;
      if (e && e.responseData) {
        // try common shapes: errors, details, message
        const resp = e.responseData;
        const details = resp.errors || resp.details || resp.data || resp;
        try {
          setError(typeof details === 'string' ? details : JSON.stringify(details));
        } catch (_) {
          setError(resp.message || 'Validation failed');
        }
      } else {
        setError((err as any)?.message || 'Failed to create designation');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <MasterFormHeader onBack={onClose} title="Create Designation" />
      <NotificationPopup
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        message="Designation created successfully"
        type="success"
      />
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 bg-[#F9FAFB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Designation Name <span className="text-red-500">*</span></label>
              <input
                name="designationName"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Please Enter Designation Name"
              />
              {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const DesignationMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const itemsPerPage = 10;

  // Store designations in state fetched from API
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // totalPages calculated but not used directly
  const [searchQuery, setSearchQuery] = useState('');

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // instant prefix search (case-insensitive) on designation name
  const _q_des = String(searchQuery || '').trim().toLowerCase();
  const filtered = _q_des ? designations.filter(d => (d.name || '').toLowerCase().startsWith(_q_des)) : designations;
  const currentData = filtered.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateDesignation = () => {
    navigate(`${ROUTES.DESIGNATION_MASTER}/create`);
  };

  const handleSaveDesignation = (data: any) => {
    // create on server then refresh list
    return (async () => {
      try {
        // API expects `title` for designation payload (see Postman traces)
  await createDesignation({ title: data.name } as any);
        await refresh();
        setCurrentPage(1);
      } catch (e: any) {
        alert(e?.message || 'Failed to create designation');
        throw e;
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
      setShowDeleteToast(true);
      setTimeout(() => setShowDeleteToast(false), 3000);
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
    return (async () => {
      try {
        // API expects `title` for update payload
  await updateDesignation(updated.id, { title: updated.name } as any);
        setDesignations(prev => prev.map(d => (d.id === updated.id ? { ...d, name: updated.name } as Designation : d)));
      } catch (e: any) {
        alert(e?.message || 'Failed to update');
        throw e;
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
      <NotificationPopup
        isOpen={showDeleteToast}
        onClose={() => setShowDeleteToast(false)}
        message="Designation deleted successfully"
        type="success"
        customStyle={{
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-l-4 border-red-500',
          text: 'text-red-800',
          icon: 'text-red-500'
        }}
      />
      {showCreate ? (
        <CreateDesignationForm onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} onSave={handleSaveDesignation} />
      ) : viewItem ? (
        <MasterView title={`View Designation ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} />
      ) : editItem ? (
  <MasterEdit item={editItem} onClose={() => navigate(ROUTES.DESIGNATION_MASTER)} onSave={handleSaveEditedDesignation} hideSource nameLabel="Designation" />
      ) : (
        <>
          {/* Desktop Table View */}
          <MasterHeader
            onCreateClick={handleCreateDesignation}
            createButtonLabel="Create Designation"
          />
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] overflow-hidden">
              {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
                      <SearchBar placeholder="Search Designation" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
                    </div>
                  </div>
              
              {/* Table */}
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Designation Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {currentData.map((item, index) => (
                      <tr 
                        key={item.id + item.name}
                        className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</td>
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
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Designation Master</h2>
            </div>
            {loading ? (
              <div className="px-4 py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {currentData.map((item, index) => (
                <div 
                key={item.id + item.name}
                className="bg-white rounded-2xl shadow-md border border-[var(--border-color)] p-4 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="text-sm text-[var(--text-secondary)]">Sr. No.:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</span>
                  </div>
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
              </>
            )}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default DesignationMaster;