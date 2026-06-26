import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarDays, ChevronDown } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './DashboardDateRangePicker.css';
import {
  DATE_PRESET_OPTIONS,
  formatDashboardDateLabel,
  formatLocalDate,
  formatSingleDashboardDate,
  getDateRangeForPreset,
  type DashboardFilterState,
  type DatePreset,
} from '../../utils/dashboardFilters';

type DashboardDateRangePickerProps = {
  value: Pick<DashboardFilterState, 'preset' | 'dateFrom' | 'dateTo'>;
  onApply: (next: Pick<DashboardFilterState, 'preset' | 'dateFrom' | 'dateTo'>) => void;
};

const parseLocalDate = (dateValue: string): Date | null => {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const DashboardDateRangePicker: React.FC<DashboardDateRangePickerProps> = ({ value, onApply }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [draftPreset, setDraftPreset] = useState<DatePreset>(value.preset);
  const [draftStart, setDraftStart] = useState<Date | null>(parseLocalDate(value.dateFrom));
  const [draftEnd, setDraftEnd] = useState<Date | null>(parseLocalDate(value.dateTo));

  const syncDraftFromValue = () => {
    setDraftPreset(value.preset);
    setDraftStart(parseLocalDate(value.dateFrom));
    setDraftEnd(parseLocalDate(value.dateTo));
  };

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        syncDraftFromValue();
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [value.preset, value.dateFrom, value.dateTo]);

  const openPicker = () => {
    syncDraftFromValue();
    setOpen(true);
  };

  const closePicker = () => {
    setOpen(false);
    syncDraftFromValue();
  };

  const applyDraft = (preset: DatePreset, start: Date | null, end: Date | null, close = true) => {
    if (!start || !end) return;

    onApply({
      preset,
      dateFrom: formatLocalDate(start),
      dateTo: formatLocalDate(end),
    });

    if (close) {
      setOpen(false);
    }
  };

  const applyPreset = (preset: DatePreset) => {
    setDraftPreset(preset);

    if (preset === 'custom') {
      setDraftStart(null);
      setDraftEnd(null);
      return;
    }

    const range = getDateRangeForPreset(preset);
    const start = parseLocalDate(range.dateFrom);
    const end = parseLocalDate(range.dateTo);

    setDraftStart(start);
    setDraftEnd(end);
    applyDraft(preset, start, end, true);
  };

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    setDraftPreset('custom');
    setDraftStart(start);
    setDraftEnd(end);

    if (start && end) {
      applyDraft('custom', start, end, true);
    }
  };

  const handleApplyCustom = () => {
    applyDraft('custom', draftStart, draftEnd, true);
  };

  const canApplyCustom = Boolean(draftStart && draftEnd);

  return (
    <div ref={containerRef} className="dashboard-date-picker">
      <button
        type="button"
        onClick={() => (open ? closePicker() : openPicker())}
        className={`dashboard-date-picker__trigger ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-gray-500" />
        <span className="truncate">{formatDashboardDateLabel(value.dateFrom, value.dateTo)}</span>
        <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="dashboard-date-picker__popover" role="dialog" aria-label="Date range picker">
          <aside className="dashboard-date-picker__presets">
            {DATE_PRESET_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => applyPreset(option.id)}
                className={`dashboard-date-picker__preset ${draftPreset === option.id ? 'is-active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </aside>

          <div className="dashboard-date-picker__main">
            <div className="dashboard-date-picker__calendar">
              <DatePicker
                selected={draftStart}
                onChange={handleRangeChange}
                startDate={draftStart}
                endDate={draftEnd}
                selectsRange
                inline
                monthsShown={2}
                showPopperArrow={false}
                shouldCloseOnSelect={false}
              />
            </div>

            <div className="dashboard-date-picker__footer">
              <div className="dashboard-date-picker__range-inputs">
                <label className="dashboard-date-picker__field">
                  <span>From</span>
                  <input
                    type="text"
                    readOnly
                    value={draftStart ? formatSingleDashboardDate(formatLocalDate(draftStart)) : ''}
                    placeholder="Select start date"
                  />
                </label>
                <label className="dashboard-date-picker__field">
                  <span>To</span>
                  <input
                    type="text"
                    readOnly
                    value={draftEnd ? formatSingleDashboardDate(formatLocalDate(draftEnd)) : ''}
                    placeholder="Select end date"
                  />
                </label>
              </div>

              <div className="dashboard-date-picker__actions">
                <button type="button" className="dashboard-date-picker__btn dashboard-date-picker__btn--ghost" onClick={closePicker}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="dashboard-date-picker__btn dashboard-date-picker__btn--primary"
                  onClick={handleApplyCustom}
                  disabled={!canApplyCustom}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDateRangePicker;
