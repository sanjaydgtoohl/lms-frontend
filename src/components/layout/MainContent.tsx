import React, { useState } from 'react';
import Pagination from '../ui/Pagination';
import SearchBar from '../ui/SearchBar';
import { matchesQuery } from '../../utils';
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
}

const MainContent = <T extends LeadSource | Agency>({ 
  title = "Lead Sources", 
  headerActions, 
  dataType = 'leadSource', 
  onView, 
  onEdit 
}: MainContentProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
    return matchesQuery(item as any, searchQuery, { 
      fields: commonFields,
      useStartsWith: dataType === 'agency'
    });
  });

  // totalPages not used directly (pagination component uses totalItems)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredArray.slice(startIndex, endIndex);

  const handleEdit = (id: string) => {
    const item = currentDataArray.find(i => i.id === id);
    if (item && onEdit) {
      // Type is already T since we cast currentDataArray as T[]
      onEdit(item);
    }
  };

  const handleView = (id: string) => {
    const item = currentDataArray.find(i => i.id === id);
    if (item && onView) {
      // Type is already T since we cast currentDataArray as T[]
      onView(item);
    }
  };

  const handleDelete = (id: string) => {
    console.log(`Delete ${dataType === 'agency' ? 'agency' : 'lead source'}:`, id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    return (
      <Pagination
        currentPage={currentPage}
        totalItems={searchQuery ? filteredArray.length : currentDataArray.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <div className="flex items-center space-x-3">
              <SearchBar
                delay={0}
                placeholder={dataType === 'agency' ? 'Search Agency Group' : 'Search...'}
                onSearch={(q: string) => { setSearchQuery(q); setCurrentPage(1); }}
              />
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>

        <Table
          data={currentData}
          startIndex={startIndex}
          loading={false}
          keyExtractor={(it: any, idx: number) => `${it.id}-${idx}`}
          columns={(
            (dataType === 'agency'
              ? [
                  { key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
                  { key: 'agencyGroup', header: 'Agency Group', render: (it: any) => it.agencyGroup },
                  { key: 'agencyName', header: 'Agency Name', render: (it: any) => it.agencyName },
                  { key: 'agencyType', header: 'Agency Type', render: (it: any) => it.agencyType },
                  { key: 'contactPerson', header: 'Contact Person', render: (it: any) => it.contactPerson },
                  { key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime },
                ]
              : [
                  { key: 'sr', header: 'Sr. No.', render: (it: any) => String(startIndex + currentData.indexOf(it) + 1) },
                  { key: 'source', header: 'Source', render: (it: any) => it.source },
                  { key: 'subSource', header: 'Sub-Source', render: (it: any) => it.subSource },
                  { key: 'dateTime', header: 'Date & Time', render: (it: any) => it.dateTime },
                ]) as Column<any>[]
          )}
          onEdit={(it: any) => handleEdit(it.id)}
          onView={(it: any) => handleView(it.id)}
          onDelete={(it: any) => handleDelete(it.id)}
        />
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default MainContent;
