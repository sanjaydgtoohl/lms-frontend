import React, { useState } from 'react';
import { Edit, ChevronLeft, ChevronRight, Plus, Eye, Trash } from 'lucide-react';
import Button from '../components/ui/Button';

interface Department {
  id: string;
  name: string;
  dateTime: string;
}

const DepartmentMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data as requested
  const departments: Department[] = [
    { id: '#CMPR01', name: 'Department 1', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR01', name: 'Department 2', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR01', name: 'Department 3', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR01', name: 'Department 4', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR01', name: 'Department 5', dateTime: '02-07-2025 22:23' },
  ];

  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = departments.slice(startIndex, endIndex);

  const handleCreateDepartment = () => {
    console.log('Create new department');
    // Add your create department logic here
  };

  const handleEdit = (id: string) => {
    console.log('Edit department:', id);
  };

  const handleView = (id: string) => {
    console.log('View department:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete department:', id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${i === currentPage
              ? 'bg-green-100 text-black'
              : 'text-[var(--text-secondary)] hover:text-black hover:bg-green-50'
            }
          `}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[var(--text-secondary)]">
          Showing {startIndex + 1} to {Math.min(endIndex, departments.length)} of {departments.length} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-[var(--text-secondary)] hover:text-black hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {pages}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-[var(--text-secondary)] hover:text-black hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[var(--accent)] px-6 py-4 border-b border-[var(--border-color)]">
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Edit Department"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleView(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="View Department"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Delete Department"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleView(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
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
      {renderPagination()}
    </div>
  );
};

export default DepartmentMaster;
