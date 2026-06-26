import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export type DatePreset =
  | 'today'
  | 'tomorrow'
  | 'this_week'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_6_months'
  | 'last_1_year'
  | 'this_month'
  | 'last_month'
  | 'custom';

export type DashboardFilterState = {
  preset: DatePreset;
  dateFrom: string;
  dateTo: string;
  organisationIds: string[];
  /** Optional priority filter for pending assignments and related dashboard APIs. */
  priority?: 'High' | 'Medium' | 'Low';
};

export function buildDashboardFilterQuery(
  filters?: DashboardFilterState,
  options?: { includePriority?: boolean }
): string {
  if (!filters) return '';

  const params = new URLSearchParams();
  const includePriority = options?.includePriority ?? true;

  if (filters.dateFrom) params.append('date_from', filters.dateFrom);
  if (filters.dateTo) params.append('date_to', filters.dateTo);
  filters.organisationIds.forEach((id) => {
    if (id) params.append('organisation_ids[]', id);
  });
  if (includePriority && filters.priority) params.append('priority', filters.priority);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function withDashboardFilters(
  path: string,
  filters?: DashboardFilterState,
  options?: { includePriority?: boolean }
): string {
  const query = buildDashboardFilterQuery(filters, options);
  return `${path}${query}`;
}

export function appendDashboardQueryParams(
  path: string,
  filters?: DashboardFilterState,
  extraParams?: Record<string, string | number | undefined>,
  options?: { includePriority?: boolean }
): string {
  const baseQuery = buildDashboardFilterQuery(filters, options).replace(/^\?/, '');
  const params = new URLSearchParams(baseQuery);

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export const DATE_PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'last_6_months', label: 'Last 6 Months' },
  { id: 'last_1_year', label: 'Last 1 Year' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
];

export function getDateRangeForPreset(preset: DatePreset): { dateFrom: string; dateTo: string } {
  const today = dayjs().startOf('day');

  switch (preset) {
    case 'today':
      return {
        dateFrom: today.format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'tomorrow': {
      const tomorrow = today.add(1, 'day');
      return {
        dateFrom: tomorrow.format('YYYY-MM-DD'),
        dateTo: tomorrow.format('YYYY-MM-DD'),
      };
    }
    case 'this_week':
      return {
        dateFrom: today.startOf('isoWeek').format('YYYY-MM-DD'),
        dateTo: today.endOf('isoWeek').format('YYYY-MM-DD'),
      };
    case 'last_7_days':
      return {
        dateFrom: today.subtract(6, 'day').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'last_30_days':
      return {
        dateFrom: today.subtract(29, 'day').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'last_6_months':
      return {
        dateFrom: today.subtract(6, 'month').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'last_1_year':
      return {
        dateFrom: today.subtract(1, 'year').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'this_month':
      return {
        dateFrom: today.startOf('month').format('YYYY-MM-DD'),
        dateTo: today.endOf('month').format('YYYY-MM-DD'),
      };
    case 'last_month': {
      const lastMonth = today.subtract(1, 'month');
      return {
        dateFrom: lastMonth.startOf('month').format('YYYY-MM-DD'),
        dateTo: lastMonth.endOf('month').format('YYYY-MM-DD'),
      };
    }
    default:
      return {
        dateFrom: today.startOf('isoWeek').format('YYYY-MM-DD'),
        dateTo: today.endOf('isoWeek').format('YYYY-MM-DD'),
      };
  }
}

export function serializeDashboardFilters(filters: DashboardFilterState): string {
  return JSON.stringify({
    preset: filters.preset,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    organisationIds: [...filters.organisationIds].sort(),
    priority: filters.priority ?? '',
  });
}

export function createDefaultDashboardFilters(): DashboardFilterState {
  const range = getDateRangeForPreset('this_week');
  return {
    preset: 'this_week',
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    organisationIds: [],
  };
}

export function formatDashboardDateLabel(dateFrom: string, dateTo: string): string {
  const from = dayjs(dateFrom);
  const to = dayjs(dateTo);

  if (!from.isValid() || !to.isValid()) return 'Select date range';
  if (from.isSame(to, 'day')) return from.format('MMMM D, YYYY');
  if (from.isSame(to, 'month')) {
    return `${from.format('MMMM D')} - ${to.format('D, YYYY')}`;
  }
  if (from.isSame(to, 'year')) {
    return `${from.format('MMMM D')} - ${to.format('MMMM D, YYYY')}`;
  }
  return `${from.format('MMMM D, YYYY')} - ${to.format('MMMM D, YYYY')}`;
}

export function formatSingleDashboardDate(dateValue: string): string {
  const date = dayjs(dateValue);
  return date.isValid() ? date.format('MMM D, YYYY') : '';
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
