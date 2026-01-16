import React, { useState, useRef, useEffect } from 'react';
import Table, { type Column } from '../../components/ui/Table';
import AssignDropdown from '../../components/ui/AssignDropdown';
import CallStatusDropdown from '../../components/ui/CallStatusDropdown';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import { MasterHeader, StatusPill } from '../../components/ui';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import NotificationPopup from '../../components/ui/NotificationPopup';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { listLeads, updateLead, deleteLead } from '../../services/AllLeads';
import { assignUserToLead } from '../../services/leadAssignTo';
import { apiClient } from '../../utils/apiClient';
import { fetchCallStatuses, updateCallStatus } from '../../services/CallStatus';

interface Lead {
  id: string;
  agencyName: string;
  brandName: string;
  contactPerson: string;
  phoneNumber: string;
  source: string;
  subSource: string;
  assignBy: string;
  assignTo: string;
  dateTime: string;
  status: string;
  leadStatus: string;
  callStatus: string;
  callAttempt: number;
  comment: string;
}

interface CallStatusOption {
  id: number;
  name: string;
}


interface UserOption {
  id: number | string;
  name: string;
}

// Call status options will be fetched from API

// (status mapping removed - not used in this file)


const AllLeads: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 15;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [callStatusOptions, setCallStatusOptions] = useState<CallStatusOption[]>([]);
  const [assignToOptions, setAssignToOptions] = useState<UserOption[]>([]);
    // Fetch call status options from API
    useEffect(() => {
      const loadCallStatuses = async () => {
        try {
          const resp = await fetchCallStatuses();
          // Store as array of {id, name}
          const options = (resp.data || []).map((item: any) => ({ id: item.id, name: item.name })).filter((item: any) => item.id && item.name);
          setCallStatusOptions(options);
        } catch (err) {
          setCallStatusOptions([]);
        }
      };
      loadCallStatuses();
    }, []);

    // Fetch assign to (user) options from API
    useEffect(() => {
      const loadUsers = async () => {
        try {
          const res = await apiClient.get('/users/list');
          const users = Array.isArray(res.data) ? res.data : [];
          setAssignToOptions(users.map((u: any) => ({ id: u.id, name: u.name })));
        } catch (err) {
          setAssignToOptions([]);
        }
      };
      loadUsers();
    }, []);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

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
  // no external open state needed for call status dropdowns (self-contained)

  // Use API paginated data directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = leads;

  const navigate = useNavigate();

  const handleCreateLead = () => navigate(ROUTES.LEAD.CREATE);
  const handleEdit = (id: string) => {
    // Remove the '#' from the ID before using it in the URL
    const cleanId = id.replace('#', '');
    navigate(ROUTES.LEAD.EDIT(cleanId));
  };
  
  const handleView = (id: string) => {
    // Remove the '#' from the ID before using it in the URL
    const cleanId = id.replace('#', '');
    navigate(ROUTES.LEAD.DETAIL(cleanId));
  };

  const handleAssignToChange = (leadId: string, newSalesMan: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, assignTo: newSalesMan } : lead
      )
    );
    // Optionally, call API here to persist change
    // Try persisting assignTo change to server (best-effort)
    (async () => {
      try {
        // remove leading '#' if present
        const numericId = String(leadId).replace('#', '');
        // try to find user id from assignToOptions (we store options as {id, name})
        const found = assignToOptions.find(u => u.name === newSalesMan);
        if (found && found.id != null) {
          await assignUserToLead(numericId, found.id);
        } else {
          // fallback to existing updateLead call if we only have the name
          await updateLead(numericId, { current_assign_user: newSalesMan });
        }
      } catch (err) {
        console.warn('Failed to persist assignTo change', err);
      }
    })();
  };

  const handleAssignConfirm = async (_newSalesMan: string) => {
    // This is called when user confirms the assignment in the dialog
    // The actual API call happens after confirmation in handleAssignToChange
  };

  
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessageToast, setErrorMessageToast] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Open confirmation dialog (used by ActionMenu)
  const handleDelete = (leadId: string) => {
    const found = leads.find((l) => l.id === leadId);
    setConfirmDeleteId(leadId);
    setConfirmDeleteLabel(found ? (found.brandName || found.contactPerson || String(found.id)) : leadId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    const numericId = String(confirmDeleteId).replace('#', '');
    try {
      await deleteLead(numericId);
      setLeads((prev) => prev.filter((l) => l.id !== confirmDeleteId));
      setTotalItems((t) => Math.max(0, Number(t) - 1));

      const isLastOnPage = currentData.length === 1;
      if (isLastOnPage && currentPage > 1) setCurrentPage((p) => p - 1);
    } catch (err: any) {
      console.error('Failed to delete lead', err);
      setErrorMessageToast(err?.message || 'Failed to delete lead');
      setShowErrorToast(true);
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

  const handleCallStatusChange = async (leadId: string, newStatus: string) => {
    // Update the lead status in state and increment callAttempt when status actually changes
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        // Treat 'N/A' as empty when comparing previous value
        const prevStatus = lead.callStatus === 'N/A' ? '' : lead.callStatus;
        if (prevStatus === newStatus) return lead; // no change
        return { ...lead, callStatus: newStatus };
      })
    );
    // Optional: Log the change to verify it's being called
    console.log(`Call status updated for ${leadId} to ${newStatus} — callAttempt incremented`);

    // Find the id for the selected call status name
    const selectedOption = callStatusOptions.find(opt => opt.name === newStatus);
    if (!selectedOption) {
      console.warn('Call status id not found for name:', newStatus);
      return;
    }
    try {
      const numericId = String(leadId).replace('#', '');
      await updateCallStatus(numericId, selectedOption.id);
      // Refresh table after update
      fetchLeads();
    } catch (err) {
      console.warn('Failed to persist call status change', err);
    }
  };

  const handleCallStatusConfirm = async (_newStatus: string) => {
    // This is called when user confirms the call status change in the dialog
    // The actual API call happens after confirmation in handleCallStatusChange
  };

  // Fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (searchQuery) filters.search = searchQuery;
      const resp = await listLeads(currentPage, itemsPerPage, filters);
      const items = (resp.data || []).map((it: any) => ({
          id: it.id ? `#${String(it.id)}` : '#0',
          agencyName: it.agency?.name || it.agency_name || '',
          brandName: it.brand_name || it.brand?.name || String(it.brand_id || ''),
          contactPerson: it.contact_person || it.name || '',
          phoneNumber: Array.isArray(it.mobile_number) ? (it.mobile_number[0] || '') : (it.mobile_number || ''),
          source: it.lead_source || it.source || '',
          subSource: it.sub_source?.name || it.lead_sub_source?.name || it.lead_sub_source_name || it.lead_sub_source || '',
          assignBy: it.created_by_user?.name || it.assign_by_name || it.created_by || '',
          assignTo: it.current_assign_user_name || it.assigned_user?.name || (it.current_assign_user && typeof it.current_assign_user === 'object' ? it.current_assign_user.name : '') || it.assign_to_name || '',
          dateTime: it.created_at || it.dateTime || it.created_at_formatted || '',
          status: it.status || '',
          leadStatus: it.lead_status_relation?.name || it.lead_status || '',
          callStatus: (() => {
            const raw = it.call_status_relation?.name ?? it.call_status ?? it.callStatus ?? '';
            return raw === null || raw === undefined || raw === '' ? 'N/A' : raw;
          })(),
          callAttempt: Number(it.call_attempt ?? it.callAttempt ?? 0),
          comment: it.comment || it.notes || '',
        } as Lead));

      setLeads(items);
      // Use total from API pagination
      const total = resp.meta?.pagination?.total ?? resp.meta?.total ?? items.length;
      setTotalItems(Number(total ?? items.length));
    } catch (err) {
      console.error('Failed to fetch leads', err);
      setLeads([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const columns = ([
    { key: 'sr', header: 'S.No.', render: (it: Lead) => String(startIndex + currentData.indexOf(it) + 1), className: 'text-left whitespace-nowrap' },
    { key: 'agencyName', header: 'Agency Name', render: (it: Lead) => it.agencyName || '-', className: 'max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'brandName', header: 'Brand Name', render: (it: Lead) => it.brandName || '-', className: 'max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'contactPerson', header: 'Contact Person', render: (it: Lead) => it.contactPerson || '-', className: 'max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'phoneNumber', header: 'Phone Number', render: (it: Lead) => it.phoneNumber || '-', className: 'whitespace-nowrap' },
    { key: 'subSource', header: 'Sub-Source', render: (it: Lead) => it.subSource || '-', className: 'whitespace-nowrap' },
    { key: 'assignBy', header: 'Assign By', render: (it: Lead) => it.assignBy || '-', className: 'whitespace-nowrap' },
    {
      key: 'assignTo',
      header: 'Assign To',
      render: (it: Lead) => (
        <AssignDropdown
          value={it.assignTo ?? ''}
          options={assignToOptions.map(opt => opt.name)}
          onChange={(newSalesMan) => handleAssignToChange(it.id, newSalesMan)}
          onConfirm={handleAssignConfirm}
          context="lead"
        />
      ),
      className: 'min-w-[140px]',
    },
    { key: 'dateTime', header: 'Date & Time', render: (it: Lead) => it.dateTime || '-', className: 'whitespace-nowrap' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (it: Lead) => {
        const statusColors = {
          'Active': '#22c55e',
          'Inactive': '#ef4444',
          'Pending': '#f59e0b',
          'Converted': '#3b82f6',
          'In Progress': '#8b5cf6',
          'Rejected': '#dc2626',
          'Interested': '#22c55e',
          'Brief Pending': '#f97316',
          'Meeting Scheduled': '#3b82f6',
          'Meeting Done': '#8b5cf6',
          'Brief Received': '#06b6d4',
          'N/A': '#6b7280'
        };
        // Display lead_status from API (currently null for all, will show when populated)
        const displayStatus = it.leadStatus || 'N/A';
        return <StatusPill 
          label={displayStatus} 
          color={statusColors[displayStatus as keyof typeof statusColors] || '#6b7280'} 
        />;
      },
      className: 'whitespace-nowrap'
    },
    {
      key: 'callStatus',
      header: 'Call Status',
      render: (it: Lead) => (
        <div className="min-w-[160px]">
            <CallStatusDropdown
              value={(it.callStatus && it.callStatus !== 'N/A') ? it.callStatus : ''}
              options={callStatusOptions.map(opt => opt.name)}
              onChange={(newStatus) => handleCallStatusChange(it.id, newStatus)}
              onConfirm={handleCallStatusConfirm}
            />
        </div>
      ),
      className: 'min-w-[160px]',
    },
    { key: 'callAttempt', header: 'Call Attempt', render: (it: Lead) => it.callAttempt ? String(it.callAttempt) : '-', className: 'whitespace-nowrap' },
    { 
      key: 'comment', 
      header: 'Comment', 
      render: (it: Lead) => (
        <div
          className="cursor-help max-w-[220px]"
          onMouseEnter={(e) => showTooltip(e, it.comment || '-')}
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
            {it.comment || '-'}
          </div>
        </div>
      ),
      className: 'max-w-[220px]'
    },
  ] as Column<Lead>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {/* Delete success popup removed to avoid showing success toast after delete */}
      <NotificationPopup
        isOpen={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={errorMessageToast}
        type="error"
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={`Delete lead "${confirmDeleteLabel}"?`}
        message="This action will permanently remove the lead. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <MasterHeader
        onCreateClick={handleCreateLead}
        createButtonLabel="Create Lead"
      />
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">All Leads</h2>
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
            loading={loading}
            desktopOnMobile={true}
            keyExtractor={(it: Lead) => it.id}
            columns={columns}
            onEdit={(it: Lead) => handleEdit(it.id)}
            onView={(it: Lead) => handleView(it.id)}
            onDelete={(it: Lead) => handleDelete(it.id)}
          />
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
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

export default AllLeads;
