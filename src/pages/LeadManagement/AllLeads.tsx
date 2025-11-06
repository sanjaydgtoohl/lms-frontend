import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Table, { type Column } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { useNavigate } from 'react-router-dom';

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
];

const AllLeads: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [leads] = useState<Lead[]>(mockLeads);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = leads.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();

  const handleCreateLead = () => navigate('/lead-management/create');
  const handleEdit = (id: string) => navigate(`/lead-management/edit/${id}`);

  const columns = ([
    { key: 'id', header: 'Lead ID', render: (it: Lead) => it.id, className: 'text-left' },
    { key: 'brandName', header: 'Brand Name', render: (it: Lead) => it.brandName, className: 'max-w-[180px] overflow-hidden text-ellipsis' },
    { key: 'contactPerson', header: 'Contact Person', render: (it: Lead) => it.contactPerson, className: 'max-w-[160px] overflow-hidden text-ellipsis' },
    { key: 'phoneNumber', header: 'Phone Number', render: (it: Lead) => it.phoneNumber },
    { key: 'source', header: 'Source', render: (it: Lead) => it.source },
    { key: 'subSource', header: 'Sub-Source', render: (it: Lead) => it.subSource },
    { key: 'assignBy', header: 'Assign By', render: (it: Lead) => it.assignBy },
    { key: 'assignTo', header: 'Assign To', render: (it: Lead) => it.assignTo },
    { key: 'dateTime', header: 'Date & Time', render: (it: Lead) => it.dateTime },
    { key: 'status', header: 'Status', render: (it: Lead) => it.status },
    { key: 'callStatus', header: 'Call Status', render: (it: Lead) => it.callStatus },
    { key: 'callAttempt', header: 'Call Attempt', render: (it: Lead) => String(it.callAttempt) },
    { key: 'comment', header: 'Comment', render: (it: Lead) => it.comment, className: 'max-w-[220px] overflow-hidden text-ellipsis' },
  ] as Column<Lead>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Leads</h2>
          <button
            onClick={handleCreateLead}
            className="flex items-center justify-center space-x-2 px-4 py-2 btn-primary text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lead</span>
          </button>
        </div>

        <Table
          data={currentData}
          startIndex={startIndex}
          loading={false}
          keyExtractor={(it: Lead) => it.id}
          columns={columns}
          onEdit={(it: Lead) => handleEdit(it.id)}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={leads.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />
    </div>
  );
};

export default AllLeads;
