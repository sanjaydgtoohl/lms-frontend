import React, { useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';

interface Role {
  id: string;
  name: string;
  description: string;
}

const mockRoles: Role[] = [
  { id: '#RL001', name: 'Admin', description: 'Full system access with all permissions and settings control' },
  { id: '#RL002', name: 'BDM', description: 'Business Development Manager with lead and campaign management access' },
  { id: '#RL003', name: 'Manager', description: 'Manager with team oversight and reporting access' },
  { id: '#RL004', name: 'User', description: 'Standard user with basic access to assigned features' },
  { id: '#RL005', name: 'Super Admin', description: 'Super Administrator with system-wide control and user management access' },
];

const AllRoles: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [roles] = useState<Role[]>(mockRoles);

  // Filter roles by search query
  const filteredRoles = roles.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toLowerCase().startsWith(q) ||
      r.name.toLowerCase().startsWith(q) ||
      r.description.toLowerCase().startsWith(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredRoles.slice(startIndex, startIndex + itemsPerPage).map((role, index) => ({
    ...role,
    srNo: startIndex + index + 1,
  }));

  const navigate = useNavigate();

  const handleCreateRole = () => navigate(ROUTES.ROLE.CREATE);
  
  const handleEdit = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.ROLE.EDIT(cleanId));
  };

  const handleView = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.ROLE.DETAIL(cleanId));
  };

  const columns = ([
    { 
      key: 'srNo', 
      header: 'S. No.', 
      render: (it: Role & { srNo: number }) => it.srNo,
      className: 'text-left whitespace-nowrap' 
    },
    { key: 'name', header: 'Name', render: (it: Role) => it.name, className: 'max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'description', header: 'Description', render: (it: Role) => it.description, className: 'max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap' },
  ] as Column<Role>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={handleCreateRole}
        createButtonLabel="Create Role"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Roles</h2>
          <div className="ml-4">
            <SearchBar
              placeholder="Search roles..."
              delay={0}
              onSearch={(q: string) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <Table
          data={currentData}
          startIndex={startIndex}
          loading={false}
          keyExtractor={(it: Role) => it.id}
          columns={columns}
          onEdit={(it: Role) => handleEdit(it.id)}
          onView={(it: Role) => handleView(it.id)}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredRoles.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />
    </div>
  );
};

export default AllRoles;
