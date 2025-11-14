import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MasterView from '../../components/ui/MasterView';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import MasterHeader from '../../components/ui/MasterHeader';
import SearchBar from '../../components/ui/SearchBar';
import Create from './Create';
import { 
  listMissCampaigns, 
  createMissCampaign, 
  updateMissCampaign, 
  deleteMissCampaign,
  type MissCampaign 
} from '../../services/View';
import { useRef } from 'react';

const View: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [campaigns, setCampaigns] = useState<MissCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<MissCampaign | null>(null);
  const [editItem, setEditItem] = useState<MissCampaign | null>(null);
  // Tooltip state for Proof hover (similar to AllLeads comment tooltip)
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('top');
  const hoverTimeout = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const filteredCampaigns = campaigns.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.brandName.toLowerCase().includes(q) ||
      c.productName.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Fetch campaigns from API
  const fetchCampaigns = async (page: number, search: string = '') => {
    try {
      setLoading(true);
      const response = await listMissCampaigns(page, itemsPerPage, search);
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
  const handleDelete = async (id: string) => {
    try {
      await deleteMissCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleCreate = () => navigate('/miss-campaign/create');

  const handleSave = async (data: any) => {
    try {
      const newCampaign = await createMissCampaign(data);
      setCampaigns(prev => [newCampaign, ...prev]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to create campaign:', error);
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
      const found = campaigns.find(c => c.id === id) || null;
      setEditItem(found);
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

  // Tooltip helpers
  const showTooltip = (e: React.MouseEvent, content: string) => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const preferTop = rect.top > 140;
    const left = Math.max(12, Math.min(window.innerWidth - 12, centerX));
    const top = preferTop ? Math.max(12, rect.top - 8) : Math.min(window.innerHeight - 12, rect.bottom + 8);

    setTooltipContent(content);
    setTooltipLeft(left);
    setTooltipTop(top);
    setTooltipPlacement(preferTop ? 'top' : 'bottom');
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => {
      setTooltipVisible(false);
      hoverTimeout.current = null;
    }, 100);
  };

  const onTooltipEnter = () => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setTooltipVisible(true);
  };

  const onTooltipLeave = () => {
    hideTooltip();
  };

  const handleSaveEdited = async (updated: Record<string, any>) => {
    try {
      const updatedCampaign = await updateMissCampaign(updated.id, updated);
      setCampaigns(prev => prev.map(c => (c.id === updated.id ? updatedCampaign : c)));
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  // Fetch campaigns on mount and when page or search changes
  useEffect(() => {
    fetchCampaigns(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <Create inline onClose={() => navigate('/miss-campaign/view')} onSave={handleSave} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate('/miss-campaign/view')} />
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
          <MasterHeader onCreateClick={handleCreate} createButtonLabel="Create Miss Campaign" />

          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Miss Campaign</h2>
              <SearchBar delay={0} onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </div>

            <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: MissCampaign, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: MissCampaign) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'brandName', header: 'Brand Name', render: (it: MissCampaign) => it.brandName },
                { key: 'productName', header: 'Product Name', render: (it: MissCampaign) => it.productName },
                { key: 'source', header: 'Source', render: (it: MissCampaign) => it.source },
                { key: 'subSource', header: 'Sub Source', render: (it: MissCampaign) => it.subSource },
                {
                  key: 'proof',
                  header: 'Proof',
                  render: (it: MissCampaign) => (
                    <div
                      className="cursor-help max-w-[360px]"
                      onMouseEnter={(e) => showTooltip(e, String(it.proof || ''))}
                      onMouseLeave={() => hideTooltip()}
                    >
                      <div
                        className="text-sm text-[var(--text-primary)]"
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {it.proof || '-'}
                      </div>
                    </div>
                  ),
                },
                { key: 'dateTime', header: 'Date & Time', render: (it: MissCampaign) => it.dateTime },
              ] as Column<MissCampaign>[])}
              onEdit={(it: MissCampaign) => handleEdit(it.id)}
              onView={(it: MissCampaign) => handleView(it.id)}
              onDelete={(it: MissCampaign) => handleDelete(it.id)}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems || campaigns.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          {/* Tooltip popup for full proof text */}
          {tooltipVisible && (
            <div
              ref={tooltipRef}
              onMouseEnter={onTooltipEnter}
              onMouseLeave={onTooltipLeave}
              role="tooltip"
              aria-hidden={!tooltipVisible}
              style={{ left: tooltipLeft, top: tooltipTop }}
              className={`fixed z-50 transform -translate-x-1/2 ${tooltipPlacement === 'top' ? '-translate-y-full' : 'translate-y-0'}`}
            >
              <div className="bg-white border border-[var(--border-color)] rounded-lg shadow-md p-3 max-w-[48ch] text-sm text-[var(--text-primary)]">
                {tooltipContent}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default View;