/** Escape a single CSV cell (RFC-style quoting when needed). */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  // Neutralize spreadsheet formula injection (block leading whitespace/control chars)
  const safe = /^[\s\u0000-\u001F]*[=+\-@]/.test(s) ? "'" + s : s;
  if (/[",\r\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

/** Build CSV text with header row and \r\n line endings. */
export function buildCsv(rows: string[][], headers: string[]): string {
  const lines: string[] = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  return lines.join('\r\n');
}

/** Trigger download of a UTF-8 CSV with BOM (Excel-friendly). */
export function downloadCsvFile(filename: string, csvText: string): void {
  const blob = new Blob([`\uFEFF${csvText}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function defaultDatedFilename(prefix: string): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${prefix}_${y}-${m}-${d}.csv`;
}
