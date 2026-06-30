import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { IoIosArrowBack } from 'react-icons/io';
import { getPaginationRange } from '../../utils/paginationRange';

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
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const { startIndex, endIndex } = useMemo(() => {
    if (totalItems === 0) {
      return { startIndex: 0, endIndex: 0 };
    }

    const start = (safePage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, totalItems);
    return { startIndex: start, endIndex: end };
  }, [safePage, itemsPerPage, totalItems]);

  const pageItems = useMemo(
    () => getPaginationRange(safePage, totalPages),
    [safePage, totalPages]
  );

  if (!totalItems || totalItems === 0) return null;

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 py-2">
      <div className="whitespace-nowrap text-sm text-gray-800">
        Showing {startIndex + 1} to {endIndex} of {totalItems.toLocaleString('en-IN')} entries
      </div>

      <div className="pagination-container ml-auto flex items-center justify-end gap-x-1 bg-transparent px-2">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Previous page"
          className="pagination-btn start disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IoIosArrowBack className="h-5 w-5" aria-hidden />
        </button>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="pagination-ellipsis flex h-10 min-w-10 items-center justify-center px-2 text-sm text-gray-500"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === safePage ? 'page' : undefined}
              className={`pagination-btn no ${
                item === safePage
                  ? '!bg-orange-600 !text-white font-semibold'
                  : 'text-gray-800 hover:text-orange-600'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="Next page"
          className="pagination-btn last disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
