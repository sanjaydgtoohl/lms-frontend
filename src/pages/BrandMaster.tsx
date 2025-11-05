import React, { useState, useEffect } from 'react';
import CreateBrandForm from './CreateBrandForm';
import MasterView from '../components/ui/MasterView';
import Pagination from '../components/ui/Pagination';
import Table, { type Column } from '../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import MasterHeader from '../components/ui/MasterHeader';
import SearchBar from '../components/ui/SearchBar';

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

  const [brands, setBrands] = useState<Brand[]>([
    { id: '#CMPR01', name: 'Nike', agencyName: 'Agency 1', brandType: 'National', contactPerson: '2', industry: 'Moter', country: 'India', state: 'Maharastra', city: 'Pune', zone: 'West', pinCode: '328001', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR02', name: 'Puma', agencyName: 'Agency 1', brandType: 'Local', contactPerson: '3', industry: 'Moter', country: 'India', state: 'Maharastra', city: 'Pune', zone: 'West', pinCode: '328001', dateTime: '02-07-2025 22:21' },
    { id: '#CMPR03', name: 'Apple', agencyName: 'Direct', brandType: 'Local', contactPerson: '5', industry: 'Moter', country: 'India', state: 'Maharastra', city: 'Pune', zone: 'East', pinCode: '328001', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR04', name: 'Pepsi', agencyName: 'Agency 2', brandType: 'Regional', contactPerson: '3', industry: 'Moter', country: 'India', state: 'Maharastra', city: 'Pune', zone: 'West', pinCode: '328001', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR05', name: 'Coca Cola', agencyName: 'Agency 2', brandType: 'Regional', contactPerson: '6', industry: 'Moter', country: 'India', state: 'Maharastra', city: 'Pune', zone: 'East', pinCode: '328001', dateTime: '02-07-2025 22:23' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Brand | null>(null);
  const [editItem, setEditItem] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(b => {
    if (!searchQuery) return true;
    const q = String(searchQuery).trim().toLowerCase();
    return (b.name || '').toLowerCase().startsWith(q);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}/edit`);
  const handleView = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}`);
  const handleDelete = (id: string) => setBrands(prev => prev.filter(b => b.id !== id));

  const handleCreateBrand = () => navigate(`${ROUTES.BRAND_MASTER}/create`);

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
      dateTime: new Date().toISOString(),
    };
    setBrands(prev => [newBrand, ...prev]);
    setCurrentPage(1);
  };

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

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id, brands]);

  const handleSaveEditedBrand = (updated: Record<string, any>) => {
    setBrands(prev => prev.map(b => (b.id === updated.id ? { ...b, ...updated } as Brand : b)));
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateBrandForm inline onClose={() => navigate(ROUTES.BRAND_MASTER)} onSave={handleSaveBrand} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.BRAND_MASTER)} />
      ) : editItem ? (
        <CreateBrandForm
          inline
          mode="edit"
          initialData={editItem}
          onClose={() => navigate(ROUTES.BRAND_MASTER)}
          onSave={(data: any) => handleSaveEditedBrand({ ...(data as Record<string, any>) })}
        />
      ) : (
        <>
          <MasterHeader onCreateClick={handleCreateBrand} createButtonLabel="Create Brand" />

          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Brand Master</h2>
              <SearchBar delay={0} onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }} />
            </div>

            <Table
              data={currentData}
              startIndex={startIndex}
              loading={false}
              keyExtractor={(it: Brand, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: Brand) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'name', header: 'Brand Name', render: (it: Brand) => it.name },
                { key: 'agencyName', header: 'Agency Name', render: (it: Brand) => it.agencyName },
                { key: 'brandType', header: 'Brand Type', render: (it: Brand) => it.brandType },
                { key: 'contactPerson', header: 'Contact Person', render: (it: Brand) => it.contactPerson },
                { key: 'industry', header: 'Industry', render: (it: Brand) => it.industry },
                { key: 'country', header: 'Country', render: (it: Brand) => it.country },
                { key: 'state', header: 'State', render: (it: Brand) => it.state },
                { key: 'city', header: 'City', render: (it: Brand) => it.city },
                { key: 'zone', header: 'Zone', render: (it: Brand) => it.zone },
                { key: 'pinCode', header: 'Pin Code', render: (it: Brand) => it.pinCode },
                { key: 'dateTime', header: 'Date & Time', render: (it: Brand) => it.dateTime },
              ] as Column<Brand>[])}
              onEdit={(it: Brand) => handleEdit(it.id)}
              onView={(it: Brand) => handleView(it.id)}
              onDelete={(it: Brand) => handleDelete(it.id)}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={searchQuery ? filteredBrands.length : brands.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default BrandMaster;
