import React, { useState, useEffect } from 'react';
import CreateBrandForm from './CreateBrandForm';
import MasterView from '../components/ui/MasterView';
import Pagination from '../components/ui/Pagination';
import Table, { type Column } from '../components/ui/Table';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import MasterHeader from '../components/ui/MasterHeader';
import SearchBar from '../components/ui/SearchBar';
import { matchesQuery } from '../utils/index.tsx';
import { NotificationPopup } from '../components/ui';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import AgenciesModal from '../components/ui/AgenciesModal';
import { deleteBrand } from '../services/BrandMaster';
import { listBrands, getBrand, type BrandItem as ServiceBrandItem } from '../services/BrandMaster';
import { usePermissions } from '../context/SidebarMenuContext';

type Brand = ServiceBrandItem;

// Helpers to parse API date strings like "19-11-2025 10:35:57"
const parseApiDateToISO = (s?: string) => {
  if (!s) return '';
  const m = String(s).trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return s;
  const [, dd, mm, yyyy, hh, min, sec] = m;
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec || '00'}`;
};

const formatDisplayDate = (s?: string) => {
  if (!s) return '-';
  try {
    const iso = parseApiDateToISO(s);
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleString();
  } catch {
    return String(s);
  }
};

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

  const { hasPermission } = usePermissions();

  // We fetch paginated data from the API; currentData is the page currently loaded
  const startIndex = (currentPage - 1) * itemsPerPage;
  // If `searchQuery` is present we support a full client-side search by
  // filtering the currently loaded brands across all string fields.
  // Otherwise we show the server-provided page `brands`.
  const currentData = (() => {
    if (searchQuery && brands.length > 0) {
      const filtered = brands.filter((b: Brand) => {
        const fields = Object.keys(b).filter(k => typeof (b as any)[k] === 'string');
        return matchesQuery(b as unknown as Record<string, unknown>, searchQuery, { fields, useStartsWith: false });
      });
      return filtered.slice(startIndex, startIndex + itemsPerPage);
    }
    return brands;
  })();

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleEdit = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}/edit`);
  const handleView = (id: string) => navigate(`${ROUTES.BRAND_MASTER}/${encodeURIComponent(id)}`);
  
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessageToast, setErrorMessageToast] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showAgenciesModal, setShowAgenciesModal] = useState(false);
  const [modalAgencies, setModalAgencies] = useState<any[]>([]);

  const handleDelete = (id: string) => {
    const found = brands.find(b => b.id === id);
    setConfirmDeleteId(id);
    setConfirmDeleteLabel(found ? (found.name || String(found.id)) : id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteBrand(confirmDeleteId);
      // Refetch the brand list after delete
      const res = await listBrands(currentPage, itemsPerPage, searchQuery);
      setBrands(res.data as Brand[]);
      const total = res.meta?.pagination?.total ?? res.data.length;
      setTotalItems(total);
    } catch (e: any) {
      setErrorMessageToast(e?.message || 'Failed to delete');
      setShowErrorToast(true);
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

  const handleCreateBrand = () => navigate(`${ROUTES.BRAND_MASTER}/create`);

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
      // Fetch full brand details from API for edit mode
      getBrand(id)
        .then(data => {
          setEditItem(data);
          setViewItem(null);
          setShowCreate(false);
        })
        .catch(() => {
          // Fallback to locally stored data if API fails
          const found = brands.find(b => b.id === id) || null;
          setEditItem(found);
          setViewItem(null);
          setShowCreate(false);
        });
      return;
    }

    if (id) {
      // Fetch full brand details from API for view mode
      getBrand(id)
        .then(data => {
          setViewItem(data);
          setShowCreate(false);
          setEditItem(null);
        })
        .catch(() => {
          // Fallback to locally stored data if API fails
          const found = brands.find(b => b.id === id) || null;
          setViewItem(found);
          setShowCreate(false);
          setEditItem(null);
        });
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

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {/* Delete success popup removed to avoid showing success toast after delete */}
      <NotificationPopup
        isOpen={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        message={errorMessageToast}
        type="error"
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title={`Delete brand "${confirmDeleteLabel}"?`}
        message="This action will permanently remove the brand. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={confirmLoading}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <AgenciesModal
        isOpen={showAgenciesModal}
        agencies={modalAgencies}
        onClose={() => setShowAgenciesModal(false)}
        title="Agencies"
      />
      {showCreate ? (
        <CreateBrandForm inline onClose={() => navigate(ROUTES.BRAND_MASTER)} />
      ) : viewItem ? (
        <MasterView 
          item={viewItem} 
          onClose={() => navigate(ROUTES.BRAND_MASTER)} 
          excludeFields={['agency', 'industry_id', 'slug', 'brand_type_id', 'city_id', 'state_id', 'status', 'country_id', 'zone_id']}
        />
      ) : editItem ? (
        <CreateBrandForm
          inline
          mode="edit"
          initialData={editItem}
          onClose={() => navigate(ROUTES.BRAND_MASTER)}
        />
      ) : (
        <>
          <MasterHeader 
            onCreateClick={handleCreateBrand} 
            createButtonLabel="Create Brand"
            showBreadcrumb={true}
            showCreateButton={hasPermission('brand.create')}
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

            <div className="pt-0 overflow-visible">
              <Table
              data={currentData}
              startIndex={startIndex}
              loading={loading}
              keyExtractor={(it: Brand, idx: number) => `${it.id}-${idx}`}
              columns={([
                { key: 'sr', header: 'Sr. No.', render: (it: Brand) => String(startIndex + currentData.indexOf(it) + 1) },
                { key: 'name', header: 'Brand Name', render: (it: Brand) => it.name || '-' },
                { key: 'agencyName', header: 'Agency Name', render: (it: Brand) => {
                  const raw = (it as any)._raw as Record<string, unknown> | undefined;
                  const agencies = raw?.['agencies'];
                  if (Array.isArray(agencies) && agencies.length > 0) {
                    const first = agencies[0] as any;
                    const name = first?.name || 'Unknown';
                    if (agencies.length === 1) {
                      return name;
                    } else {
                      return (
                        <span
                          className="inline-flex items-center gap-2 cursor-pointer text-black"
                          onClick={() => {
                            setModalAgencies(agencies);
                            setShowAgenciesModal(true);
                          }}
                        >
                          {name}
                          <span className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                            +{agencies.length - 1}
                          </span>
                        </span>
                      );
                    }
                  }
                  return it.agencyName || '-';
                } },
                { key: 'brandType', header: 'Brand Type', render: (it: Brand) => it.brandType || '-' },
                {
                  key: 'contactPerson',
                  header: 'Contact Person',
                  render: (it: Brand) => {
                    const raw = (it as any)._raw as Record<string, unknown> | undefined;
                    const rawCount = raw?.['contact_person_count'] ?? raw?.['contactPersonCount'];
                    let count: string | number | null = null;
                    if (typeof rawCount === 'number') count = rawCount;
                    else if (typeof rawCount === 'string' && rawCount.trim() !== '') count = rawCount;

                    const normCount = (it as any).contact_person_count ?? (it as any).contactPersonCount;
                    if (count === null && typeof normCount === 'number') count = normCount;

                    const cp = (it as any).contactPerson ?? (it as any).contact_person;
                    if (count === null) {
                      if (cp) count = String(cp);
                      else count = '-';
                    }

                    // If we have a numeric or non-hyphen count, render as clickable link to contacts page
                    if (count !== '-' && String(count).trim() !== '') {
                      const id = encodeURIComponent(String(it.id ?? ''));
                      return (
                        <span
                          onClick={() => navigate(ROUTES.BRAND_CONTACTS(id))}
                          className="text-blue-600 underline cursor-pointer"
                        >
                          {String(count)}
                        </span>
                      );
                    }

                    return String(count ?? '-');
                  }
                },
                { key: 'industry', header: 'Industry', render: (it: Brand) => it.industry || '-' },
                { key: 'country', header: 'Country', render: (it: Brand) => it.country || '-' },
                { key: 'state', header: 'State', render: (it: Brand) => it.state || '-' },
                { key: 'city', header: 'City', render: (it: Brand) => it.city || '-' },
                { key: 'zone', header: 'Zone', render: (it: Brand) => it.zone || '-' },
                { key: 'pinCode', header: 'Pin Code', render: (it: Brand) => it.pinCode || '-' },
                { key: 'dateTime', header: 'Date & Time', render: (it: Brand) => formatDisplayDate(it.dateTime) },
              ] as Column<Brand>[])}
              desktopOnMobile={true}
              onEdit={(it: Brand) => handleEdit(it.id)}
              onView={(it: Brand) => handleView(it.id)}
              onDelete={(it: Brand) => handleDelete(it.id)}
              editPermissionSlug="brand.edit"
              viewPermissionSlug="brand.view"
              deletePermissionSlug="brand.delete"
            />
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={typeof totalItems === 'number' ? totalItems : brands.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default BrandMaster;
