import React, { useState, useRef } from 'react';
import Table, { type Column } from '../../components/ui/Table';
import AssignDropdown from '../../components/ui/AssignDropdown';
import CallStatusDropdown from '../../components/ui/CallStatusDropdown';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import { MasterHeader, StatusPill } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface Lead {
  id: string;
  brandName: string;
  contactPerson: string;
  phoneNumber: string;
  source: string;
  subSource: string;
  assignBy: string;
  assignTo: string;
  dateTime: string;
  status: string;
  callStatus: string;
  callAttempt: number;
  comment: string;
}

const mockLeads: Lead[] = [
  { id: '#CL001', brandName: 'Nike', contactPerson: 'Phoenix Baker', phoneNumber: '8797099888', source: 'FB', subSource: 'Website', assignBy: 'Shivika', assignTo: 'Sales Man 1', dateTime: '02-07-2025 22:23', status: 'Interested', callStatus: 'Follow Up', callAttempt: 2, comment: 'According to Form' },
  { id: '#CL002', brandName: 'Puma', contactPerson: 'Demi Wilkinson', phoneNumber: '8797099888', source: 'PPC', subSource: 'Landing', assignBy: 'Shivika', assignTo: 'Sales Man 2', dateTime: '02-07-2025 22:21', status: 'Pending', callStatus: 'Ringing', callAttempt: 3, comment: 'Newspaper' },
  { id: '#CL003', brandName: 'Apple', contactPerson: 'Demi Wilkinson', phoneNumber: '8797099888', source: 'Referral', subSource: 'Web', assignBy: 'Shivika', assignTo: 'Sales Man 3', dateTime: '02-07-2025 22:23', status: 'Meeting Scheduled', callStatus: 'Meeting', callAttempt: 1, comment: 'According to Form' },
  { id: '#CL004', brandName: 'Pepsi', contactPerson: 'Candice Wu', phoneNumber: '8797099888', source: 'Website', subSource: 'Direct', assignBy: 'Shivika', assignTo: 'Sales Man 1', dateTime: '02-07-2025 22:23', status: 'Meeting Done', callStatus: 'Website', callAttempt: 3, comment: 'According to Form' },
  { id: '#CL005', brandName: 'Coca Cola', contactPerson: 'Natal Craig', phoneNumber: '8797099888', source: 'Referral', subSource: 'Partner', assignBy: 'Shivika', assignTo: 'Sales Man 2', dateTime: '02-07-2025 22:23', status: 'Brief Received', callStatus: 'Referel', callAttempt: 6, comment: 'According to Form' },
  { id: '#CL006', brandName: 'Adidas', contactPerson: 'Liam Turner', phoneNumber: '8797099001', source: 'Email', subSource: 'Campaign', assignBy: 'Shivika', assignTo: 'Sales Man 4', dateTime: '03-07-2025 10:00', status: 'Brief Pending', callStatus: 'Not Connected', callAttempt: 0, comment: 'Awaiting brief from client' },
];


const salesMen = [
  'Sales Man 1',
  'Sales Man 2',
  'Sales Man 3',
  'Sales Man 4',
  'Sales Man 5',
  'Sales Man 6',
];

const callStatusOptions = [
  "Busy",
  "Duplicate",
  "Fake Lead",
  "FollowBack",
  "Invalid Number",
  "Not Reachable",
  "Switched Off",
  "Not Connected",
  "Connected",
  "No Response",
  "Wrong Number",
  "Call Back Scheduled",
  "Interested",
  "Not Interested",
  "Converted",
  "DND Requested"
];

const statusColors: Record<string, string> = {
  'Interested': '#22c55e',
  'Pending': '#f59e0b',
  'Brief Pending': '#f97316',
  'Meeting Scheduled': '#3b82f6',
  'Meeting Done': '#8b5cf6',
  'Brief Received': '#06b6d4'
};

interface Props {
  title: string;
  filterStatus?: string; // if not provided, show all
}

const LeadList: React.FC<Props> = ({ title, filterStatus }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  // Tooltip state for Comment hover
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom'>('top');
  const hoverTimeout = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

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

  // Filter leads by search query (local search across a few fields)
  const filteredLeads = leads.filter((l) => {
    if (filterStatus && filterStatus !== 'All') {
      // Special handling for 'Brief' group: include both Received and Pending
      if (filterStatus === 'Brief') {
        if (!(l.status === 'Brief Received' || l.status === 'Brief Pending')) return false;
      } else {
        if (l.status !== filterStatus) return false;
      }
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.id.toLowerCase().includes(q) ||
      l.brandName.toLowerCase().includes(q) ||
      l.contactPerson.toLowerCase().includes(q) ||
      l.phoneNumber.toLowerCase().includes(q) ||
      l.callStatus.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();

  const handleCreateLead = () => navigate(ROUTES.LEAD.CREATE);
  const handleEdit = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.LEAD.EDIT(cleanId));
  };

  const handleAssignToChange = (leadId: string, newSalesMan: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, assignTo: newSalesMan } : lead
      )
    );
  };

  const handleCallStatusChange = (leadId: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        if (lead.callStatus === newStatus) return lead;
        return { ...lead, callStatus: newStatus, callAttempt: (lead.callAttempt ?? 0) + 1 };
      })
    );
    console.log(`Call status updated for ${leadId} to ${newStatus} — callAttempt incremented`);
  };

  

  // Status is rendered as a non-clickable pill (same as AllLeads)

  const columns = ([
    { key: 'sr', header: 'S.No.', render: (it: Lead) => String(startIndex + currentData.indexOf(it) + 1), className: 'text-left whitespace-nowrap' },
    { key: 'brandName', header: 'Brand Name', render: (it: Lead) => it.brandName, className: 'max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'contactPerson', header: 'Contact Person', render: (it: Lead) => it.contactPerson, className: 'max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'phoneNumber', header: 'Phone Number', render: (it: Lead) => it.phoneNumber, className: 'whitespace-nowrap' },
    { key: 'subSource', header: 'Sub-Source', render: (it: Lead) => it.subSource, className: 'whitespace-nowrap' },
    { key: 'assignBy', header: 'Assign By', render: (it: Lead) => it.assignBy, className: 'whitespace-nowrap' },
    {
      key: 'assignTo',
      header: 'Assign To',
      render: (it: Lead) => (
        <AssignDropdown
          value={it.assignTo}
          options={salesMen}
          onChange={(newSalesMan) => handleAssignToChange(it.id, newSalesMan)}
        />
      ),
      className: 'min-w-[140px]',
    },
    { key: 'dateTime', header: 'Date & Time', render: (it: Lead) => it.dateTime, className: 'whitespace-nowrap' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (it: Lead) => (
        <StatusPill
          label={it.status}
          color={statusColors[it.status] || '#6b7280'}
        />
      ),
      className: 'whitespace-nowrap'
    },
    {
      key: 'callStatus',
      header: 'Call Status',
      render: (it: Lead) => (
        <div className="min-w-[160px]">
          <CallStatusDropdown
            value={it.callStatus}
            options={callStatusOptions}
            onChange={(newStatus) => handleCallStatusChange(it.id, newStatus)}
          />
        </div>
      ),
      className: 'min-w-[160px]',
    },
    { key: 'followUp', header: 'Follow-Up / Meeting Type', render: (it: Lead) => it.dateTime, className: 'whitespace-nowrap' },
    { key: 'callAttempt', header: 'Call Attempt', render: (it: Lead) => String(it.callAttempt), className: 'whitespace-nowrap' },
    { 
      key: 'comment', 
      header: 'Comment', 
      render: (it: Lead) => (
        <div
          className="cursor-help max-w-[220px]"
          onMouseEnter={(e) => showTooltip(e, it.comment)}
          onMouseLeave={() => hideTooltip()}
        >
          <div
            className="text-sm text-[var(--text-primary)]"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              overflowWrap: 'break-word'
            }}
          >
            {it.comment}
          </div>
        </div>
      ),
      className: 'max-w-[220px]'
    },
  ] as Column<Lead>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={handleCreateLead}
        createButtonLabel="Create Lead"
      />
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <div className="ml-4">
            <SearchBar
              placeholder="Search leads..."
              delay={250}
              onSearch={(q: string) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="pt-0 overflow-visible">
          <Table
            data={currentData}
            startIndex={startIndex}
            loading={false}
            desktopOnMobile={true}
            keyExtractor={(it: Lead) => it.id}
            columns={columns}
            onEdit={(it: Lead) => handleEdit(it.id)}
          />
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />

      

      {/* Tooltip popup for full comment text */}
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
    </div>
  );
};

export default LeadList;
