import React, { useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';

interface User {
  id: string;
  name: string;
  lastLogin: string;
  created: string;
  status: 'Active' | 'Inactive';
  role: string;
  email: string;
}

const mockUsers: User[] = [
  {
    id: '#USR001',
    name: 'Mayank Sharma',
    lastLogin: '7:32pm',
    created: '01/01/2024',
    status: 'Active',
    role: 'S-Admin',
    email: 'admin@gmail.com',
  },
  {
    id: '#USR002',
    name: 'Anuj',
    lastLogin: '7:32pm',
    created: '01/01/2024',
    status: 'Active',
    role: 'Admin',
    email: 'admin@gmail.com',
  },
  {
    id: '#USR003',
    name: 'Shivalika',
    lastLogin: '7:32pm',
    created: '01/01/2024',
    status: 'Active',
    role: 'BDM',
    email: 'bdm@gmail.com',
  },
  {
    id: '#USR004',
    name: 'Manraj',
    lastLogin: '7:32pm',
    created: '01/01/2024',
    status: 'Active',
    role: 'S-BDM',
    email: 'bdm@gmail.com',
  },
  {
    id: '#USR005',
    name: 'Olivia Rhye',
    lastLogin: '7:32pm',
    created: '01/01/2024',
    status: 'Inactive',
    role: 'Planner',
    email: 'planner@gmail.com',
  },
];

const AllUsers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [users] = useState<User[]>(mockUsers);

  // Filter users by search query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.id.toLowerCase().startsWith(q) ||
      u.name.toLowerCase().startsWith(q) ||
      u.email.toLowerCase().startsWith(q) ||
      u.role.toLowerCase().startsWith(q)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + itemsPerPage).map((user, index) => ({
    ...user,
    srNo: startIndex + index + 1,
  }));

  const navigate = useNavigate();

  const handleCreateUser = () => navigate(ROUTES.USER.CREATE);

  const handleEdit = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.USER.EDIT(cleanId));
  };

  const handleView = (id: string) => {
    const cleanId = id.replace('#', '');
    navigate(ROUTES.USER.DETAIL(cleanId));
  };

  const getStatusBadgeColor = (status: 'Active' | 'Inactive') => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColorMap: Record<string, string> = {
      'S-Admin': 'border-purple-300 text-purple-700 bg-purple-50',
      'Admin': 'border-blue-300 text-blue-700 bg-blue-50',
      'BDM': 'border-orange-300 text-orange-700 bg-orange-50',
      'S-BDM': 'border-yellow-300 text-yellow-700 bg-yellow-50',
      'Planner': 'border-pink-300 text-pink-700 bg-pink-50',
    };
    return roleColorMap[role] || 'border-gray-300 text-gray-700 bg-gray-50';
  };

  const columns = ([
    {
      key: 'srNo',
      header: 'S. No.',
      render: (it: User & { srNo: number }) => it.srNo,
      className: 'text-left whitespace-nowrap',
    },
    {
      key: 'name',
      header: 'User',
      render: (it: User) => it.name,
      className: 'max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap',
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (it: User) => it.lastLogin,
      className: 'text-center whitespace-nowrap',
    },
    {
      key: 'created',
      header: 'Created',
      render: (it: User) => it.created,
      className: 'text-center whitespace-nowrap',
    },
    {
      key: 'status',
      header: 'Status',
      render: (it: User) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center justify-center h-7 px-3 border border-transparent rounded-full text-xs font-medium leading-tight whitespace-nowrap ${getStatusBadgeColor(
              it.status
            )}`}
          >
            {it.status}
          </span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'role',
      header: 'Role',
      render: (it: User) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center justify-center h-7 px-3 border rounded-full text-xs font-medium leading-tight whitespace-nowrap ${getRoleBadgeColor(
              it.role
            )}`}
          >
            {it.role}
          </span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'email',
      header: 'Email',
      render: (it: User) => it.email,
      className: 'max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap',
    },
  ] as Column<User>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <MasterHeader
        onCreateClick={handleCreateUser}
        createButtonLabel="Add User"
        breadcrumbItems={[{ label: 'User Management', path: '/user-management' }]}
        currentPageTitle="User"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Team Members</h2>
          <div className="ml-4">
            <SearchBar
              placeholder="Search users..."
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
          keyExtractor={(it: User) => it.id}
          columns={columns}
          onEdit={(it: User) => handleEdit(it.id)}
          onView={(it: User) => handleView(it.id)}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />
    </div>
  );
};

export default AllUsers;
