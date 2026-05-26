import React, { useCallback, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import LoadingModal from './LoadingModal';
import SweetAlert from '../../utils/SweetAlert';

export type ExportExcelButtonProps = {
  /** Trigger export (e.g. call API and download generated file) */
  fetchExport: () => Promise<void>;
  label?: string;
  exportingLabel?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  fetchExport,
  label = 'Export Excel',
  exportingLabel = 'Exporting…',
  className = '',
  buttonClassName = 'btn-primary !bg-gray-800',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const [exporting, setExporting] = useState(false);
  const inFlight = useRef(false);

  const handleClick = useCallback(async () => {
    if (disabled || inFlight.current) return;
    inFlight.current = true;
    setExporting(true);
    try {
      await fetchExport();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export Excel file';
      try {
        SweetAlert.showError(message);
      } catch {
        console.error(message);
      }
    } finally {
      inFlight.current = false;
      setExporting(false);
    }
  }, [disabled, fetchExport]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || exporting}
        className={buttonClassName}
        aria-label={ariaLabel ?? 'Export data as Excel'}
        aria-busy={exporting}
      >
        <Download className="h-4 w-4 mr-2 shrink-0" aria-hidden />
        {exporting ? exportingLabel : label}
      </button>
      <LoadingModal
        isOpen={exporting}
        title="Preparing Excel export"
        message="Your Excel export is being generated. Please wait a moment."
      />
    </div>
  );
};

export default ExportExcelButton;
