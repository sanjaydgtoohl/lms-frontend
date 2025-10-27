import React, { useState } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import ActionMenu from '../components/ui/ActionMenu';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';

interface Department {
  id: string;
  name: string;
  dateTime: string;
}

// Inline CreateDepartmentForm (keeps behavior local and matches BrandMaster usage)
const CreateDepartmentForm: React.FC<{
  onClose: () => void;
  onSave?: (data: any) => void;
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department Name is required');
      return;
    }
    if (onSave) {
      onSave({ name, dateTime: formatDateTime(new Date()) });
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="w-full bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create Department</h3>
      </div>

      <div className="p-6 bg-[#F9FAFB]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Department Name *</label>
            <input
              name="departmentName"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter department name"
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 text-[var(--text-secondary)] hover:text-black"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Department Master</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[#066a6d] shadow-sm"
            >
              Save Department
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const DepartmentMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // store departments in state so we can add new ones
  const [departments, setDepartments] = useState<Department[]>([
    { id: '#CMPR01', name: 'Department 1', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR02', name: 'Department 2', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR03', name: 'Department 3', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR04', name: 'Department 4', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR05', name: 'Department 5', dateTime: '02-07-2025 22:23' },
  ]);

  const [showCreate, setShowCreate] = useState(false);

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = departments.slice(startIndex, endIndex);

  const handleCreateDepartment = () => {
    setShowCreate(true);
  };

  const handleSaveDepartment = (data: any) => {
    const newDept: Department = {
      id: `#CMPR${Math.floor(Math.random() * 90000) + 10000}`,
      name: data.name || 'Untitled',
      dateTime: data.dateTime || new Date().toLocaleString(),
    };

    setDepartments(prev => [newDept, ...prev]);
    setCurrentPage(1);
  };

  const handleEdit = (id: string) => {
    const found = departments.find(d => d.id === id) || null;
    setEditItem(found);
  };

  const handleView = (id: string) => {
    const found = departments.find(d => d.id === id) || null;
    setViewItem(found);
  };

  const handleDelete = (id: string) => {
    console.log('Delete department:', id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [viewItem, setViewItem] = useState<Department | null>(null);
  const [editItem, setEditItem] = useState<Department | null>(null);

  const handleSaveEditedDepartment = (updated: Record<string, any>) => {
    setDepartments(prev => prev.map(d => (d.id === updated.id ? { ...d, ...updated } as Department : d)));
  };



  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateDepartmentForm onClose={() => setShowCreate(false)} onSave={handleSaveDepartment} />
      ) : viewItem ? (
        <MasterView title={`View Department ${viewItem.id}`} item={viewItem} onClose={() => setViewItem(null)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Department ${editItem.id}`} item={editItem} onClose={() => setEditItem(null)} onSave={handleSaveEditedDepartment} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Department Master</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="master"
                      size="sm"
                      onClick={handleCreateDepartment}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Department</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Department ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Department Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {currentData.map((item, index) => (
                      <tr 
                        key={`${item.id}-${index}`} 
                        className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {item.dateTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ActionMenu
                            isLast={index >= currentData.length - 2}
                            onEdit={() => handleEdit(item.id)}
                            onView={() => handleView(item.id)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Department Master</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateDepartment}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Department</span>
                  </Button>
                </div>
              </div>
            </div>

            {currentData.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
                  <ActionMenu
                    isLast={index >= currentData.length - 2}
                    onEdit={() => handleEdit(item.id)}
                    onView={() => handleView(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Department Name:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                    <span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={departments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default DepartmentMaster;

