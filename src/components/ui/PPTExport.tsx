import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import type { DeviceData } from '../../types/inventory.types';
import { generateDeviceInventoryPptx } from '../../utils/devicePptxExport';
import LoadingModal from './LoadingModal';

type PPTExportProps = {
  fetchRows: () => Promise<DeviceData[]>;
  className?: string;
};

function PPTExport({ fetchRows, className = '' }: PPTExportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const rows = await fetchRows();
      if (!rows || rows.length === 0) {
        setError('No records found for the current filters.');
        return;
      }
      await generateDeviceInventoryPptx(rows);
    } catch (err) {
      console.error('PPT export failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Unable to generate the PPT export. ${message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchRows, loading]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        aria-label="Export device inventory to PPT"
        aria-busy={loading}
      >
        <Download className="text-gray-700 h-4 w-4 shrink-0" aria-hidden />
        {loading ? 'Exporting PPT…' : 'PPT Export'}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <LoadingModal
        isOpen={loading}
        title="Generating PPT"
        message="Your PPT export is being created. Please wait a moment."
      />
    </div>
  );
}

export default PPTExport;
