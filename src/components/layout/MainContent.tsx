import React, { useState } from 'react';
import Pagination from '../ui/Pagination';
import ActionMenu from '../ui/ActionMenu';
import SearchBar from '../ui/SearchBar';
import { matchesQuery, type SearchOptions } from '../../utils/index';

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
        totalItems={currentDataArray.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="flex-1 w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
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
          
          {/* Table */}
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-center">
              <thead className="bg-gray-50">
                <tr>
                  {dataType === 'agency' ? (
                    <>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Agency Group
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Agency Name
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Agency Type
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">
                        Action
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Sub-Source
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Action
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {currentData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[var(--hover-bg)] transition-colors duration-200"
                  >
                    {dataType === 'agency' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as Agency).agencyGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as Agency).agencyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as Agency).agencyType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as Agency).contactPerson}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {(item as Agency).dateTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ActionMenu
                            isLast={index >= currentData.length - 2}
                            onEdit={() => handleEdit(item.id)}
                            onView={() => handleView(item.id)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as LeadSource).source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">
                          {(item as LeadSource).subSource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {item.dateTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ActionMenu
                            onEdit={() => handleEdit(item.id)}
                            onView={() => handleView(item.id)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        </td>
                      </>
                    )}
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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
        
  {currentData.map((item, index) => (
          <div 
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Sr. No.:</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</span>
              </div>
              <ActionMenu
                isLast={index >= currentData.length - 2}
                onEdit={() => handleEdit(item.id)}
                onView={() => handleView(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            </div>
            
            <div className="space-y-2">
              {dataType === 'agency' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Agency Group:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as Agency).agencyGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Agency Name:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as Agency).agencyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Agency Type:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as Agency).agencyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Contact Person:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as Agency).contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                    <span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Source:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as LeadSource).source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Sub-Source:</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{(item as LeadSource).subSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Date & Time:</span>
                    <span className="text-sm text-[var(--text-secondary)]">{item.dateTime}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default MainContent;
