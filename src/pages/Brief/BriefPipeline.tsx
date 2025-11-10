import React, { useState, useEffect, useRef } from 'react';
import CreateBriefForm from './CreateBriefForm';
import MasterView from '../../components/ui/MasterView';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import MasterHeader from '../../components/ui/MasterHeader';
import SearchBar from '../../components/ui/SearchBar';
import { type BriefItem as ServiceBriefItem } from '../../services/BriefPipeline';
import StatusDropdown from '../../components/ui/StatusDropdown';
import AssignDropdown from '../../components/ui/AssignDropdown';

type Brief = ServiceBriefItem;

const BriefPipeline: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Brief | null>(null);
  const [editItem, setEditItem] = useState<Brief | null>(null);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = briefs;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => navigate(ROUTES.BRIEF.EDIT(encodeURIComponent(id)));
  const handleView = (id: string) => navigate(ROUTES.BRIEF.DETAIL(encodeURIComponent(id)));
  const handleDelete = (id: string) => setBriefs(prev => prev.filter(b => b.id !== id));

  const handleCreate = () => navigate(ROUTES.BRIEF.CREATE);

  const handleSaveBrief = (data: Record<string, unknown>) => {
    const d = data as Record<string, unknown>;
    const newBrief: Brief = {
      id: `#BRF${Math.floor(Math.random() * 90000) + 10000}`,
      briefName: String(d['briefName'] ?? 'Untitled Brief'),
      brandName: String(d['brandName'] ?? ''),
      productName: String(d['productName'] ?? ''),
      contactPerson: String(d['contactPerson'] ?? ''),
      modeOfCampaign: String(d['modeOfCampaign'] ?? ''),
      mediaType: String(d['mediaType'] ?? ''),
      priority: String(d['priority'] ?? ''),
      budget: String(d['budget'] ?? ''),
      createdBy: String(d['createdBy'] ?? ''),
      assignTo: String(d['assignTo'] ?? ''),
      status: String(d['status'] ?? ''),
      briefDetail: String(d['briefDetail'] ?? ''),
      submissionDate: String(d['submissionDate'] ?? ''),
      dateTime: new Date().toISOString(),
    };
    setBriefs(prev => [newBrief, ...prev]);
    setCurrentPage(1);
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
      const found = briefs.find(b => b.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = briefs.find(b => b.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, briefs]);

  // Dummy data for development
  const dummyBriefs: Brief[] = [
    {
      id: '#BRF10001',
      briefName: 'Summer Campaign 2025',
      brandName: 'CoolBrand',
      productName: 'Summer Collection',
      contactPerson: 'John Smith',
      modeOfCampaign: 'Digital',
      mediaType: 'Social Media',
      priority: 'High',
      budget: '50,000',
      createdBy: 'Sarah Jones',
      assignTo: 'Planner 1',
      status: 'submission',
      briefDetail: 'Summer collection launch campaign across social media platforms',
      submissionDate: '2025-11-10',
      dateTime: '2025-11-07T09:00:00Z'
    },
    {
      id: '#BRF10002',
      briefName: 'Product Launch Event',
      brandName: 'TechGear',
      productName: 'SmartWatch Pro',
      contactPerson: 'Emily Chen',
      modeOfCampaign: 'Hybrid',
      mediaType: 'Mixed Media',
      priority: 'Critical',
      budget: '100,000',
      createdBy: 'Michael Wong',
      assignTo: 'Planner 2',
      status: 'approve',
      briefDetail: 'Product launch event with live streaming and social media coverage',
      submissionDate: '2025-11-15',
      dateTime: '2025-11-07T10:30:00Z'
    },
    {
      id: '#BRF10003',
      briefName: 'Holiday Season Campaign',
      brandName: 'JoyGifts',
      productName: 'Gift Collection',
      contactPerson: 'Lisa Brown',
      modeOfCampaign: 'Traditional',
      mediaType: 'Print',
      priority: 'Medium',
      budget: '75,000',
      createdBy: 'David Miller',
      assignTo: 'Planner 3',
      status: 'negotiation',
      briefDetail: 'Holiday season promotional campaign for gift collection',
      submissionDate: '2025-11-20',
      dateTime: '2025-11-07T11:45:00Z'
    },
    {
      id: '#BRF10004',
      briefName: 'Brand Refresh',
      brandName: 'EcoLife',
      productName: 'Sustainable Line',
      contactPerson: 'Alex Green',
      modeOfCampaign: 'Digital',
      mediaType: 'Website',
      priority: 'Low',
      budget: '25,000',
      createdBy: 'Emma White',
      assignTo: 'Planner 4',
      status: 'closed',
      briefDetail: 'Brand refresh campaign focusing on sustainability',
      submissionDate: '2025-11-25',
      dateTime: '2025-11-07T13:15:00Z'
    },
    {
      id: '#BRF10005',
      briefName: 'New Market Entry',
      brandName: 'GlobalFoods',
      productName: 'Organic Range',
      contactPerson: 'Robert Taylor',
      modeOfCampaign: 'Integrated',
      mediaType: 'Multiple',
      priority: 'High',
      budget: '150,000',
      createdBy: 'Jennifer Lee',
      assignTo: 'Planner 5',
      status: 'not-interested',
      briefDetail: 'Market entry campaign for organic food range',
      submissionDate: '2025-11-30',
      dateTime: '2025-11-07T14:30:00Z'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const filtered = searchQuery
        ? dummyBriefs.filter(brief => 
            Object.values(brief).some(value => 
              String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        : dummyBriefs;
      
      setBriefs(filtered);
      setTotalItems(filtered.length);
      setLoading(false);
    }, 500);
  }, [searchQuery]);

  // Assign options for briefs (match planners used in dummy data)
  const planners = ['Planner 1', 'Planner 2', 'Planner 3', 'Planner 4', 'Planner 5', 'Planner 6'];

  const handleAssignToChange = (briefId: string, newPlanner: string) => {
    setBriefs(prev => prev.map(b => (b.id === briefId ? { ...b, assignTo: newPlanner } as Brief : b)));
  };

  const handleSaveEdited = (updated: Partial<Brief>) => {
    setBriefs(prev => prev.map(b => (b.id === updated.id ? { ...b, ...(updated as Partial<Brief>) } as Brief : b)));
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Tooltip state for Brief Detail full text on hover
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('top');
  const hoverTimeout = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Status options
  const STATUS_OPTIONS = ['submission', 'approve', 'negotiation', 'closed', 'not-interested'];

  const showTooltip = (e: React.MouseEvent, content: string) => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Prefer showing above; if not enough space, show below
    const preferTop = rect.top > 140; // heuristic
    const left = Math.max(12, Math.min(window.innerWidth - 12, centerX));
    const top = preferTop ? Math.max(12, rect.top - 8) : Math.min(window.innerHeight - 12, rect.bottom + 8);

    setTooltipContent(content);
    setTooltipLeft(left);
    setTooltipTop(top);
    setTooltipPlacement(preferTop ? 'top' : 'bottom');
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    // small delay to allow moving into tooltip without flicker
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => {
      setTooltipVisible(false);
      hoverTimeout.current = null;
    }, 100);
  };

  // Keep tooltip visible while hovering tooltip itself
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

  const handleSelectStatus = (id: string | null, newStatus: string) => {
    if (!id) return;
    setBriefs(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } as Brief : b)));
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateBriefForm inline onClose={() => navigate(ROUTES.BRIEF.PIPELINE)} onSave={handleSaveBrief} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.BRIEF.PIPELINE)} />
      ) : editItem ? (
        <CreateBriefForm
          inline
          mode="edit"
          initialData={editItem}
          onClose={() => navigate(ROUTES.BRIEF.PIPELINE)}
          onSave={(data: Record<string, unknown>) => handleSaveEdited(data as Partial<Brief>)}
        />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreate}
            createButtonLabel="Create Brief"
            showBreadcrumb={true}
            breadcrumbItems={[
              { label: 'Brief', path: ROUTES.BRIEF.ROOT },
              { label: 'Brief Pipeline', isActive: true }
            ]}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brief Pipeline</h2>
              <SearchBar delay={0} onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </div>

            <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: Brief, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: Brief) => String(startIndex + currentData.indexOf(it) + 1), className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'briefName', header: 'Brief Name', render: (it: Brief) => it.briefName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'brandName', header: 'Brand Name', render: (it: Brief) => it.brandName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'productName', header: 'Product Name', render: (it: Brief) => it.productName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'contactPerson', header: 'Contact Person', render: (it: Brief) => it.contactPerson, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'modeOfCampaign', header: 'Mode Of Campaign', render: (it: Brief) => it.modeOfCampaign, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'mediaType', header: 'Media Type', render: (it: Brief) => it.mediaType, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'priority', header: 'Priority', render: (it: Brief) => it.priority, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'budget', header: 'Budget', render: (it: Brief) => String(it.budget ?? ''), className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'createdBy', header: 'Created By', render: (it: Brief) => it.createdBy, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'assignTo', header: 'Assign To', render: (it: Brief) => (
                  <div className="min-w-[140px]">
                    <AssignDropdown
                      value={String(it.assignTo ?? '')}
                      options={planners}
                      onChange={(newPlanner: string) => handleAssignToChange(it.id, newPlanner)}
                    />
                  </div>
                ), className: 'min-w-[140px]' },
                { key: 'status', header: 'Status', render: (it: Brief) => (
                  <div className="min-w-[140px]">
                    <StatusDropdown
                      value={String(it.status ?? '')}
                      options={STATUS_OPTIONS}
                      onChange={(newStatus: string) => handleSelectStatus(it.id, newStatus)}
                    />
                  </div>
                ), className: 'min-w-[140px]' },
                {
                  key: 'briefDetail',
                  header: 'Brief Detail',
                  render: (it: Brief) => (
                    <span
                      className="inline-block"
                      onMouseEnter={(e) => showTooltip(e, String(it.briefDetail ?? ''))}
                      onMouseLeave={() => hideTooltip()}
                      // provide native tooltip as a11y/fallback
                      title={String(it.briefDetail ?? '')}
                    >
                      <div
                        className="text-sm text-[var(--text-primary)]"
                        style={{
                          maxWidth: '40ch',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {it.briefDetail}
                      </div>
                    </span>
                  ),
                },
                { key: 'submissionDate', header: 'Submission Date & Time', render: (it: Brief) => it.submissionDate, className: 'whitespace-nowrap overflow-hidden truncate' },
              ] as Column<Brief>[])}
              onEdit={(it: Brief) => handleEdit(it.id)}
              onView={(it: Brief) => handleView(it.id)}
              onDelete={(it: Brief) => handleDelete(it.id)}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          {/* Tooltip popup for full Brief Detail */}
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
          {/* Status dropdown now uses StatusDropdown component inside table cells */}
        </>
      )}
    </div>
  );
};

export default BriefPipeline;
