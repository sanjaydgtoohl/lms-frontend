import React, { useEffect, useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { listUsers, type User } from '../../../services/AllUsers';

const AllUsers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await listUsers(currentPage, itemsPerPage, searchQuery);
      const data = (res.data || []).map((it: any, idx: number) => ({
        ...it,
        srNo: (currentPage - 1) * itemsPerPage + idx + 1,
      }));
      setUsers(data);
      const total = res.meta?.pagination?.total ?? res.meta?.total ?? data.length;
      setTotalItems(Number(total || 0));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch users', err);
      setUsers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

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

  const getStatusBadgeColor = (status?: 'Active' | 'Inactive') => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getRoleBadgeColor = (role?: string) => {
    const roleColorMap: Record<string, string> = {
      'S-Admin': 'border-purple-300 text-purple-700 bg-purple-50',
      'Admin': 'border-blue-300 text-blue-700 bg-blue-50',
      'BDM': 'border-orange-300 text-orange-700 bg-orange-50',
      'S-BDM': 'border-yellow-300 text-yellow-700 bg-yellow-50',
      'Planner': 'border-pink-300 text-pink-700 bg-pink-50',
    };
    return (role && roleColorMap[role]) || 'border-gray-300 text-gray-700 bg-gray-50';
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
          data={users}
          startIndex={(currentPage - 1) * itemsPerPage}
          loading={loading}
          keyExtractor={(it: User) => it.id}
          columns={columns}
          onEdit={(it: User) => handleEdit(it.id)}
          onView={(it: User) => handleView(it.id)}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={(p: number) => setCurrentPage(p)}
      />
    </div>
  );
};

export default AllUsers;
