import React, { useState, useRef, useEffect } from 'react';
import Table, { type Column } from '../../components/ui/Table';
import AssignDropdown from '../../components/ui/AssignDropdown';
import CallStatusDropdown from '../../components/ui/CallStatusDropdown';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { MasterHeader, StatusPill } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { listLeads, listLeadsByStatus, updateLead, deleteLead } from '../../services/AllLeads';
import { assignUserToLead } from '../../services/leadAssignTo';

interface Lead {
  id: string;
  agencyName?: string;
  brandName?: string;
  brand_name?: string;
  contactPerson?: string;
  contact_person?: string;
  phoneNumber?: string;
  mobile_number?: string[];
  source?: string;
  lead_source?: string;
  subSource?: string;
  lead_sub_source?: string;
  assignBy?: string;
  assignTo?: string;
  current_assign_user?: string | number;
  dateTime?: string;
  status?: string;
  callStatus?: string;
  callAttempt?: number;
  comment?: string;
  [key: string]: any;
}




interface UserOption {
  id: number | string;
  name: string;
}

import { fetchCallStatuses } from '../../services/CallStatus';
import { apiClient } from '../../utils/apiClient';
import http from '../../services/http';

const statusColors: Record<string, string> = {
  'Interested': '#22c55e',
  'Pending': '#f59e0b',
  'Brief Pending': '#f97316',
  'Meeting Schedule': '#3b82f6',
  'Meeting Scheduled': '#3b82f6',
  'Meeting Done': '#8b5cf6',
  'Brief Received': '#06b6d4',
  'Brief Recieved': '#06b6d4'
};

interface Props {
  title: string;
  filterStatus?: string; // if not provided, show all
}

const LeadList: React.FC<Props> = ({ title, filterStatus }) => {
  // Assign To options state and effect (must be inside component)
  const [assignToOptions, setAssignToOptions] = useState<UserOption[]>([]);
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
    // Helper to fetch leads (for reload)
    const fetchLeads = async () => {
      try {
        setLoading(true);
        let response;
        if (filterStatus && filterStatus !== 'All') {
          const statusIdMap: Record<string, number> = {
            'Interested': 1,
            'Pending': 2,
            'Meeting Done': 3,
            'Brief Pending': 4,
            'Brief Recieved': 5,
            'Brief Received': 5,
            'Meeting Scheduled': 6,
            'Meeting Schedule': 6
          };
          const statusId = statusIdMap[filterStatus] || undefined;
          if (statusId) {
            response = await listLeadsByStatus(statusId, currentPage, itemsPerPage);
          } else {
            response = await listLeadsByStatus(filterStatus, currentPage, itemsPerPage);
          }
        } else {
          response = await listLeads(currentPage, itemsPerPage);
        }
        const transformedLeads = response.data.map((item: any) => ({
          id: item.id ? String(item.id) : '',
          agencyName: item.agency?.name || item.agency_name || '',
          brandName: item.brand_name || item.brand?.name || String(item.brand_id || ''),
          contactPerson: item.contact_person || item.name || '',
          phoneNumber: Array.isArray(item.mobile_number) ? (item.mobile_number[0] || '') : (item.mobile_number || item.email || ''),
          source: item.lead_source || item.source || '',
          subSource: item.sub_source?.name || item.lead_sub_source?.name || item.lead_sub_source_name || item.lead_sub_source || '',
          assignBy: item.created_by_user?.name || item.assign_by_name || item.created_by || '',
          assignTo: item.current_assign_user_name || item.assigned_user?.name || (item.current_assign_user && typeof item.current_assign_user === 'object' ? item.current_assign_user.name : '') || item.assign_to_name || '',
          dateTime: item.created_at || new Date().toLocaleString(),
          status: item.lead_status_relation?.name || item.lead_status || '',
          callStatus: (() => {
            const raw = item.call_status_relation?.name ?? item.call_status ?? item.callStatus ?? '';
            return raw === null || raw === undefined || raw === '' ? 'N/A' : raw;
          })(),
          callAttempt: Number(item.call_attempt ?? item.callAttempt ?? 0),
          comment: item.comment || item.notes || '',
        }));
        setLeads(transformedLeads);
      } catch (error) {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
  // Call status options will be fetched from API
  const [callStatusOptions, setCallStatusOptions] = useState<string[]>([]);

  // Fetch call status options from API
  useEffect(() => {
    const loadCallStatuses = async () => {
      try {
        const resp = await fetchCallStatuses();
        const options = (resp.data || []).map((item: any) => item.name).filter(Boolean);
        setCallStatusOptions(options);
      } catch (err) {
        setCallStatusOptions([]);
      }
    };
    loadCallStatuses();
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        let response;
        // Use server-side filtering if filterStatus is provided
        if (filterStatus && filterStatus !== 'All') {
          // Map status name to ID if needed (update this mapping as per your backend)
          const statusIdMap: Record<string, number> = {
            'Interested': 1,
            'Pending': 2,
            'Meeting Done': 3,
            'Brief Pending': 4,
            'Brief Recieved': 5,
            'Brief Received': 5,
            'Meeting Scheduled': 6,
            'Meeting Schedule': 6
          };
          const statusId = statusIdMap[filterStatus] || undefined;
          if (statusId) {
            response = await listLeadsByStatus(statusId, currentPage, itemsPerPage);
          } else {
            response = await listLeadsByStatus(filterStatus, currentPage, itemsPerPage);
          }
        } else {
          response = await listLeads(currentPage, itemsPerPage);
        }
        const transformedLeads = response.data.map((item: any) => ({
          id: item.id ? String(item.id) : '',
          agencyName: item.agency?.name || item.agency_name || '',
          brandName: item.brand_name || item.brand?.name || String(item.brand_id || ''),
          contactPerson: item.contact_person || item.name || '',
          phoneNumber: Array.isArray(item.mobile_number) ? (item.mobile_number[0] || '') : (item.mobile_number || item.email || ''),
          source: item.lead_source || item.source || '',
          subSource: item.sub_source?.name || item.lead_sub_source?.name || item.lead_sub_source_name || item.lead_sub_source || '',
          assignBy: item.created_by_user?.name || item.assign_by_name || item.created_by || '',
          assignTo: item.current_assign_user_name || item.assigned_user?.name || (item.current_assign_user && typeof item.current_assign_user === 'object' ? item.current_assign_user.name : '') || item.assign_to_name || '',
          dateTime: item.created_at || new Date().toLocaleString(),
          status: item.lead_status_relation?.name || item.lead_status || '',
          callStatus: (() => {
            const raw = item.call_status_relation?.name ?? item.call_status ?? item.callStatus ?? '';
            return raw === null || raw === undefined || raw === '' ? 'N/A' : raw;
          })(),
          callAttempt: Number(item.call_attempt ?? item.callAttempt ?? 0),
          comment: item.comment || item.notes || '',
        }));
        setLeads(transformedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentPage, filterStatus]);

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
        if (!(l.status === 'Brief Recieved' || l.status === 'Brief Pending')) return false;
      } 
      // Special handling for 'Meeting Scheduled' group: only Meeting Schedule (not Meeting Done)
      else if (filterStatus === 'Meeting Scheduled') {
        if (l.status !== 'Meeting Schedule') return false;
      }
      else {
        if (l.status !== filterStatus) return false;
      }
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.id.toLowerCase().includes(q) ||
      (l.brandName ?? '').toLowerCase().includes(q) ||
      (l.contactPerson ?? '').toLowerCase().includes(q) ||
      (l.phoneNumber ?? '').toLowerCase().includes(q) ||
      (l.callStatus ?? '').toLowerCase().includes(q)
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
  const handleView = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.LEAD.DETAIL(cleanId));
  };

  const handleAssignToChange = (leadId: string, newSalesMan: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, assignTo: newSalesMan } : lead
      )
    );
    (async () => {
      try {
        const numericId = String(leadId).replace('#', '');
        const found = assignToOptions.find(u => u.name === newSalesMan);
        if (found && found.id != null) {
          await assignUserToLead(numericId, found.id);
        } else {
          await updateLead(numericId, { current_assign_user: newSalesMan });
        }
      } catch (err) {
        console.warn('Failed to persist assignTo change', err);
      }
    })();
  };

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
    } catch (err: any) {
      console.error('Failed to delete lead', err);
      alert(err?.message || 'Failed to delete lead');
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

  const handleCallStatusChange = (leadId: string, newStatus: string) => {
    // Use the shared axios http instance so cookies and Authorization header are handled automatically
    const updateCallStatus = async () => {
      try {
        setLoading(true);
        // Find call status id from name
        let callStatusId: number | undefined;
        if (Array.isArray(callStatusOptions) && callStatusOptions.length > 0 && typeof callStatusOptions[0] === 'object') {
          // If callStatusOptions is array of objects {id, name}
          const selected = (callStatusOptions as any[]).find((opt: any) => opt.name === newStatus);
          callStatusId = selected?.id;
        } else {
          // Fallback: fetch from API
          const resp = await fetchCallStatuses();
          const found = (resp.data || []).find((item: any) => item.name === newStatus);
          callStatusId = found?.id;
        }
        if (!callStatusId) {
          alert('Invalid call status');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('call_status_id', String(callStatusId));
        formData.append('_method', 'Put');
        const response = await http.post(`/leads/${leadId}/call-status`, formData);
        const result = response.data;
        if (result.success) {
          await fetchLeads();
        } else {
          alert(result.message || 'Failed to update call status');
        }
      } catch (error) {
        alert('Error updating call status');
      } finally {
        setLoading(false);
      }
    };
    updateCallStatus();
  };

  

  // Status is rendered as a non-clickable pill (same as AllLeads)

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
        it.assignTo ? (
          <AssignDropdown
            value={it.assignTo ?? ''}
            options={assignToOptions.map(opt => opt.name)}
            onChange={(newSalesMan) => handleAssignToChange(it.id, newSalesMan)}
          />
        ) : (
          <span>-</span>
        )
      ),
      className: 'min-w-[140px]',
    },
    { key: 'dateTime', header: 'Date & Time', render: (it: Lead) => it.dateTime || '-', className: 'whitespace-nowrap' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (it: Lead) => (
        <StatusPill
          label={it.status ?? '-'}
          color={statusColors[it.status ?? ''] || '#6b7280'}
        />
      ),
      className: 'whitespace-nowrap'
    },
    {
      key: 'callStatus',
      header: 'Call Status',
      render: (it: Lead) => (
        (it.callStatus && it.callStatus !== 'N/A') ? (
          <div className="min-w-[160px]">
            <CallStatusDropdown
              value={it.callStatus ?? ''}
              options={callStatusOptions}
              onChange={(newStatus) => handleCallStatusChange(it.id, newStatus)}
            />
          </div>
        ) : (
          <span>-</span>
        )
      ),
      className: 'min-w-[160px]',
    },
    { key: 'followUp', header: 'Follow-Up / Meeting Type', render: (it: Lead) => it.dateTime || '-', className: 'whitespace-nowrap' },
    { key: 'callAttempt', header: 'Call Attempt', render: (it: Lead) => it.callAttempt ? String(it.callAttempt) : '-', className: 'whitespace-nowrap' },
    { 
      key: 'comment', 
      header: 'Comment', 
      render: (it: Lead) => (
        <div
          className="cursor-help max-w-[220px]"
          onMouseEnter={(e) => showTooltip(e, it.comment ?? '-')}
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
        totalItems={filteredLeads.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />

      {/* Confirmation dialog for delete */}
      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead "${confirmDeleteLabel}"? This action cannot be undone.`}
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
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
