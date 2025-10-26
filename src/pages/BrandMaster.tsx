import React, { useState } from 'react';
import CreateBrandForm from './CreateBrandForm';
import { Edit, Plus, ChevronLeft, ChevronRight, Eye, Trash } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  agencyName: string;
  brandType: string;
  contactPerson: string;
  industry: string;
  country: string;
  state: string;
  city: string;
  zone: string;
  pinCode: string;
  dateTime: string;
}

const BrandMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data as requested (stored in state so new items can be added)
  const [brands, setBrands] = useState<Brand[]>([
    { 
      id: '#CMPR01', 
      name: 'Nike', 
      agencyName: 'Agency 1', 
      brandType: 'National', 
      contactPerson: '2', 
      industry: 'Moter', 
      country: 'India', 
      state: 'Maharastra', 
      city: 'Pune', 
      zone: 'West', 
      pinCode: '328001', 
      dateTime: '02-07-2025 22:23' 
    },
    { 
      id: '#CMPR02', 
      name: 'Puma', 
      agencyName: 'Agency 1', 
      brandType: 'Local', 
      contactPerson: '3', 
      industry: 'Moter', 
      country: 'India', 
      state: 'Maharastra', 
      city: 'Pune', 
      zone: 'West', 
      pinCode: '328001', 
      dateTime: '02-07-2025 22:21' 
    },
    { 
      id: '#CMPR03', 
      name: 'Apple', 
      agencyName: 'Direct', 
      brandType: 'Local', 
      contactPerson: '5', 
      industry: 'Moter', 
      country: 'India', 
      state: 'Maharastra', 
      city: 'Pune', 
      zone: 'East', 
      pinCode: '328001', 
      dateTime: '02-07-2025 22:23' 
    },
    { 
      id: '#CMPR04', 
      name: 'Pepsi', 
      agencyName: 'Agency 2', 
      brandType: 'Regional', 
      contactPerson: '3', 
      industry: 'Moter', 
      country: 'India', 
      state: 'Maharastra', 
      city: 'Pune', 
      zone: 'West', 
      pinCode: '328001', 
      dateTime: '02-07-2025 22:23' 
    },
    { 
      id: '#CMPR05', 
      name: 'Coca Cola', 
      agencyName: 'Agency 2', 
      brandType: 'Regional', 
      contactPerson: '6', 
      industry: 'Moter', 
      country: 'India', 
      state: 'Maharastra', 
      city: 'Pune', 
      zone: 'East', 
      pinCode: '328001', 
      dateTime: '02-07-2025 22:23' 
    },
  ]);

  const totalPages = Math.ceil(brands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = brands.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    console.log('Edit brand:', id);
  };

  const handleView = (id: string) => {
    console.log('View brand:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete brand:', id);
  };

  const handleCreateBrand = () => {
    setShowCreate(true);
  };

  const [showCreate, setShowCreate] = useState(false);

  const formatDateTime = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const handleSaveBrand = (data: any) => {
    const newBrand: Brand = {
      id: `#CMPR${Math.floor(Math.random() * 90000) + 10000}`,
      name: data.brandName || 'Untitled',
      agencyName: data.agency || 'Direct',
      brandType: data.brandType || '',
      contactPerson: '0',
      industry: data.industry || '',
      country: data.country || '',
      state: data.state || '',
      city: data.city || '',
      zone: data.zone || '',
      pinCode: data.postalCode || '',
      dateTime: formatDateTime(new Date()),
    };

    // Add new brand to top of list and reset to first page so user sees it
    setBrands(prev => [newBrand, ...prev]);
    setCurrentPage(1);
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
          Showing {startIndex + 1} to {Math.min(endIndex, brands.length)} of {brands.length} entries
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
  <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateBrandForm inline onClose={() => setShowCreate(false)} onSave={handleSaveBrand} />
      ) : (
        <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-[var(--accent)] px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brand Master</h2>
            <button
              onClick={handleCreateBrand}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Brand</span>
            </button>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto max-w-full w-full">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Brand ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Brand Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Agency Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Brand Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Contact Person
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    State
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Zone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    PinCode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {currentData.map((item, index) => (
                  <tr 
                    key={item.id + item.name + index}
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.agencyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.brandType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.contactPerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.zone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                      {item.pinCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {item.dateTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Edit Brand"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleView(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="View Brand"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                          title="Delete Brand"
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
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brand Master</h2>
            <button
              onClick={handleCreateBrand}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        
        {currentData.map((item, index) => (
          <div 
            key={item.id + item.name + index}
            className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="Edit Brand"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleView(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="View Brand"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:scale-105 transform transition-all duration-200"
                  title="Delete Brand"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Brand Name:</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Agency:</span>
                <span className="text-sm text-[var(--text-primary)]">{item.agencyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Type:</span>
                <span className="text-sm text-[var(--text-primary)]">{item.brandType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Industry:</span>
                <span className="text-sm text-[var(--text-primary)]">{item.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Location:</span>
                <span className="text-sm text-[var(--text-primary)]">{item.city}, {item.state}</span>
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
        </>
      )}
    </div>
  );
};

export default BrandMaster;
