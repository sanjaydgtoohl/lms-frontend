import React from 'react';
import ActionMenu from './ActionMenu';
import { Loader2 } from 'lucide-react';

export type Column<T> = {
  /** unique key for the column */
  key: string;
  /** header label */
  header: React.ReactNode;
  /** optional cell renderer - receives the row item */
  render?: (item: T) => React.ReactNode;
  /** hide this column from mobile card view (default false) */
  hideOnMobile?: boolean;
  /** optional className for the column cells */
  className?: string;
};

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  startIndex?: number; // starting index for Sr. No.
  loading?: boolean;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  /** optional render key extractor (defaults to item.id || index) */
  keyExtractor?: (item: T, index: number) => string;
}

const Table = <T,>(props: TableProps<T>) => {
  const { data, columns, startIndex = 0, loading = false, onEdit, onView, onDelete, keyExtractor } = props;

  // Always show table structure, even when loading or empty
  const hasData = data && data.length > 0;
  const showActions = !!(onEdit || onView || onDelete);

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto overflow-y-visible">
        <div className="relative">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-6 py-20">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : !hasData ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-6 py-20">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">No records found</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor ? keyExtractor(item, index) : (String((item as Record<string, unknown>).id) || String(index))}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.className || ''}`}
                    >
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '-')}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm relative">
                      <div className="flex justify-center">
                        <ActionMenu
                          isLast={index === data.length - 1}
                          onEdit={() => onEdit?.(item)}
                          onView={() => onView?.(item)}
                          onDelete={() => onDelete?.(item)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="px-4 py-16 flex flex-col items-center justify-center space-y-3 bg-white rounded-lg border border-gray-200">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading data...</p>
          </div>
        ) : !hasData ? (
          <div className="px-4 py-16 text-center bg-white rounded-lg border border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm font-medium text-gray-500">No records found</p>
              <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={keyExtractor ? keyExtractor(item, index) : (String((item as Record<string, unknown>).id) || String(index))}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <div className="flex gap-2 items-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {startIndex + index + 1}
                  </span>
                </div>
                <ActionMenu
                  isLast={index === data.length - 1}
                  onEdit={() => onEdit?.(item)}
                  onView={() => onView?.(item)}
                  onDelete={() => onDelete?.(item)}
                />
              </div>

              <div className="space-y-2.5">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(col => (
                    <div
                      key={col.key}
                      className="flex justify-between items-start gap-3"
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap flex-shrink-0 min-w-[100px]">
                        {typeof col.header === 'string' ? col.header : col.key}:
                      </span>
                      <span className="text-sm font-medium text-gray-900 text-right break-words flex-1">
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '-')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Table;
