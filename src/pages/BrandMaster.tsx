import React, { useState, useEffect } from 'react';
import CreateBrandForm from './CreateBrandForm';
import { Plus } from 'lucide-react';
import ActionMenu from '../components/ui/ActionMenu';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import MasterHeader from '../components/ui/MasterHeader';

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

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = brands.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => {
    // navigate to edit route
    navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete brand:', id);
  };

  const handleCreateBrand = () => {
    navigate(`${ROUTES.BRAND_MASTER}/create`);
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

  // edit/view state and handlers
  const [viewItem, setViewItem] = useState<Brand | null>(null);
  const [editItem, setEditItem] = useState<Brand | null>(null);

  // Sync view/edit/create state from the current URL
  useEffect(() => {
    const rawId = params.id;
    const id = rawId ? decodeURIComponent(rawId) : undefined;

    if (location.pathname.endsWith('/create')) {
      setShowCreate(true);
      setViewItem(null);
      setEditItem(null);
      return;
    }

    if (location.pathname.endsWith('/edit') && id) {
      const found = brands.find(b => b.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = brands.find(b => b.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    // default listing state
    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, brands]);

  const handleSaveEditedBrand = (updated: Record<string, any>) => {
    setBrands(prev => prev.map(b => (b.id === updated.id ? { ...b, ...updated } as Brand : b)));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  return (
  <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateBrandForm inline onClose={() => navigate(ROUTES.BRAND_MASTER)} onSave={handleSaveBrand} />
      ) : viewItem ? (
        <MasterView title={`View Brand ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.BRAND_MASTER)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Brand ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.BRAND_MASTER)} onSave={handleSaveEditedBrand} />
      ) : (
        <>
      <MasterHeader
        onCreateClick={handleCreateBrand}
        createButtonLabel="Create Brand"
      />
      
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brand Master</h2>
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
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brand Master</h2>
        </div>
        
        {currentData.map((item, index) => (
            <div 
            key={item.id + item.name + index}
            className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
              <ActionMenu
                onEdit={() => handleEdit(item.id)}
                onView={() => handleView(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
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
          <Pagination
            currentPage={currentPage}
            totalItems={brands.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default BrandMaster;
