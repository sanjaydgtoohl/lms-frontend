import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import MasterHeader from '../../components/ui/MasterHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchBar from '../../components/ui/SearchBar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import SweetAlert from '../../utils/SweetAlert';
import Create from './Create';
import { 
  listMissCampaigns, 
  createMissCampaign, 
  deleteMissCampaign,
  getMissCampaign,
  updateMissCampaign,
  type MissCampaign 
} from '../../services/View';
import { usePermissions } from '../../context/SidebarMenuContext';

const View: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [campaigns, setCampaigns] = useState<MissCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<MissCampaign | null>(null);
  const [editItem, setEditItem] = useState<MissCampaign | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  // Image modal (soft alert) state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  const openImageModal = (url: string) => {
    setModalImageUrl(url);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImageUrl(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImageModal();
    };
    if (imageModalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imageModalOpen]);

  const filteredCampaigns = campaigns.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.brandName.toLowerCase().startsWith(q);
  });

  // When searching, recalculate pagination based on filtered results
  const totalFilteredItems = searchQuery ? filteredCampaigns.length : totalItems;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Fetch campaigns from API (without search - we do client-side filtering)
  const fetchCampaigns = async (page: number) => {
    try {
      setLoading(true);
      const response = await listMissCampaigns(page, itemsPerPage);
      setCampaigns(response.data || []);
      setTotalItems(response.meta?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => navigate(`/miss-campaign/view/${encodeURIComponent(id)}/edit`);
  const handleView = (id: string) => navigate(`/miss-campaign/view/${encodeURIComponent(id)}`);
  // open confirmation modal instead of immediate delete
  const handleDelete = (id: string, label?: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteLabel(label || id);
  };

  const handleCreate = () => navigate('/miss-campaign/create');

  const handleSave = async (data: any) => {
    try {
      const newCampaign = await createMissCampaign(data);
      setCampaigns(prev => [newCampaign, ...prev]);
      setCurrentPage(1);
      try { SweetAlert.showCreateSuccess(); } catch (_) {}
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteMissCampaign(confirmDeleteId);
      try { SweetAlert.showDeleteSuccess(); } catch (_) {}
      await fetchCampaigns(currentPage); // Refresh table from server
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      try { SweetAlert.showError((error as any)?.message || 'Failed to delete campaign'); } catch (_) {}
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

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
      // For edit mode, fetch raw data with IDs from API
      const fetchFullData = async () => {
        try {
          const fullData = await getMissCampaign(id);
          setEditItem(fullData);
        } catch (err) {
          console.error('Failed to fetch campaign for editing:', err);
          // Fallback to campaign from list
          const found = campaigns.find(c => c.id === id) || null;
          setEditItem(found);
        }
      };
      fetchFullData();
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = campaigns.find(c => c.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, campaigns]);

  // Tooltip helpers removed - tooltip functionality not currently in use

  const handleSaveEdited = async (updated: Record<string, any>) => {
    try {
      await updateMissCampaign(updated.id, updated);
      await fetchCampaigns(currentPage); // Refresh table from server
      try { SweetAlert.showUpdateSuccess(); } catch (_) {}
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  // Fetch campaigns on mount and when page changes
  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {/* SweetAlert is used for inline success/error notifications */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={`Delete campaign "${confirmDeleteLabel}"?`}
        message="This will permanently remove the campaign. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
      {showCreate ? (
        <Create inline onClose={() => navigate('/miss-campaign/view')} onSave={handleSave} />
      ) : viewItem ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col">
              <Breadcrumb />
            </div>
            <button onClick={() => navigate('/miss-campaign/view')} className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Go Back</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Miss Campaign Details</h3>
            </div>

            <div className="p-6">
              {/* Header Section */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{viewItem.brandName}</h1>
                <p className="text-lg text-[var(--text-secondary)]">{viewItem.productName}</p>
              </div>

              {/* Image Section */}
              {viewItem.proof && (
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Proof Image</h4>
                    <img 
                      src={viewItem.proof} 
                      alt="Campaign Proof" 
                      className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-[var(--text-secondary)]">Source</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{viewItem.source || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-secondary)]">Sub Source</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{viewItem.subSource || '-'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-[var(--text-secondary)]">Date & Time</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{viewItem.dateTime || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-secondary)]">ID</div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{viewItem.id}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : editItem ? (
        <Create
          inline
          mode="edit"
          initialData={editItem}
          onClose={() => navigate('/miss-campaign/view')}
          onSave={(data: any) => handleSaveEdited({ ...(data as Record<string, any>) })}
        />
      ) : (
        <>
          {hasPermission('miss-campaign.create') && (
            <MasterHeader onCreateClick={handleCreate} createButtonLabel="Create Miss Campaign" />
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Miss Campaign</h2>
              <SearchBar delay={0} placeholder="Search Miss Campaign" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </div>

            <div className="pt-0 overflow-visible">
              <Table
                data={currentData}
                startIndex={startIndex}
                loading={loading}
                desktopOnMobile={true}
                keyExtractor={(it: MissCampaign, idx: number) => `${it.id}-${idx}`}
                columns={([
                { key: 'sr', header: 'Id', render: (it: MissCampaign) => `#${it.id}` },
                { key: 'brandName', header: 'Brand Name', render: (it: MissCampaign) => it.brandName },
                { key: 'productName', header: 'Product Name', render: (it: MissCampaign) => it.productName },
                { key: 'source', header: 'Source', render: (it: MissCampaign) => it.source },
                { key: 'subSource', header: 'Sub Source', render: (it: MissCampaign) => it.subSource },
                {
                  key: 'proof',
                  header: 'Proof',
                  render: (it: MissCampaign) => (
                    <div className="flex items-center justify-center">
                      {it.proof ? (
                        <img 
                          src={it.proof} 
                          alt="Proof" 
                          className="h-16 w-16 object-cover rounded border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openImageModal(it.proof)}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  ),
                },
                { key: 'dateTime', header: 'Date & Time', render: (it: MissCampaign) => it.dateTime },
              ] as Column<MissCampaign>[])}
                onEdit={(it: MissCampaign) => handleEdit(it.id)}
                onView={(it: MissCampaign) => handleView(it.id)}
                onDelete={(it: MissCampaign) => handleDelete(it.id, it.productName || it.brandName)}
                editPermissionSlug="miss-campaign.edit"
                viewPermissionSlug="miss-campaign.view"
                deletePermissionSlug="miss-campaign.delete"
              />
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalFilteredItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          {/* Tooltip popup for full proof text */}
          {/* Image modal (soft alert) */}
          {imageModalOpen && modalImageUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={closeImageModal}
            >
              <div
                className="relative bg-white rounded-lg shadow-lg p-4 max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={modalImageUrl}
                  alt="Proof full"
                  className="max-w-[84vw] max-h-[84vh] object-contain"
                />
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Close"
                  onClick={closeImageModal}
                  onKeyDown={(e) => { if (e.key === 'Enter') closeImageModal(); }}
                  className="absolute top-3 right-3 bg-white/95 hover:bg-white rounded-full p-1 border z-50 cursor-pointer flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default View;