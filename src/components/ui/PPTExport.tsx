import { useCallback, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import type { DeviceData } from '../../types/inventory.types';
import {
  generateDeviceInventoryPptx,
  type DeviceInventoryPptxProgress,
} from '../../utils/devicePptxExport';
import LoadingModal from './LoadingModal';
import SweetAlert from '../../utils/SweetAlert';

type PPTExportProps = {
  fetchRows: () => Promise<DeviceData[]>;
  className?: string;
};

function formatProgressMessage(progress: DeviceInventoryPptxProgress): string {
  const { loaded, total, stage } = progress;

  if (stage === 'images') {
    return `Loading device images ${loaded} of ${total}…`;
  }
  if (stage === 'slides') {
    return `Building slides ${loaded} of ${total}…`;
  }
  return 'Saving PowerPoint file…';
}

function PPTExport({ fetchRows, className = '' }: PPTExportProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    'Your PowerPoint export is being created. Device images are being prepared.'
  );
  const inFlightRef = useRef(false);

  const handleExport = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setLoadingMessage('Fetching filtered device records…');

    try {
      const rows = await fetchRows();
      if (!rows || rows.length === 0) {
        await SweetAlert.showError('No device records matched the current filters.', {
          title: 'No data to export',
        });
        return;
      }

      setLoadingMessage(`Preparing ${rows.length.toLocaleString()} device slide(s)…`);

      const result = await generateDeviceInventoryPptx(rows, {
        onProgress: (progress) => {
          setLoadingMessage(formatProgressMessage(progress));
        },
      });

      await SweetAlert.showSuccess({
        title: 'PPT export ready',
        text: `${result.exportedCount.toLocaleString()} device slide(s) exported successfully.`,
        timer: 2500,
      });
    } catch (err) {
      console.error('PPT export failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      await SweetAlert.showError(message, {
        title: 'PPT export failed',
      });
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchRows]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="btn-primary inline-flex items-center whitespace-nowrap shrink-0"
        aria-label="Export all filtered device inventory to PowerPoint"
        aria-busy={loading}
      >
        <Download className="h-4 w-4 mr-2 shrink-0 text-gray-700" aria-hidden />
        {loading ? 'Exporting PPT…' : 'PPT Export'}
      </button>
      <LoadingModal
        isOpen={loading}
        title="Generating PPT"
        message={loadingMessage}
      />
    </div>
  );
}

export default PPTExport;
