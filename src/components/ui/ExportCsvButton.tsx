// Sanitize cell to prevent CSV injection
function sanitizeCsvCell(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}
import { useCallback, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { buildCsv, defaultDatedFilename, downloadCsvFile } from '../../utils/csv';

export type CsvColumn<T> = {
  /** Column key used as CSV header when `header` is omitted */
  key: string;
  header?: string;
  /** Cell value; default reads `row[key]` for flat keys */
  value?: (row: T) => unknown;
};

export type ExportCsvButtonProps<T> = {
  /** Load all rows to export (e.g. paginated API stitched together) */
  fetchRows: () => Promise<T[]>;
  columns: CsvColumn<T>[];
  /** File base name without extension; date suffix is appended */
  filenamePrefix?: string;
  /** Override filename (include .csv) */
  filename?: string;
  label?: string;
  exportingLabel?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

function defaultCellValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function ExportCsvButton<T>({
  fetchRows,
  columns,
  filenamePrefix = 'export',
  filename: filenameOverride,
  label = 'Export',
  exportingLabel = 'Exporting…',
  className = '',
  buttonClassName = 'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
  disabled = false,
  'aria-label': ariaLabel,
}: ExportCsvButtonProps<T>) {
  const [exporting, setExporting] = useState(false);
  const inFlight = useRef(false);

  const handleClick = useCallback(async () => {
    if (disabled || inFlight.current) return;
    inFlight.current = true;
    setExporting(true);
    try {
      const rows = await fetchRows();
      const headers = columns.map((c) => c.header ?? c.key);
      const body: string[][] = rows.map((row) =>
        columns.map((col) => {
          const raw =
            col.value?.(row) ??
            defaultCellValue(row, col.key);
          const str = raw === null || raw === undefined ? '' : String(raw);
          return sanitizeCsvCell(str);
        })
      );
      const csvText = buildCsv(body, headers);
      const name = filenameOverride ?? defaultDatedFilename(filenamePrefix);
      downloadCsvFile(name, csvText);
    } finally {
      inFlight.current = false;
      setExporting(false);
    }
  }, [columns, disabled, fetchRows, filenameOverride, filenamePrefix]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || exporting}
        className={buttonClassName}
        aria-label={ariaLabel ?? 'Export data as CSV'}
        aria-busy={exporting}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        {exporting ? exportingLabel : label}
      </button>
    </div>
  );
}

export default ExportCsvButton;
