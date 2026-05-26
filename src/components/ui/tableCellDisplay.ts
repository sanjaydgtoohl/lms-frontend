/** Max characters shown in a table cell before truncating (full text in hover tooltip). */
export const TABLE_CELL_CHAR_LIMIT = 150;

export function truncateTableCellText(
  value: string,
  maxLength = TABLE_CELL_CHAR_LIMIT,
): { display: string; full: string; hasMore: boolean } {
  const full = value ?? '';
  if (full.length <= maxLength) {
    return { display: full, full, hasMore: false };
  }
  return {
    display: `${full.slice(0, maxLength)}…`,
    full,
    hasMore: true,
  };
}
