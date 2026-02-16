import React, { useState, useEffect, useRef } from 'react';
import CreateBriefForm from './CreateBriefForm';
import { apiClient } from '../../utils/apiClient';
import { usePermissions } from '../../context/SidebarMenuContext';
import MasterView from '../../components/ui/MasterView';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import MasterHeader from '../../components/ui/MasterHeader';
import SearchBar from '../../components/ui/SearchBar';
import { type BriefItem as ServiceBriefItem, listBriefs, getBrief, createBrief, updateBrief, deleteBrief } from '../../services/BriefPipeline';
import updateAssignUser from '../../services/BriefAssignTo';
import { fetchBriefStatuses, updateBriefStatus, type BriefStatusItem } from '../../services/BriefStatus';
import StatusDropdown from '../../components/ui/StatusDropdown';
import AssignDropdown from '../../components/ui/AssignDropdown';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SweetAlert from '../../utils/SweetAlert';

type Brief = ServiceBriefItem;

const BriefPipeline: React.FC = () => {
  const { hasPermission } = usePermissions();
    // Helper to fetch briefs (for refresh)
    const fetchBriefs = async () => {
      try {
        setLoading(true);
        const res = await listBriefs(currentPage, itemsPerPage, searchQuery || undefined);
        setBriefs(res.data || []);
        const total = res.meta?.pagination?.total ?? 0;
        setTotalItems(Number(total));
      } catch (err) {
        console.error('Failed to load briefs', err);
      } finally {
        setLoading(false);
      }
    };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Brief | null>(null);
  const [editItem, setEditItem] = useState<Brief | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = briefs;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => navigate(ROUTES.BRIEF.EDIT(encodeURIComponent(id)));
  const handleView = (id: string) => navigate(ROUTES.BRIEF.DETAIL(encodeURIComponent(id)));
  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteBrief(confirmDeleteId);
      setBriefs(prev => prev.filter(b => b.id !== confirmDeleteId));
      setTotalItems(prev => Math.max(0, prev - 1));
      try { SweetAlert.showDeleteSuccess(); } catch (_) {}
    } catch (err) {
      console.error('Failed to delete brief', err);
      try { SweetAlert.showError((err as any)?.message || 'Failed to delete brief'); } catch (_) {}
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
    }
  };

  const handleCreate = () => navigate(ROUTES.BRIEF.CREATE);

  const handleSaveBrief = async (data: Record<string, unknown>) => {
    try {
      setLoading(true);
      const payload = data as Partial<Brief>;
      const created = await createBrief(payload);
      setBriefs(prev => [created, ...prev]);
      setTotalItems(prev => prev + 1);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to create brief', err);
    } finally {
      setLoading(false);
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
      // Try to find in-memory first, otherwise fetch single brief from API
      const found = briefs.find(b => b.id === id) || null;
      const patchSubmissionFields = (item: any) => {
        // If item.submission_date exists, parse and add submissionDate/submissionTime
        if (item && item.submission_date) {
          try {
            const dateObj = new Date(item.submission_date);
            if (!isNaN(dateObj.getTime())) {
              const dd = String(dateObj.getDate()).padStart(2, '0');
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const yyyy = dateObj.getFullYear();
              const hh = String(dateObj.getHours()).padStart(2, '0');
              const min = String(dateObj.getMinutes()).padStart(2, '0');
              item.submissionDate = `${dd}-${mm}-${yyyy}`;
              item.submissionTime = `${hh}:${min}`;
            }
          } catch {}
        }
        return item;
      };
      if (found) {
        setEditItem(patchSubmissionFields(found));
        setViewItem(null);
        setShowCreate(false);
        return;
      }

      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const single = await getBrief(id);
          if (!mounted) return;
          setEditItem(single ? patchSubmissionFields(single) : null);
          setViewItem(null);
          setShowCreate(false);
        } catch (err) {
          console.error('Failed to fetch brief for edit', err);
          setEditItem(null);
        } finally {
          if (mounted) setLoading(false);
        }
      })();

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

  // Fetch briefs from API when page or search changes
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await listBriefs(currentPage, itemsPerPage, searchQuery || undefined);
        if (!mounted) return;
        setBriefs(res.data || []);
        // try common pagination shapes
        const total = res.meta?.pagination?.total ?? 0;
        setTotalItems(Number(total));
      } catch (err) {
        // swallow for now; consider showing toast
        console.error('Failed to load briefs', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => { mounted = false; };
  }, [currentPage, itemsPerPage, searchQuery]);


  // Assign To options state and effect (fetch from API)
  interface UserOption { id: number | string; name: string; }
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

  const handleAssignToChange = async (briefId: string, newPlanner: string) => {
    try {
      setLoading(true);
      // resolve selected name to user id from assignToOptions
      const found = assignToOptions.find(o => o.name === newPlanner);
      const assignId = found ? found.id : newPlanner;
      const updated = await updateAssignUser(briefId, assignId);
      // updated may be the brief object in response.data
      if (updated && (updated as any).id) {
        setBriefs(prev => prev.map(b => (b.id === (updated as any).id ? { ...b, ...(updated as Partial<Brief>) } as Brief : b)));
        // refresh full list to reflect server state
        setTimeout(() => { fetchBriefs(); }, 300);
        SweetAlert.showUpdateSuccess();
      }
    } catch (err) {
      console.error('Failed to update assignee', err);
      try { SweetAlert.showError('Failed to update assignment'); } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const handleAssignConfirm = async (_newPlanner: string) => {
    // This is called when user confirms the assignment in the dialog
    // The actual API call happens after confirmation in handleAssignToChange
  };

  const handleSaveEdited = async (updated: Partial<Brief>) => {
    if (!updated.id) return;
    try {
      setLoading(true);
      const res = await updateBrief(updated.id, updated);
      setBriefs(prev => prev.map(b => (b.id === res.id ? { ...b, ...(res as Partial<Brief>) } as Brief : b)));
      // refresh list after successful save
      setTimeout(() => { fetchBriefs(); }, 300);
    } catch (err) {
      console.error('Failed to save edited brief', err);
    } finally {
      setLoading(false);
    }
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

  // Status options state and effect (fetch from API)
  const [statusOptions, setStatusOptions] = useState<BriefStatusItem[]>([]);
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await fetchBriefStatuses();
        setStatusOptions(statuses);
      } catch (err) {
        console.error('Failed to load statuses:', err);
        setStatusOptions([]);
      }
    };
    loadStatuses();
  }, []);

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
    // Find status ID from statusOptions
    const statusObj = statusOptions.find(s => s.name === newStatus);
    const statusId = statusObj ? statusObj.id : newStatus;
    // persist status change
    (async () => {
      try {
        setLoading(true);
        const res = await updateBriefStatus(id, statusId);
        if (res && (res as any).id) {
          setBriefs(prev => prev.map(b => (b.id === (res as any).id ? { ...b, ...(res as Partial<Brief>) } as Brief : b)));
          // refresh list to show updated status
          setTimeout(() => { fetchBriefs(); }, 300);
          SweetAlert.showUpdateSuccess();
        }
      } catch (err) {
        console.error('Failed to update status', err);
        try { SweetAlert.showError('Failed to update status'); } catch (_) {}
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleStatusConfirm = async (_newStatus: string) => {
    // This is called when user confirms the status change in the dialog
    // The actual API call happens after confirmation in handleSelectStatus
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateBriefForm
          inline
          onClose={() => {
            navigate(ROUTES.BRIEF.PIPELINE);
            setTimeout(() => { fetchBriefs(); }, 300);
          }}
          onSave={handleSaveBrief}
        />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.BRIEF.PIPELINE)} />
      ) : editItem ? (
        <CreateBriefForm
          inline
          mode="edit"
          initialData={editItem}
          onClose={() => {
            navigate(ROUTES.BRIEF.PIPELINE);
            setTimeout(() => { fetchBriefs(); }, 300);
          }}
          onSave={(data: Record<string, unknown>) => handleSaveEdited(data as Partial<Brief>)}
        />
      ) : (
        <>
          {hasPermission('brief.create') && (
            <MasterHeader
              onCreateClick={handleCreate}
              createButtonLabel="Create Brief"
              showBreadcrumb={true}
              breadcrumbItems={[
                { label: 'Brief', path: ROUTES.BRIEF.ROOT },
                { label: 'Brief Pipeline', isActive: true }
              ]}
            />
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Brief Pipeline</h2>
              <SearchBar delay={0} placeholder="Please Search Brief" onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </div>

            <div className="pt-0 overflow-visible">
              <Table
                data={currentData}
                startIndex={startIndex}
                loading={loading}
                desktopOnMobile={true}
                keyExtractor={(it: Brief, idx: number) => `${it.id}-${idx}`}
                columns={([
                { key: 'sr', header: 'Id', render: (it: Brief) => `#${it.id}`, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'briefName', header: 'Brief Name', render: (it: Brief) => it.briefName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'brandName', header: 'Brand Name', render: (it: Brief) => it.brandName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'productName', header: 'Product Name', render: (it: Brief) => it.productName, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'contactPerson', header: 'Contact Person', render: (it: Brief) => {
                  const contactPersonVal = it.contactPerson;
                  if (typeof contactPersonVal === 'object' && contactPersonVal !== null && 'name' in contactPersonVal) {
                    return (contactPersonVal as any).name;
                  }
                  return String(contactPersonVal ?? '');
                }, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'modeOfCampaign', header: 'Mode Of Campaign', render: (it: Brief) => it.modeOfCampaign, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'mediaType', header: 'Media Type', render: (it: Brief) => it.mediaType, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'priority', header: 'Priority', render: (it: Brief) => {
                  const priorityVal = it.priority;
                  if (typeof priorityVal === 'object' && priorityVal !== null && 'name' in priorityVal) {
                    return (priorityVal as any).name;
                  }
                  return String(priorityVal ?? '');
                }, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'budget', header: 'Budget', render: (it: Brief) => String(it.budget ?? ''), className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'createdBy', header: 'Created By', render: (it: Brief) => {
                  const createdByVal = it.createdBy;
                  if (typeof createdByVal === 'object' && createdByVal !== null && 'name' in createdByVal) {
                    return (createdByVal as any).name;
                  }
                  return String(createdByVal ?? '');
                }, className: 'whitespace-nowrap overflow-hidden truncate' },
                { key: 'assignTo', header: 'Assign To', render: (it: Brief) => {
                  const assignToVal = it.assignTo;
                  let displayName = '';
                  if (typeof assignToVal === 'object' && assignToVal !== null && 'name' in assignToVal) {
                    displayName = (assignToVal as any).name;
                  } else {
                    displayName = String(assignToVal ?? '');
                  }
                  return hasPermission('brief.assign') ? (
                    <div className="min-w-[140px]">
                      <AssignDropdown
                        value={displayName}
                        options={assignToOptions.map(opt => opt.name)}
                        onChange={(newPlanner: string) => handleAssignToChange(it.id, newPlanner)}
                        onConfirm={handleAssignConfirm}
                      />
                    </div>
                  ) : (
                    <div className="min-w-[140px] text-sm text-gray-700">
                      {displayName || 'Not Assigned'}
                    </div>
                  );
                }, className: 'min-w-[140px]' },
                { key: 'status', header: 'Status', render: (it: Brief) => {
                  // Show status name from brief_status object, fallback to '-' or 'No Status'
                  const statusName = it.brief_status && typeof it.brief_status === 'object' && 'name' in it.brief_status
                    ? (it.brief_status as any).name
                    : '-';
                  return hasPermission('brief-status.update') ? (
                    <div className="min-w-[140px]">
                      <StatusDropdown
                        value={statusName}
                        options={statusOptions.map(opt => opt.name)}
                        onChange={(newStatus: string) => handleSelectStatus(it.id, newStatus)}
                        onConfirm={handleStatusConfirm}
                      />
                    </div>
                  ) : (
                    <div className="min-w-[140px] text-sm text-gray-700">
                      {statusName}
                    </div>
                  );
                }, className: 'min-w-[140px]' },
                {
                  key: 'briefDetail',
                  header: 'Brief Detail',
                  render: (it: Brief) => (
                    <span
                      className="inline-block"
                      onMouseEnter={(e) => showTooltip(e, String(it.comment ?? ''))}
                      onMouseLeave={() => hideTooltip()}
                      // provide native tooltip as a11y/fallback
                      title={String(it.comment ?? '')}
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
                        {it.comment}
                      </div>
                    </span>
                  ),
                },
                { key: 'submissionDate', header: 'Submission Date & Time', render: (it: Brief) => it.submissionDate, className: 'whitespace-nowrap overflow-hidden truncate' },
              ] as Column<Brief>[])}
                onEdit={(it: Brief) => handleEdit(it.id)}
                onView={(it: Brief) => handleView(it.id)}
                onDelete={(it: Brief) => handleDelete(it.id)}
                editPermissionSlug="brief.edit"
                viewPermissionSlug="brief.view"
                deletePermissionSlug="brief.delete"
              />
            </div>
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
          <ConfirmDialog
            isOpen={!!confirmDeleteId}
            title="Delete this brief?"
            message="This action will permanently remove the brief. This cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={confirmLoading}
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default BriefPipeline;
