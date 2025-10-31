import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ActionMenu from '../components/ui/ActionMenu';
import CreateIndustryForm from './CreateIndustryForm';
import MasterView from '../components/ui/MasterView';
import MasterEdit from '../components/ui/MasterEdit';
import Pagination from '../components/ui/Pagination';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

interface Industry {
  id: string;
  name: string;
  dateTime: string;
}

const IndustryMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const itemsPerPage = 10;

  // move sample data into state so we can append new items
  const [industries, setIndustries] = useState<Industry[]>([
    { id: '#CMP801', name: 'Industry 1', dateTime: '02-07-2025 22:23' },
    { id: '#CMP802', name: 'Technology', dateTime: '02-07-2025 22:24' },
    { id: '#CMP803', name: 'Healthcare', dateTime: '02-07-2025 22:25' },
    { id: '#CMP804', name: 'Finance', dateTime: '02-07-2025 22:26' },
    { id: '#CMP805', name: 'Education', dateTime: '02-07-2025 22:27' },
    { id: '#CMP806', name: 'Manufacturing', dateTime: '02-07-2025 22:28' },
    { id: '#CMP807', name: 'Retail', dateTime: '02-07-2025 22:29' },
    { id: '#CMP808', name: 'Real Estate', dateTime: '02-07-2025 22:30' },
    { id: '#CMP809', name: 'Automotive', dateTime: '02-07-2025 22:31' },
    { id: '#CMP810', name: 'Energy', dateTime: '02-07-2025 22:32' },
  ]);

  // totalPages calculated but not used directly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = industries.slice(startIndex, endIndex);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateIndustry = () => navigate(`${ROUTES.INDUSTRY_MASTER}/create`);

  const handleSaveIndustry = (data: any) => {
    const newIndustry: Industry = {
      id: `#CMP${Math.floor(Math.random() * 90000) + 10000}`,
      name: data.name || 'Untitled',
      dateTime: data.dateTime || new Date().toLocaleString(),
    };
    setIndustries(prev => [newIndustry, ...prev]);
    setCurrentPage(1);
  };

  const handleEdit = (id: string) => {
    navigate(`${ROUTES.INDUSTRY_MASTER}/${encodeURIComponent(id)}/edit`);
  };
  const handleView = (id: string) => {
    navigate(`${ROUTES.INDUSTRY_MASTER}/${encodeURIComponent(id)}`);
  };
  const handleDelete = (id: string) => console.log('Delete industry:', id);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const [viewItem, setViewItem] = useState<Industry | null>(null);
  const [editItem, setEditItem] = useState<Industry | null>(null);

  // sync UI with route
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
      const found = industries.find(i => i.id === id) || null;
      setEditItem(found);
      setViewItem(null);
      setShowCreate(false);
      return;
    }

    if (id) {
      const found = industries.find(i => i.id === id) || null;
      setViewItem(found);
      setShowCreate(false);
      setEditItem(null);
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, industries]);

  const handleSaveEditedIndustry = (updated: Record<string, any>) => {
    setIndustries(prev => prev.map(i => (i.id === updated.id ? { ...i, ...updated } as Industry : i)));
  };

  const renderPagination = () => {
    return (
      <Pagination
        currentPage={currentPage}
        totalItems={industries.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateIndustryForm onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveIndustry} />
      ) : viewItem ? (
        <MasterView title={`View Industry ${viewItem.id}`} item={viewItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} />
      ) : editItem ? (
        <MasterEdit title={`Edit Industry ${editItem.id}`} item={editItem} onClose={() => navigate(ROUTES.INDUSTRY_MASTER)} onSave={handleSaveEditedIndustry} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
                <button onClick={handleCreateIndustry} className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"><Plus className="w-4 h-4" /><span>Create Industry</span></button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Industry ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Industry Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {currentData.map((item, index) => (
                      <tr key={item.id + item.name + index} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.dateTime}</td>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Industry Master</h2>
                <button onClick={handleCreateIndustry} className="flex items-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-black text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"><Plus className="w-4 h-4" /><span>Create</span></button>
              </div>
            </div>

            {currentData.map((item, index) => (
              <div key={item.id + item.name} className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.id}</div>
                  <ActionMenu
                    isLast={index === currentData.length - 1}
                    onEdit={() => handleEdit(item.id)}
                    onView={() => handleView(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Industry Name:</span>
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
        </>
      )}
    </div>
  );
};

export default IndustryMaster;
