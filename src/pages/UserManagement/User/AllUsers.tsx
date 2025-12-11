import React, { useEffect, useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { listUsers, deleteUser, type User } from '../../../services/AllUsers';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const AllUsers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      alert('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Show confirm dialog instead of window.confirm
  const handleDeleteRequest = (user: User) => {
    setDeleteTarget(user);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      setConfirmOpen(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete user', err);
      alert('Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
    setDeleteLoading(false);
  };
      // ...existing code...

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

  // Map role name/display_name to color classes
  const getRoleBadgeColor = (roleName?: string) => {
    const roleColorMap: Record<string, string> = {
      'Manager': 'border-blue-300 text-blue-700 bg-blue-50',
      'Super Admin': 'border-purple-300 text-purple-700 bg-purple-50',
      'Admin': 'border-green-300 text-green-700 bg-green-50',
      'BDM': 'border-orange-300 text-orange-700 bg-orange-50',
      'S-BDM': 'border-yellow-300 text-yellow-700 bg-yellow-50',
      'Planner': 'border-pink-300 text-pink-700 bg-pink-50',
    };
    return (roleName && roleColorMap[roleName]) || 'border-gray-300 text-gray-700 bg-gray-50';
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
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.isArray(it.roles) && it.roles.length > 0 ? (
            it.roles.map((role: any) => (
              <span
                key={role.id || role.name}
                className={`inline-flex items-center justify-center h-7 px-3 border rounded-full text-xs font-medium leading-tight whitespace-nowrap ${getRoleBadgeColor(role.display_name || role.name)}`}
              >
                {role.display_name || role.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
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

        <div className="pt-0 overflow-visible">
          <Table
            data={users}
            startIndex={(currentPage - 1) * itemsPerPage}
            loading={loading}
            desktopOnMobile={true}
            keyExtractor={(it: User) => it.id}
            columns={columns}
            onEdit={(it: User) => handleEdit(it.id)}
            onView={(it: User) => handleView(it.id)}
            onDelete={(it: User) => handleDeleteRequest(it)}
          />
          {/* ConfirmDialog for delete */}
          <ConfirmDialog
            isOpen={confirmOpen}
            title="Delete User?"
            message={deleteTarget ? `Are you sure you want to delete user \"${deleteTarget.name}\"? This action cannot be undone.` : ''}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            loading={deleteLoading}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
          />
        </div>
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
