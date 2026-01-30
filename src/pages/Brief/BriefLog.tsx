
import React, { useState, useMemo, useEffect } from 'react';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import { useParams, useNavigate } from 'react-router-dom';
import MasterHeader from '../../components/ui/MasterHeader';
import SearchBar from '../../components/ui/SearchBar';
import StatusDropdown from '../../components/ui/StatusDropdown';
import { ROUTES } from '../../constants';
import { listBriefLogs } from '../../services/BriefLog';
import type { BriefLogItem } from '../../services/BriefLog';
import { getPlannerStatuses } from '../../services/BriefLog';

// Data is fetched from API via `listBriefLogs` service

const BriefLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [briefLogs, setBriefLogs] = useState<BriefLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [plannerStatusOptions, setPlannerStatusOptions] = useState<{ id: number; name: string }[]>([]);

  // Status options for the dropdown (from API)
  const statusOptions = useMemo(() => plannerStatusOptions, [plannerStatusOptions]);

  // Fetch planner statuses for dropdown
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getPlannerStatuses();
        if (mounted && res && Array.isArray(res.data)) {
          setPlannerStatusOptions(res.data.map((item: any) => ({ id: item.id, name: item.name })));
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Fetch brief logs (server-side paginated)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const filters: Record<string, any> = {};
        if (id) filters.brief_id = id;
        const res = await listBriefLogs(currentPage, itemsPerPage, filters);
        if (!mounted) return;
        setBriefLogs(res.data || []);
        const total = res.meta?.pagination?.total ?? res.meta?.total ?? 0;
        setTotalItems(Number(total || 0));
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setBriefLogs([]);
        setTotalItems(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentPage, id]);

  // Filter logs locally (search only applies to current page of results)
  const filteredLogs = useMemo(() => {
    let filtered = briefLogs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) =>
        (log.brief_name || '').toString().toLowerCase().includes(query) ||
        (log.action || '').toString().toLowerCase().includes(query) ||
        (log.description || '').toString().toLowerCase().includes(query) ||
        (log.budget || '').toString().toLowerCase().includes(query) ||
        (log.brand_name || '').toString().toLowerCase().includes(query) ||
        (log.product_name || '').toString().toLowerCase().includes(query) ||
        ((log.contact_person && (log.contact_person as any).name) || '').toString().toLowerCase().includes(query) ||
        (log.mode_of_campaign || '').toString().toLowerCase().includes(query) ||
        (log.media_type || '').toString().toLowerCase().includes(query) ||
        (log.priority || '').toString().toLowerCase().includes(query) ||
        (log.status || '').toString().toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, briefLogs]);

  // current page logs come from server; apply local search above
  const currentLogs = filteredLogs;

  const columns: Column<BriefLogItem>[] = [
    {
      key: 'brief_id',
      header: 'Brief Id',
      render: (item) => `#${item.brief_id ?? item.id}`,
    },
    {
      key: 'brief_name',
      header: 'Brief Name',
      render: (item) => item.brief_name || item.name || `Brief #${item.brief_id ?? item.id}`,
    },
    {
      key: 'brand_name',
      header: 'Brand Name',
      render: (item) => item.brand_name || item.brand?.name || 'N/A',
    },
    {
      key: 'product_name',
      header: 'Product Name',
      render: (item) => item.product_name || 'N/A',
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      render: (item) => item.contact_person || 'N/A',
    },
    {
      key: 'mode_of_campaign',
      header: 'Mode Of Campaign',
      render: (item) => item.mode_of_campaign || 'N/A',
    },
    {
      key: 'media_type',
      header: 'Media Type',
      render: (item) => item.media_type || 'N/A',
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => item.priority || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        // Show dropdown with planner statuses, default to '-' if null
        const status = item.planner_status;
        let statusValue: string = '-';
        if (status && typeof status === 'object' && 'name' in status) {
          statusValue = String(status.name);
        } else if (typeof status === 'string' || typeof status === 'number') {
          statusValue = String(status);
        }
        return (
          <div className="min-w-[140px]">
            <StatusDropdown
              value={statusValue}
              options={statusOptions.map(opt => opt.name)}
              onChange={(newStatus: string) => handleSelectStatus(item.id.toString(), newStatus)}
              onConfirm={handleStatusConfirm}
            />
          </div>
        );
      },
      className: 'min-w-[140px]',
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (item) => {
        const val = typeof item.budget === 'string' ? parseFloat(item.budget) : (item.budget as any) || 0;
        return val ? `₹${Number(val).toLocaleString()}` : 'N/A';
      },
    },
    {
      key: 'description',
      header: 'Brief Detail',
      render: (item) => item.comment || item.description,
      className: 'truncate',
    },
    {
      key: 'created_at',
      header: 'Submission Date & Time',
      render: (item) => {
        const dateStr = item.submission_date || item.created_at;
        if (!dateStr) return 'N/A';
        // Parse date by taking YYYY-MM-DD HH:mm:ss part, ignoring AM/PM
        const parts = dateStr.split(' ');
        const dateTime = parts.slice(0, 2).join(' ');
        return new Date(dateTime).toLocaleString();
      },
    },
    {
      key: 'action',
      header: 'Left Time',
      render: (item) => {
        if (item.left_time) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.left_time}
            </span>
          );
        }
        const now = new Date();
        const created = new Date(item.created_at || Date.now());
        const diffTime = now.getTime() - created.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {diffDays} days
          </span>
        );
      },
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSelectStatus = (id: string | null, newStatus: string) => {
    // For demo purposes, we'll just log the change
    // In a real app, this would update the status via API
    console.log(`Changing status for log ${id} to ${newStatus}`);
    // You could update the mock data here if needed
  };

  const handleStatusConfirm = async (newStatus: string) => {
    // Confirmation handler for status change
    console.log(`Confirmed status change to ${newStatus}`);
  };

  const handleEdit = (item: BriefLogItem) => {
    navigate(`/brief/edit-submitted-plan/${item.brief_id || item.id}`);
  };
  
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <>
      <MasterHeader
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: 'Brief', path: '/brief' },
          { label: 'Brief Log', isActive: true }
        ]}
        showCreateButton={false}
        onCreateClick={() => {}}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {id ? `Brief Log - Brief #${id}` : 'Brief Log'}
          </h2>
          <SearchBar
            delay={0}
            placeholder="Search logs..."
            onSearch={handleSearch}
          />
        </div>

        <div className="pt-0 overflow-visible">
          <Table
            data={currentLogs}
            startIndex={startIndex}
            loading={loading}
            desktopOnMobile={true}
            keyExtractor={(it: BriefLogItem, idx: number) => `${it.id}-${idx}`}
            columns={columns}
            onEdit={(item: BriefLogItem) => handleEdit(item)}
            onView={(item: BriefLogItem) => navigate(ROUTES.BRIEF.PLAN_HISTORY((item.brief_id || item.id).toString()))}
            onUpload={(item: BriefLogItem) => navigate(`/brief/plan-submission/${item.brief_id || item.id}`)}
          />
        </div>
      </div>

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default BriefLog;