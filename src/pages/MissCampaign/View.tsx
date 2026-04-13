import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  deleteMissCampaign,
  getMissCampaign,
  type MissCampaign
} from '../../services/View';
import { createMissCampaign, updateMissCampaignWithForm } from '../../services/Create';
import { apiClient } from '../../utils/apiClient';
import { usePermissions } from '../../hooks/SidebarMenuHooks';
import { IoIosArrowBack } from 'react-icons/io';
import TableHeader from '../../components/ui/TableHeader';

const View: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [campaigns, setCampaigns] = useState<MissCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [industryOptions, setIndustryOptions] = useState<{ value: string; label: string }[]>([]);
  const [mediaTypeOptions, setMediaTypeOptions] = useState<{ value: string; label: string }[]>([]);
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
    const brand = (c.brandName || '').toLowerCase();
    const product = (c.productName || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    if (q && !brand.startsWith(q) && !product.includes(q)) {
      return false;
    }

    const industryValue = String(c.industry ?? '').toLowerCase();
    const sourceValue = String(c.source ?? '').toLowerCase();
    const mediaTypeValue = String(c.mediaType ?? '').toLowerCase();

    if (activeFilters.industry && industryValue !== activeFilters.industry.toLowerCase()) return false;
    if (activeFilters.source && sourceValue !== activeFilters.source.toLowerCase()) return false;
    if (activeFilters.mediaType && mediaTypeValue !== activeFilters.mediaType.toLowerCase()) return false;

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  // When searching or filtering, recalculate pagination based on filtered results
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const totalFilteredItems = searchQuery || hasActiveFilters ? filteredCampaigns.length : totalItems;

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

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await apiClient.get<any[]>('/industries/list');
        const industries = Array.isArray(response.data) ? response.data : [];
        const options = industries.map((industry: any) => {
          const display = industry.name ?? industry.label ?? industry.value ?? industry;
          return {
            value: String(display),
            label: String(display),
          };
        });
        setIndustryOptions(options);
      } catch (error) {
        console.error('Failed to fetch industries:', error);
        setIndustryOptions([]);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    const fetchMediaTypes = async () => {
      try {
        const response = await apiClient.get<any[]>('/media-types');
        const mediaTypes = Array.isArray(response.data) ? response.data : [];
        const options = mediaTypes.map((item: any) => {
          const display = item.name ?? item.label ?? item.type ?? item.value ?? item;
          return {
            value: String(display),
            label: String(display),
          };
        });
        setMediaTypeOptions(options);
      } catch (error) {
        console.error('Failed to fetch media types:', error);
        setMediaTypeOptions([]);
      }
    };
    fetchMediaTypes();
  }, []);

  const handleEdit = (id: string) => navigate(`/pre-lead/view/${encodeURIComponent(id)}/edit`);
  const handleView = (id: string) => navigate(`/pre-lead/view/${encodeURIComponent(id)}`);
  // open confirmation modal instead of immediate delete
  const handleDelete = (id: string, label?: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteLabel(label || id);
  };

  const handleCreate = () => navigate('/pre-lead/create');

  const handleSave = async () => {
    try {
      setCurrentPage(1);
      await fetchCampaigns(1);
      SweetAlert.showCreateSuccess();
    } catch (error) {
      console.error('Failed to refresh campaigns:', error);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteMissCampaign(confirmDeleteId);
      try { SweetAlert.showDeleteSuccess(); } catch {
        //no need to action
      }
      await fetchCampaigns(currentPage); // Refresh table from server
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      try { SweetAlert.showError((error as any)?.message || 'Failed to delete campaign'); } catch {
        // no need to action
      }
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

  const handleSaveEdited = async () => {
    try {
      await fetchCampaigns(currentPage);
      SweetAlert.showUpdateSuccess();
    } catch (error) {
      console.error('Failed to refresh campaigns:', error);
    }
  };

  // Fetch campaigns on mount and when page changes
  useEffect(() => {
    fetchCampaigns(currentPage);
  }, [currentPage]);

  // Listen for external updates (create/edit from other routes) and refresh list
  useEffect(() => {
    const onExternalUpdate = () => {
      // go to first page and refresh from server
      setCurrentPage(1);
      fetchCampaigns(1);
    };

    window.addEventListener('missCampaigns:update', onExternalUpdate);
    return () => window.removeEventListener('missCampaigns:update', onExternalUpdate);
  }, []);

  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Get unique values for filter options
  const getUniqueValues = (key: keyof MissCampaign) => {
    const values = campaigns
      .map(c => c[key])
      .filter((value): value is string => value !== null && value !== undefined && value !== '')
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .sort();
    return values;
  };

  const filterOptions = [
    {
      key: 'industry',
      label: 'Industry',
      options: industryOptions.length > 0
        ? industryOptions
        : getUniqueValues('industry').map(value => ({ value, label: value }))
    },
    {
      key: 'source',
      label: 'Source',
      options: getUniqueValues('source').map(value => ({
        value,
        label: value
      }))
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      options: mediaTypeOptions.length > 0 ? mediaTypeOptions : getUniqueValues('mediaType').map(value => ({ value, label: value }))
    }
  ].filter(option => option.options.length > 0); // Only show filters that have options

  // If navigated back with a refresh flag in location.state, refresh and clear state
  useEffect(() => {
    const s = (location.state as any) || {};
    if (s.refreshedAt) {
      setCurrentPage(1);
      fetchCampaigns(1);
      // clear the navigation state so this runs only once
      try {
        navigate(location.pathname, { replace: true, state: {} });
      } catch {
        // no need to action
      }
    }
  }, [location.state, location.pathname, navigate]); // ✅ added location.pathname

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="flex-1 w-full max-w-full overflow-x-hidden h-full">
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
        <Create inline onClose={() => navigate('/pre-lead/view')} onSave={handleSave} />
      ) : viewItem ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col">
              <Breadcrumb />
            </div>
            <button onClick={() => navigate('/pre-lead/view')} className="flex items-center space-x-2 btn-primary text-white px-3 py-1 rounded-lg">
              <IoIosArrowBack className="w-5 h-5" />
              <span className="text-sm">Go Back</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Pre Lead Details</h3>
            </div>

            <div className="px-3 py-5 md:p-6">
              {/* Header Section */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">{viewItem.brandName}</h2>
                <p className="text-lg text-gray-600">{viewItem.productName}</p>
              </div>



              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Section */}
                {viewItem.proof && (
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Proof Image</h4>
                      <img
                        src={viewItem.proof}
                        alt="Campaign Proof"
                        className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}


                {/* Details Grid */}
                <div className="xl:grid xl:grid-cols-2 gap-4">
                  <div className='flex bg-gray-100 p-4 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">ID : </div>
                    <div className="text-sm text-gray-600">{viewItem.id}</div>
                  </div>

                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Source : </div>
                    <div className="text-sm text-gray-600">{viewItem.source || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Sub Source : </div>
                    <div className="text-sm text-gray-600">{viewItem.subSource || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Industry : </div>
                    <div className="text-sm text-gray-600">{viewItem.industry || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Media Type : </div>
                    <div className="text-sm text-gray-600">{viewItem.mediaType || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">City : </div>
                    <div className="text-sm text-gray-600">{viewItem.city || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">State : </div>
                    <div className="text-sm text-gray-600">{viewItem.state || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Country : </div>
                    <div className="text-sm text-gray-600">{viewItem.country || '-'}</div>
                  </div>
                  <div className='flex bg-gray-100 p-3 rounded-lg mb-3 col-span-2'>
                    <div className="text-sm text-gray-800 font-semibold min-w-[100px]">Date & Time : </div>
                    <div className="text-sm text-gray-600">{viewItem.dateTime || '-'}</div>
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
          onClose={() => navigate('/pre-lead/view')}
          onSave={(data: any) => handleSaveEdited({ ...(data as Record<string, any>) })}
        />
      ) : (
        <>
          {hasPermission('miss-campaign.create') && (
            <MasterHeader onCreateClick={handleCreate} createButtonLabel="Create Pre Lead" />
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Table Header */}
            <TableHeader
              title="Pre Lead"
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
            >
              <SearchBar delay={0} placeholder="Search Pre Lead" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </TableHeader>


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
                  { key: 'industry', header: 'Industry', render: (it: MissCampaign) => it.industry || '-' },
                  { key: 'productName', header: 'Product Name', render: (it: MissCampaign) => it.productName },
                  { key: 'source', header: 'Source', render: (it: MissCampaign) => it.source },
                  { key: 'subSource', header: 'Sub Source', render: (it: MissCampaign) => it.subSource },
                  { key: 'city', header: 'City', render: (it: MissCampaign) => it.city },
                  { key: 'state', header: 'State', render: (it: MissCampaign) => it.state },
                  { key: 'country', header: 'Country', render: (it: MissCampaign) => it.country },
                  { key: 'mediaType', header: 'Media Type', render: (it: MissCampaign) => it.mediaType || '-' },
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
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full p-1 border z-50 cursor-pointer flex items-center justify-center"
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