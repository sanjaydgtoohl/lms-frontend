import React from 'react';
import { ChevronRight } from 'lucide-react';
import { IoIosArrowBack } from 'react-icons/io';

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
    <div className="flex items-center justify-between flex-wrap gap-2 py-2 w-full">
      <div className="text-sm text-gray-800 whitespace-nowrap">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
      </div>

      <div className="pagination-container flex items-center justify-end bg-transparent px-2 gap-x-1 ml-auto">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="pagination-btn start"
        >
          <IoIosArrowBack className="w-5 h-5" />
        </button>

        {pages.map((i) => (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`pagination-btn no ${
              i === currentPage
                ? 'text-black font-semibold'
                : 'text-gray-800 hover:text-black'
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
  );
};

export default Pagination;