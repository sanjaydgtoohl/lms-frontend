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

  if (loading) {
    return (
      <div className="px-6 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    // render an empty table shell (keeps layout consistent). Caller may choose to hide pagination.
    return (
      <div className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No records found</div>
    );
  }

  return (
    <>
  {/* Desktop Table View (hidden on small screens) */}
  <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className={`px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onView || onDelete) && (
                <th className="px-6 py-4 text-center text-xs font-medium text-[var(--text-secondary)] tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {data.map((item, index) => (
              <tr key={keyExtractor ? keyExtractor(item, index) : (String((item as any).id) || String(index))} className="hover:bg-[var(--hover-bg)] transition-colors duration-200">
                {columns.map(col => (
                  <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)] ${col.className || ''}`}>
                    {col.render ? col.render(item) : ((item as any)[col.key] ?? '-')}
                  </td>
                ))}
                {(onEdit || onView || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ActionMenu
                      isLast={false}
                      onEdit={() => onEdit && onEdit(item)}
                      onView={() => onView && onView(item)}
                      onDelete={() => onDelete && onDelete(item)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <div key={keyExtractor ? keyExtractor(item, index) : (String((item as any).id) || String(index))} className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-4 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className="text-sm text-[var(--text-secondary)]">Sr. No.:</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{startIndex + index + 1}</span>
              </div>
              <ActionMenu
                isLast={index === data.length - 1}
                onEdit={() => onEdit && onEdit(item)}
                onView={() => onView && onView(item)}
                onDelete={() => onDelete && onDelete(item)}
              />
            </div>

            <div className="space-y-2">
              {columns.map(col => (
                <div key={col.key} className={`flex justify-between ${col.hideOnMobile ? 'hidden' : ''}`}>
                  <span className="text-sm text-[var(--text-secondary)]">{col.header}:</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{col.render ? col.render(item) : ((item as any)[col.key] ?? '-')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Table;
