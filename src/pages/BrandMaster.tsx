import React, { useState, useEffect } from 'react';
import CreateBrandForm from './CreateBrandForm';
import MasterView from '../components/ui/MasterView';
import Pagination from '../components/ui/Pagination';
import Table, { type Column } from '../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import MasterHeader from '../components/ui/MasterHeader';
import SearchBar from '../components/ui/SearchBar';
import { listBrands, type BrandItem as ServiceBrandItem } from '../services/BrandMaster';

type Brand = ServiceBrandItem;

const BrandMaster: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Brand | null>(null);
  const [editItem, setEditItem] = useState<Brand | null>(null);

  // We fetch paginated data from the API; currentData is the page currently loaded
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = brands;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}/edit`);
  const handleView = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}`);
  const handleDelete = (id: string) => setBrands(prev => prev.filter(b => b.id !== id));

  const handleCreateBrand = () => navigate(`${ROUTES.BRAND_MASTER}/create`);

  const handleSaveBrand = (data: Record<string, unknown>) => {
    const d = data as Record<string, unknown>;
    const newBrand: Brand = {
      id: `#CMPR${Math.floor(Math.random() * 90000) + 10000}`,
      name: String(d['brandName'] ?? 'Untitled'),
      agencyName: String(d['agency'] ?? 'Direct'),
      brandType: String(d['brandType'] ?? ''),
      contactPerson: '0',
      industry: String(d['industry'] ?? ''),
      country: String(d['country'] ?? ''),
      state: String(d['state'] ?? ''),
      city: String(d['city'] ?? ''),
      zone: String(d['zone'] ?? ''),
      pinCode: String(d['postalCode'] ?? ''),
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

  // Fetch brands from API when page, itemsPerPage or search query changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await listBrands(currentPage, itemsPerPage, searchQuery);
        if (cancelled) return;
        setBrands(res.data as Brand[]);
        const total = res.meta?.pagination?.total ?? res.data.length;
        setTotalItems(total);
      } catch {
        // keep existing data on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleSaveEditedBrand = (updated: Partial<Brand>) => {
    setBrands(prev => prev.map(b => (b.id === updated.id ? { ...b, ...(updated as Partial<Brand>) } as Brand : b)));
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
          onSave={(data: Record<string, unknown>) => handleSaveEditedBrand(data as Partial<Brand>)}
        />
      ) : (
        <>
          <MasterHeader 
            onCreateClick={handleCreateBrand} 
            createButtonLabel="Create Brand"
            showBreadcrumb={true}
          />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Brand Master</h2>
              <SearchBar 
                delay={300} 
                onSearch={(q: string) => { 
                  setSearchQuery(q); 
                  setCurrentPage(1); 
                }} 
              />
            </div>

            <div className="p-4 overflow-visible">
              <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: Brand, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: Brand) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'id', header: 'ID', render: (it: Brand) => it.id || '-' },
                { key: 'name', header: 'Brand Name', render: (it: Brand) => it.name || '-' },
                { key: 'agencyName', header: 'Agency Name', render: (it: Brand) => it.agencyName || '-' },
                { key: 'brandType', header: 'Brand Type', render: (it: Brand) => it.brandType || '-' },
                { key: 'contactPerson', header: 'Contact Person', render: (it: Brand) => it.contactPerson || '-' },
                { key: 'industry', header: 'Industry', render: (it: Brand) => it.industry || '-' },
                { key: 'country', header: 'Country', render: (it: Brand) => it.country || '-' },
                { key: 'state', header: 'State', render: (it: Brand) => it.state || '-' },
                { key: 'city', header: 'City', render: (it: Brand) => it.city || '-' },
                { key: 'zone', header: 'Zone', render: (it: Brand) => it.zone || '-' },
                { key: 'pinCode', header: 'Pin Code', render: (it: Brand) => it.pinCode || '-' },
                { key: 'dateTime', header: 'Date & Time', render: (it: Brand) => it.dateTime ? new Date(it.dateTime).toLocaleString() : '-' },
              ] as Column<Brand>[])}
              onEdit={(it: Brand) => handleEdit(it.id)}
              onView={(it: Brand) => handleView(it.id)}
              onDelete={(it: Brand) => handleDelete(it.id)}
            />
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default BrandMaster;
