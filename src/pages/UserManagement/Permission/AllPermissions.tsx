import React, { useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';

interface Permission {
  id: string;
  name: string;
  description: string;
}

const mockPermissions: Permission[] = [
  { id: '#PM001', name: 'User Read', description: 'Allows viewing user information and profiles' },
  { id: '#PM002', name: 'User Create', description: 'Allows creating new user accounts' },
  { id: '#PM003', name: 'User Update', description: 'Allows updating user information' },
  { id: '#PM004', name: 'User Delete', description: 'Allows deleting user accounts' },
  { id: '#PM005', name: 'Profile Read', description: 'Allows viewing user profile details' },
  { id: '#PM006', name: 'Permission Read', description: 'Allows viewing permission information' },
  { id: '#PM007', name: 'Permission Create', description: 'Allows creating new permissions' },
  { id: '#PM008', name: 'Permission Update', description: 'Allows updating permissions' },
  { id: '#PM009', name: 'Permission Delete', description: 'Allows deleting permissions' },
  { id: '#PM010', name: 'Role Read', description: 'Allows viewing role information' },
];

const AllPermissions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [permissions] = useState<Permission[]>(mockPermissions);

  // Filter permissions by search query
  const filteredPermissions = permissions.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.id.toLowerCase().startsWith(q) ||
      p.name.toLowerCase().startsWith(q) ||
      p.description.toLowerCase().startsWith(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredPermissions.slice(startIndex, startIndex + itemsPerPage).map((perm, index) => ({
    ...perm,
    srNo: startIndex + index + 1,
  }));

  const navigate = useNavigate();

  const handleCreatePermission = () => navigate(ROUTES.PERMISSION.CREATE);
  
  const handleEdit = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.PERMISSION.EDIT(cleanId));
  };

  const handleView = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.PERMISSION.DETAIL(cleanId));
  };

  const columns = ([
    { 
      key: 'srNo', 
      header: 'S. No.', 
      render: (it: Permission & { srNo: number }) => it.srNo,
      className: 'text-left whitespace-nowrap' 
    },
    { key: 'name', header: 'Name', render: (it: Permission) => it.name, className: 'max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'description', header: 'Description', render: (it: Permission) => it.description, className: 'max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap' },
  ] as Column<Permission>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={handleCreatePermission}
        createButtonLabel="Create Permission"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Permissions</h2>
          <div className="ml-4">
            <SearchBar
              placeholder="Search permissions..."
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
          keyExtractor={(it: Permission) => it.id}
          columns={columns}
          onEdit={(it: Permission) => handleEdit(it.id)}
          onView={(it: Permission) => handleView(it.id)}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredPermissions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />
    </div>
  );
};

export default AllPermissions;
