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
  fetchRows?: () => Promise<DeviceData[]>;
  downloadUrl?: string | null;
  className?: string;
  disabled?: boolean;
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

function PPTExport({ fetchRows, downloadUrl, className = '', disabled = false }: PPTExportProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    'Your PowerPoint export is being created. Device images are being prepared.'
  );
  const inFlightRef = useRef(false);
  const canExport = Boolean(fetchRows || downloadUrl);

  const handleExport = useCallback(async () => {
    if (inFlightRef.current || !canExport || disabled) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      if (downloadUrl) {
        setLoadingMessage('Generating PowerPoint on the server…');
        const { downloadDeviceInventoryExport } = await import('../../services/DeviceInventory');
        await downloadDeviceInventoryExport(downloadUrl, 'Device_Inventory_Report.pptx');
        await SweetAlert.showSuccess({
          title: 'PPT export ready',
          text: 'Your PowerPoint file has been downloaded.',
          timer: 2500,
        });
        return;
      }

      if (!fetchRows) {
        throw new Error('No export source configured.');
      }

      setLoadingMessage('Fetching filtered device records…');

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
  }, [canExport, disabled, downloadUrl, fetchRows]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading || !canExport || disabled}
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
