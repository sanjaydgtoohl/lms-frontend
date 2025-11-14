import React, { useState } from 'react';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import { matchesQuery } from '../../utils/index.tsx';
import Table, { type Column } from '../ui/Table';

export interface LeadSource {
  id: string;
  source: string;
  subSource: string;
  dateTime: string;
}

export interface Agency {
  id: string;
  agencyGroup: string;
  agencyName: string;
  agencyType: string;
  contactPerson: string;
  dateTime: string;
}

interface MainContentProps<T extends LeadSource | Agency> {
  title?: string;
  headerActions?: React.ReactNode;
  dataType?: 'leadSource' | 'agency';
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void | Promise<void>;
  // optional external data/pagination support
  data?: T[];
  loading?: boolean;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const MainContent = <T extends LeadSource | Agency>({ 
  title = "Lead Sources", 
  headerActions, 
  dataType = 'leadSource', 
  onView, 
  onEdit,
  onDelete,
  data: externalData,
  loading: externalLoading,
  totalItems: externalTotal,
  currentPage: externalCurrentPage,
  itemsPerPage: externalItemsPerPage,
  onPageChange: externalOnPageChange,
}: MainContentProps<T>) => {
  const [internalPage, setInternalPage] = useState(1);
  const itemsPerPage = 10;
  const currentPage = externalCurrentPage ?? internalPage;
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const leadSources: LeadSource[] = [
    { id: 'LS001', source: 'Website', subSource: 'Contact Form', dateTime: '2024-01-15 10:30 AM' },
    { id: 'LS002', source: 'Social Media', subSource: 'LinkedIn', dateTime: '2024-01-15 11:45 AM' },
    { id: 'LS003', source: 'Email Campaign', subSource: 'Newsletter', dateTime: '2024-01-15 02:15 PM' },
    { id: 'LS004', source: 'Referral', subSource: 'Client Referral', dateTime: '2024-01-15 03:20 PM' },
    { id: 'LS005', source: 'Website', subSource: 'Live Chat', dateTime: '2024-01-15 04:10 PM' },
    { id: 'LS006', source: 'Social Media', subSource: 'Facebook', dateTime: '2024-01-15 05:30 PM' },
    { id: 'LS007', source: 'Cold Call', subSource: 'Direct Call', dateTime: '2024-01-15 09:15 AM' },
    { id: 'LS008', source: 'Event', subSource: 'Trade Show', dateTime: '2024-01-15 01:45 PM' },
    { id: 'LS009', source: 'Website', subSource: 'Download', dateTime: '2024-01-15 06:20 PM' },
    { id: 'LS010', source: 'Email Campaign', subSource: 'Follow-up', dateTime: '2024-01-15 07:30 PM' },
  ];

  const agencies: Agency[] = [
    { id: '#CMPR01', agencyGroup: 'Group 1', agencyName: 'Agency 1', agencyType: 'Offline', contactPerson: '2', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR02', agencyGroup: 'Group 1', agencyName: 'Agency 2', agencyType: 'Online', contactPerson: '3', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR03', agencyGroup: 'Group 2', agencyName: 'Agency 3', agencyType: 'Online', contactPerson: '5', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR04', agencyGroup: 'Group 2', agencyName: 'Agency 4', agencyType: 'Offline', contactPerson: '3', dateTime: '02-07-2025 22:23' },
    { id: '#CMPR05', agencyGroup: 'Group 2', agencyName: 'Agency 5', agencyType: 'Both', contactPerson: '6', dateTime: '02-07-2025 22:23' },
  ];

  const currentDataArray: T[] = (dataType === 'agency' ? agencies : leadSources) as T[];

  // apply search filtering across common fields
  const filteredArray = currentDataArray.filter((item) => {
    // allow exact field matching using syntax `field:term` (exact equality), otherwise contains across common fields
    const commonFields = ['id', 'agencyName', 'agencyGroup', 'agencyType', 'source', 'subSource'];
    return matchesQuery(item as unknown as Record<string, unknown>, searchQuery, { 
      fields: commonFields,
      useStartsWith: dataType === 'agency'
    });
  });

  // totalPages not used directly (pagination component uses totalItems)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const providedData = externalData;
  const currentData = providedData ? (providedData as T[]).slice(startIndex, endIndex) : filteredArray.slice(startIndex, endIndex);

  const handleEdit = (item: T) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleView = (item: T) => {
    if (onView) {
      onView(item);
    }
  };

  const handleDelete = (item: T) => {
    if (onDelete) {
      onDelete(item);
    }
  };

  const handlePageChange = (page: number) => {
    if (externalOnPageChange) return externalOnPageChange(page);
    setInternalPage(page);
  };

  const renderPagination = () => {
    const total = typeof externalTotal === 'number' ? externalTotal : (searchQuery ? filteredArray.length : currentDataArray.length);
    return (
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={externalItemsPerPage ?? itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <div className="flex items-center space-x-3">
              <SearchBar
                delay={300}
                placeholder={dataType === 'agency' ? 'Search Agency Group' : 'Search...'}
                onSearch={(q: string) => { setSearchQuery(q); if (externalOnPageChange) externalOnPageChange(1); else setInternalPage(1); }}
              />
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 overflow-visible">
          <Table
          data={currentData}
          startIndex={startIndex}
          loading={!!externalLoading}
          keyExtractor={(it: T, idx: number) => `${it.id}-${idx}`}
          columns={(
            (dataType === 'agency'
              ? [
                  { key: 'sr', header: 'Sr. No.', render: (it: T) => {
                    const idx = currentData.findIndex(item => item.id === it.id);
                    return String(startIndex + (idx >= 0 ? idx : 0) + 1);
                  }},
                  { key: 'agencyGroup', header: 'Agency Group', render: (it: T) => (it as Agency).agencyGroup },
                  { key: 'agencyName', header: 'Agency Name', render: (it: T) => (it as Agency).agencyName },
                  { key: 'agencyType', header: 'Agency Type', render: (it: T) => (it as Agency).agencyType },
                  { key: 'contactPerson', header: 'Contact Person', render: (it: T) => (it as Agency).contactPerson },
                  { key: 'dateTime', header: 'Date & Time', render: (it: T) => (it as Agency).dateTime },
                ]
              : [
                  { key: 'sr', header: 'Sr. No.', render: (it: T) => {
                    const idx = currentData.findIndex(item => item.id === it.id);
                    return String(startIndex + (idx >= 0 ? idx : 0) + 1);
                  }},
                  { key: 'source', header: 'Source', render: (it: T) => (it as LeadSource).source },
                  { key: 'subSource', header: 'Sub-Source', render: (it: T) => (it as LeadSource).subSource },
                  { key: 'dateTime', header: 'Date & Time', render: (it: T) => (it as LeadSource).dateTime },
                ]) as Column<T>[]
          )}
          onEdit={(it: T) => handleEdit(it)}
          onView={(it: T) => handleView(it)}
          onDelete={(it: T) => handleDelete(it)}
        />
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default MainContent;
