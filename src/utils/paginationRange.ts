export type PaginationRangeItem = number | 'ellipsis';

/**
 * Build page numbers with ellipsis for large result sets.
 * Example: 1, 2, 3, …, 8, 9, 10 (when on page 9 of 10+).
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1
): PaginationRangeItem[] {
  const range = (start: number, end: number): number[] =>
    Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);

  if (totalPages <= 1) {
    return totalPages === 1 ? [1] : [];
  }

  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const leftSiblingIndex = Math.max(safePage - siblingCount, boundaryCount + 1);
  const rightSiblingIndex = Math.min(safePage + siblingCount, totalPages - boundaryCount);

  const showLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = boundaryCount + 2 + siblingCount * 2;
    return [
      ...range(1, leftItemCount),
      'ellipsis',
      ...range(totalPages - boundaryCount + 1, totalPages),
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = boundaryCount + 2 + siblingCount * 2;
    return [
      ...range(1, boundaryCount),
      'ellipsis',
      ...range(totalPages - rightItemCount + 1, totalPages),
    ];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    return [
      ...range(1, boundaryCount),
      'ellipsis',
      ...range(leftSiblingIndex, rightSiblingIndex),
      'ellipsis',
      ...range(totalPages - boundaryCount + 1, totalPages),
    ];
  }

  return range(1, totalPages);
}
