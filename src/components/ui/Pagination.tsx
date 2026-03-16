import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // If there are no items, don't render the summary or pagination controls.
  if (!totalItems || totalItems === 0) return null;

  const pages: number[] = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <>
    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2 py-2">
        <div className="text-sm text-[var(--text-secondary)] sm:mb-0 text-center w-full sm:w-auto order-2 sm:order-1">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
        </div>

        <div className="pagination-container flex items-center justify-center sm:justify-end bg-transparent px-2 w-full sm:w-auto order-1 sm:order-2 gap-x-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn start"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map(i => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`pagination-btn no ${
                i === currentPage ? 'text-black font-semibold' : 'text-[var(--text-secondary)] hover:text-black'
              }`}
            >
              {i}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn last"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Pagination;