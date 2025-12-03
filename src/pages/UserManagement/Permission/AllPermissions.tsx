import React, { useEffect, useState } from 'react';
import Table, { type Column } from '../../../components/ui/Table';
import Pagination from '../../../components/ui/Pagination';
import SearchBar from '../../../components/ui/SearchBar';
import { MasterHeader } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { listPermissions, deletePermission } from '../../../services/AllPermissions';
import { showSuccess, showError } from '../../../utils/notifications';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

interface Permission {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  srNo?: number;
}

const AllPermissions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Fetch permissions from API
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await listPermissions(currentPage, itemsPerPage, searchQuery);
      const data = (res.data || []).map((it: any, idx: number) => ({
        ...it,
        srNo: (currentPage - 1) * itemsPerPage + idx + 1,
      }));
      setPermissions(data);
      // Try different meta locations depending on backend
      const total = res.meta?.pagination?.total ?? res.meta?.total ?? data.length;
      setTotalItems(Number(total || 0));
    } catch (err) {
      // keep console error for now; UI-level notifications can be added
      // eslint-disable-next-line no-console
      console.error('Failed to fetch permissions', err);
      setPermissions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const navigate = useNavigate();

  const handleCreatePermission = () => navigate(ROUTES.PERMISSION.CREATE);
  
  const extractNumericId = (id: string) => {
    if (!id) return id;
    const digits = String(id).replace(/\D/g, '');
    return digits ? String(Number(digits)) : id.replace(/^#/, '');
  };

  const handleEdit = (id: string) => {
    const cleanId = extractNumericId(id);
    navigate(ROUTES.PERMISSION.EDIT(cleanId));
  };

  const handleView = (id: string) => {
    const cleanId = extractNumericId(id);
    navigate(ROUTES.PERMISSION.DETAIL(cleanId));
  };

  const handleDelete = async (id: string) => {
    const found = permissions.find(p => p.id === id);
    setConfirmDeleteId(id);
    setConfirmDeleteLabel(found ? (found.display_name || found.name || String(found.id)) : id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deletePermission(confirmDeleteId);
      showSuccess('Permission deleted successfully');
      setCurrentPage(1);
      // Reload the table from API
      await fetchPermissions();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete permission', err);
      showError(err?.message || 'Failed to delete permission');
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

  const columns = ([
    { 
      key: 'srNo', 
      header: 'S. No.', 
      render: (it: Permission & { srNo: number }) => it.srNo,
      className: 'text-left whitespace-nowrap' 
    },
    { key: 'display_name', header: 'Name', render: (it: Permission) => it.display_name || it.name, className: 'max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap' },
    { key: 'description', header: 'Description', render: (it: Permission) => it.description, className: 'max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap' },
  ] as Column<Permission>[]);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={`Delete permission "${confirmDeleteLabel}"?`}
        message="This action will permanently remove the permission. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <MasterHeader
        onCreateClick={handleCreatePermission}
        createButtonLabel="Create Permission"
      />
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">All Permissions</h2>
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

        <div className="pt-0 overflow-visible">
          <Table
            data={permissions}
            startIndex={(currentPage - 1) * itemsPerPage}
            loading={loading}
            desktopOnMobile={true}
            keyExtractor={(it: Permission) => it.id}
            columns={columns}
            onEdit={(it: Permission) => handleEdit(it.id)}
            onView={(it: Permission) => handleView(it.id)}
            onDelete={(it: Permission) => handleDelete(it.id)}
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

export default AllPermissions;
