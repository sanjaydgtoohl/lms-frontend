import React, { useState, useEffect } from 'react';
import Table, { type Column } from '../components/ui/Table';

import CreateAgencyForm from './CreateAgencyForm';
import MasterView from '../components/ui/MasterView';
import type { Agency } from '../components/layout/MainContent';
import { listAgencies as fetchAgencies, deleteAgency, getAgency } from '../services/AgencyMaster';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { getItem } from '../data/masterData';
import { MasterHeader } from '../components/ui';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showError } from '../utils/notifications';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';

// Helpers to parse API date strings like "19-11-2025 10:35:57" or ISO strings
const parseApiDateToISO = (s?: string) => {
  if (!s) return '';
  const raw = String(s).trim();
  // If already ISO-like, return as-is
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw;
  const m = raw.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return raw;
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

const AgencyMaster: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<Agency | null>(null);
  const [editItem, setEditItem] = useState<Agency | null>(null);
  const [agenciesList, setAgenciesList] = useState<Agency[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteLabel, setConfirmDeleteLabel] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleCreateAgency = () => {
    navigate(`${ROUTES.AGENCY_MASTER}/create`);
  };

  const loadAgencies = async (p = 1, search?: string) => {
    setLoadingList(true);
    try {
      const res = await fetchAgencies(p, perPage, search);
      // map service Agency -> MainContent Agency shape
      const mapped = (res.data || []).map((a: any) => {
        // API can return parent info either in `is_parent` (object) or `agency_group`.
        // Prefer `is_parent.name` if available, otherwise fall back to `agency_group.name` or a string.
        const parentObj = a.is_parent ?? a.agency_group ?? null;
        const agencyGroupName = parentObj ? (typeof parentObj === 'object' ? (parentObj.name || String(parentObj?.id || '')) : String(parentObj)) : '';
        const rawCount = a.contact_person_count ?? a.contactPersonCount;
        const contactPersonValue = (typeof rawCount === 'number') ? String(rawCount)
          : (typeof rawCount === 'string' && rawCount.trim() !== '') ? rawCount
          : (a.contact_person ?? '') ;

        return {
          id: String(a.id),
          agencyGroup: agencyGroupName,
          agencyName: a.name || '',
          agencyType: a.agency_type || (a.type || ''),
          contactPerson: contactPersonValue || '',
          dateTime: formatDisplayDate(a.created_at || a.updated_at || ''),
        };
      });
      setAgenciesList(mapped);
      // attempt to read pagination meta if present
      const total = res.meta?.pagination?.total;
  if (typeof total === 'number') setTotalItems(total);
    } catch (err) {
      // handled by service error handler
      console.error('Failed to load agencies', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSaveAgency = (data: { parent: { name: string; type: string; client: string[] }; children: Array<{ name: string; type: string; client: string[] }> }): void => {
    // For now just log the saved data. Integrate with API/store as needed.
    console.log('Saved agencies payload:', data);
    setShowCreate(false);
  };

  const handleView = (item: Agency) => {
    navigate(`${ROUTES.AGENCY_MASTER}/${encodeURIComponent(item.id)}`);
  };

  const handleEdit = (item: Agency) => {
    navigate(`${ROUTES.AGENCY_MASTER}/${encodeURIComponent(item.id)}/edit`);
  };

  const handleSaveEdit = (updated: Record<string, unknown>): void => {
    // Update in API/store as needed
    console.log('Save edited agency:', updated);
    navigate(ROUTES.AGENCY_MASTER);
  };

  const handleDelete = (item: Agency): void => {
    if (!item.id) return showError('Agency ID is missing');
    setConfirmDeleteId(item.id);
    setConfirmDeleteLabel(item.agencyName || item.id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteAgency(confirmDeleteId);
      // Refresh the list
      loadAgencies(page, searchValue);
    } catch (err) {
      console.error('Delete failed:', err);
      showError((err as any)?.message || 'Failed to delete agency');
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteId(null);
      setConfirmDeleteLabel('');
    }
  };

  // Sync UI state with route params
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
      // Fetch full agency data from API for edit mode
      getAgency(id)
        .then(data => {
          setEditItem(data as any);
          setViewItem(null);
          setShowCreate(false);
        })
        .catch(() => {
          // Fallback to locally stored data if API fails
          const fetched = getItem('agency', id);
          setEditItem((fetched || { id }) as any);
          setViewItem(null);
          setShowCreate(false);
        });
      return;
    }


    if (id) {
      // Try to fetch from API first, fallback to local if fails
      getAgency(id)
        .then(data => {
          setViewItem(data as any);
          setEditItem(null);
          setShowCreate(false);
        })
        .catch(() => {
          const fetched = getItem('agency', id);
          if (fetched) setViewItem(fetched as Agency);
          else setViewItem({ id } as Agency);
          setEditItem(null);
          setShowCreate(false);
        });
      return;
    }

    setShowCreate(false);
    setViewItem(null);
    setEditItem(null);
  }, [location.pathname, params.id]);

  // load list when on list page and when page changes
  useEffect(() => {
    if (!location.pathname.endsWith('/create') && !location.pathname.endsWith('/edit')) {
      loadAgencies(page, searchValue);
    }
  }, [page, location.pathname]);



  return (
    <div className="flex-1 p-6 w-full max-w-full overflow-x-hidden">
      {showCreate ? (
        <CreateAgencyForm onClose={() => navigate(ROUTES.AGENCY_MASTER)} onSave={handleSaveAgency} />
      ) : viewItem ? (
        <MasterView item={viewItem} onClose={() => navigate(ROUTES.AGENCY_MASTER)} />
      ) : editItem ? (
        <CreateAgencyForm
          mode="edit"
          initialData={editItem}
          onClose={() => navigate(ROUTES.AGENCY_MASTER)}
          onSave={handleSaveEdit}
        />
      ) : (
        <>
          <MasterHeader
            onCreateClick={handleCreateAgency}
            createButtonLabel="Create Agency"
            showBreadcrumb={true}
          />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Agency Master</h2>
              <SearchBar 
                delay={300}
                placeholder="Please Search Agency"
                onSearch={(q: string) => { 
                  setSearchValue(q); 
                  setPage(1); 
                  loadAgencies(1, q);
                }} 
              />
            </div>

            <div className="pt-0 overflow-visible">
              <ConfirmDialog
                isOpen={!!confirmDeleteId}
                title={`Are you sure you want to delete agency "${confirmDeleteLabel}"?`}
                message="This action will permanently remove the agency. This cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                loading={confirmLoading}
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
              />
              <Table<Agency>
                data={agenciesList}
                loading={loadingList}
                columns={([
                  { key: 'sr', header: 'Sr. No.', render: (it: Agency) => {
                    const startIndex = (page - 1) * perPage;
                    const currentData = agenciesList;
                    return String(startIndex + currentData.indexOf(it) + 1);
                  }},
                  { key: 'agencyGroup', header: 'Agency Group', render: (it: Agency) => it.agencyGroup || '-' },
                  { key: 'agencyName', header: 'Agency Name', render: (it: Agency) => it.agencyName || '-' },
                  { key: 'agencyType', header: 'Agency Type', render: (it: Agency) => it.agencyType || '-' },
                  {
                    key: 'contactPerson',
                    header: 'Contact Person',
                    render: (it: Agency) => {
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
                            onClick={() => navigate(ROUTES.AGENCY_CONTACTS(id))}
                            className="text-gray-900 hover:underline cursor-pointer"
                          >
                            {String(count)}
                          </span>
                        );
                      }

                      return String(count ?? '-');
                    }
                  },
                  { key: 'dateTime', header: 'Date & Time', render: (it: Agency) => it.dateTime ? new Date(it.dateTime).toLocaleString() : '-' },
                ] as Column<Agency>[])}
                desktopOnMobile={true}
                onEdit={(it: Agency) => handleEdit(it)}
                onView={(it: Agency) => handleView(it)}
                onDelete={(it: Agency) => handleDelete(it)}
              />
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalItems={typeof totalItems === 'number' ? totalItems : agenciesList.length}
            itemsPerPage={perPage}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

export default AgencyMaster;
