
import React, { useState, useMemo } from 'react';
import Pagination from '../../components/ui/Pagination';
import Table, { type Column } from '../../components/ui/Table';
import { useParams, useNavigate } from 'react-router-dom';
import MasterHeader from '../../components/ui/MasterHeader';
import SearchBar from '../../components/ui/SearchBar';
import StatusDropdown from '../../components/ui/StatusDropdown';
import { ROUTES } from '../../constants';

interface BriefLogItem {
  id: number;
  brief_id: number;
  action: string;
  description: string;
  user_name: string;
  created_at: string;
  brief_name?: string;
  budget?: number;
  brand_name?: string;
  product_name?: string;
  contact_person?: string;
  mode_of_campaign?: string;
  media_type?: string;
  priority?: string;
  status?: string;
}

// Static mock data for brief logs
const mockBriefLogs: BriefLogItem[] = [
  {
    id: 1,
    brief_id: 101,
    action: 'Created',
    description: 'Brief created for Product Launch Campaign',
    user_name: 'John Doe',
    created_at: '2024-01-20T10:30:00Z',
    brief_name: 'Product Launch Q1',
    budget: 500000,
    brand_name: 'TechCorp',
    product_name: 'New Gadget',
    contact_person: 'Alice Johnson',
    mode_of_campaign: 'Digital',
    media_type: 'Social Media',
    priority: 'High',
    status: 'Plan Submitted'
  },
  {
    id: 2,
    brief_id: 102,
    action: 'Updated',
    description: 'Budget updated from ₹500,000 to ₹750,000',
    user_name: 'Jane Smith',
    created_at: '2024-01-19T14:45:00Z',
    brief_name: 'Brand Awareness Campaign',
    budget: 750000,
    brand_name: 'FashionHub',
    product_name: 'Summer Collection',
    contact_person: 'Bob Lee',
    mode_of_campaign: 'Traditional',
    media_type: 'TV',
    priority: 'Medium',
    status: 'Plan Reviewed'
  },
  {
    id: 3,
    brief_id: 101,
    action: 'Assigned',
    description: 'Assigned to Marketing Team Lead',
    user_name: 'Mike Johnson',
    created_at: '2024-01-18T09:15:00Z',
    brief_name: 'Product Launch Q1',
    budget: 600000,
    brand_name: 'TechCorp',
    product_name: 'New Gadget',
    contact_person: 'Alice Johnson',
    mode_of_campaign: 'Digital',
    media_type: 'Social Media',
    priority: 'High',
    status: 'Plan Approved'
  },
  {
    id: 4,
    brief_id: 103,
    action: 'Status Changed',
    description: 'Status changed from Draft to In Review',
    user_name: 'Sarah Wilson',
    created_at: '2024-01-17T16:20:00Z',
    brief_name: 'Social Media Campaign',
    budget: 400000,
    brand_name: 'FoodieDelight',
    product_name: 'Organic Snacks',
    contact_person: 'Carol Davis',
    mode_of_campaign: 'Digital',
    media_type: 'Instagram',
    priority: 'Low',
    status: 'Plan Submitted'
  },
  {
    id: 5,
    brief_id: 104,
    action: 'Comment Added',
    description: 'Added comment: "Please include influencer partnerships"',
    user_name: 'David Brown',
    created_at: '2024-01-16T11:00:00Z',
    brief_name: 'Influencer Marketing',
    budget: 300000,
    brand_name: 'BeautyGlow',
    product_name: 'Skincare Line',
    contact_person: 'Eve Martinez',
    mode_of_campaign: 'Digital',
    media_type: 'TikTok',
    priority: 'High',
    status: 'Plan Reviewed'
  },
  {
    id: 6,
    brief_id: 102,
    action: 'Approved',
    description: 'Brief approved by Senior Management',
    user_name: 'Lisa Davis',
    created_at: '2024-01-15T13:30:00Z',
    brief_name: 'Brand Awareness Campaign',
    budget: 800000,
    brand_name: 'FashionHub',
    product_name: 'Summer Collection',
    contact_person: 'Bob Lee',
    mode_of_campaign: 'Traditional',
    media_type: 'TV',
    priority: 'Medium',
    status: 'Plan Approved'
  },
  {
    id: 7,
    brief_id: 105,
    action: 'Created',
    description: 'Brief created for Event Sponsorship',
    user_name: 'Tom Wilson',
    created_at: '2024-01-14T08:45:00Z',
    brief_name: 'Event Sponsorship 2024',
    budget: 450000,
    brand_name: 'SportsGear',
    product_name: 'Running Shoes',
    contact_person: 'Frank Garcia',
    mode_of_campaign: 'Event',
    media_type: 'On-site',
    priority: 'Medium',
    status: 'Plan Submitted'
  },
  {
    id: 8,
    brief_id: 103,
    action: 'Updated',
    description: 'Media type changed to Digital + Print',
    user_name: 'Emma Taylor',
    created_at: '2024-01-13T15:20:00Z',
    brief_name: 'Social Media Campaign',
    budget: 550000,
    brand_name: 'FoodieDelight',
    product_name: 'Organic Snacks',
    contact_person: 'Carol Davis',
    mode_of_campaign: 'Mixed',
    media_type: 'Digital + Print',
    priority: 'Low',
    status: 'Plan Reviewed'
  },
  {
    id: 9,
    brief_id: 106,
    action: 'Assigned',
    description: 'Assigned to Creative Director',
    user_name: 'Chris Anderson',
    created_at: '2024-01-12T10:10:00Z',
    brief_name: 'Website Redesign',
    budget: 700000,
    brand_name: 'TechCorp',
    product_name: 'Website',
    contact_person: 'Alice Johnson',
    mode_of_campaign: 'Digital',
    media_type: 'Web',
    priority: 'High',
    status: 'Plan Approved'
  },
  {
    id: 10,
    brief_id: 104,
    action: 'Status Changed',
    description: 'Status changed from In Review to Approved',
    user_name: 'Rachel Green',
    created_at: '2024-01-11T12:00:00Z',
    brief_name: 'Influencer Marketing',
    budget: 350000,
    brand_name: 'BeautyGlow',
    product_name: 'Skincare Line',
    contact_person: 'Eve Martinez',
    mode_of_campaign: 'Digital',
    media_type: 'TikTok',
    priority: 'High',
    status: 'Plan Submitted'
  },
  {
    id: 11,
    brief_id: 107,
    action: 'Created',
    description: 'Brief created for Email Marketing Campaign',
    user_name: 'Kevin Parker',
    created_at: '2024-01-10T09:30:00Z',
    brief_name: 'Email Newsletter Q1',
    budget: 250000,
    brand_name: 'RetailMax',
    product_name: 'Seasonal Sale',
    contact_person: 'Grace Kim',
    mode_of_campaign: 'Digital',
    media_type: 'Email',
    priority: 'Low',
    status: 'Plan Submitted'
  },
  {
    id: 12,
    brief_id: 105,
    action: 'Comment Added',
    description: 'Added comment: "Focus on ROI metrics"',
    user_name: 'Amanda White',
    created_at: '2024-01-09T14:15:00Z',
    brief_name: 'Event Sponsorship 2024',
    budget: 650000,
    brand_name: 'SportsGear',
    product_name: 'Running Shoes',
    contact_person: 'Frank Garcia',
    mode_of_campaign: 'Event',
    media_type: 'On-site',
    priority: 'Medium',
    status: 'Plan Reviewed'
  },
  {
    id: 13,
    brief_id: 106,
    action: 'Updated',
    description: 'Deadline extended by 2 weeks',
    user_name: 'Robert Lee',
    created_at: '2024-01-08T11:45:00Z',
    brief_name: 'Website Redesign',
    budget: 900000,
    brand_name: 'TechCorp',
    product_name: 'Website',
    contact_person: 'Alice Johnson',
    mode_of_campaign: 'Digital',
    media_type: 'Web',
    priority: 'High',
    status: 'Plan Reviewed'
  },
  {
    id: 14,
    brief_id: 108,
    action: 'Created',
    description: 'Brief created for Content Marketing',
    user_name: 'Sophie Martin',
    created_at: '2024-01-07T13:20:00Z',
    brief_name: 'Content Strategy 2024',
    budget: 200000,
    brand_name: 'EduLearn',
    product_name: 'Online Courses',
    contact_person: 'Henry Wilson',
    mode_of_campaign: 'Digital',
    media_type: 'Blog',
    priority: 'Medium',
    status: 'Plan Submitted'
  },
  {
    id: 15,
    brief_id: 107,
    action: 'Status Changed',
    description: 'Status changed from Draft to In Progress',
    user_name: 'Daniel Kim',
    created_at: '2024-01-06T16:30:00Z',
    brief_name: 'Email Newsletter Q1',
    budget: 1000000,
    brand_name: 'RetailMax',
    product_name: 'Seasonal Sale',
    contact_person: 'Grace Kim',
    mode_of_campaign: 'Digital',
    media_type: 'Email',
    priority: 'Low',
    status: 'Plan Submitted'
  }
];

const BriefLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Status options for the dropdown (same as filter options)
  const statusOptions = useMemo(() => {
    const statuses = mockBriefLogs
      .map(log => log.status)
      .filter((status): status is string => status !== undefined)
      .filter((value, index, self) => self.indexOf(value) === index);
    return statuses.map(status => ({ id: status, name: status }));
  }, []);

  // Filter logs based on search query and brief ID
  const filteredLogs = useMemo(() => {
    let filtered = mockBriefLogs;

    // Filter by brief ID if provided
    if (id) {
      filtered = filtered.filter(log => log.brief_id === parseInt(id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.brief_name?.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        (log.budget && log.budget.toString().includes(query)) ||
        log.brand_name?.toLowerCase().includes(query) ||
        log.product_name?.toLowerCase().includes(query) ||
        log.contact_person?.toLowerCase().includes(query) ||
        log.mode_of_campaign?.toLowerCase().includes(query) ||
        log.media_type?.toLowerCase().includes(query) ||
        log.priority?.toLowerCase().includes(query) ||
        log.status?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, id]);

  const totalItems = filteredLogs.length;

  // Get current page data
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const columns: Column<BriefLogItem>[] = [
    {
      key: 'brief_id',
      header: 'Brief Id',
      render: (item) => item.brief_id,
    },
    {
      key: 'brief_name',
      header: 'Brief Name',
      render: (item) => item.brief_name || `Brief #${item.brief_id}`,
    },
    {
      key: 'brand_name',
      header: 'Brand Name',
      render: (item) => item.brand_name || 'N/A',
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
      render: (item) => (
        <div className="min-w-[140px]">
          <StatusDropdown
            value={item.status || ''}
            options={statusOptions.map(opt => opt.name)}
            onChange={(newStatus: string) => handleSelectStatus(item.id.toString(), newStatus)}
            onConfirm={handleStatusConfirm}
          />
        </div>
      ),
      className: 'min-w-[140px]',
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (item) => item.budget ? `₹${item.budget.toLocaleString()}` : 'N/A',
    },
    {
      key: 'description',
      header: 'Brief Detail',
      render: (item) => item.description,
      className: 'truncate',
    },
    {
      key: 'created_at',
      header: 'Submission Date & Time',
      render: (item) => new Date(item.created_at).toLocaleString(),
    },
    {
      key: 'action',
      header: 'Left Time',
      render: (item) => {
        const now = new Date();
        const created = new Date(item.created_at);
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
    navigate(`/brief/edit-submitted-plan/${item.brief_id}`);
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
            loading={false}
            desktopOnMobile={true}
            keyExtractor={(it: BriefLogItem, idx: number) => `${it.id}-${idx}`}
            columns={columns}
            onEdit={(item: BriefLogItem) => handleEdit(item)}
            onView={(item: BriefLogItem) => navigate(ROUTES.BRIEF.PLAN_HISTORY(item.brief_id.toString()))}
            onUpload={() => navigate('/brief/plan-submission')}
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