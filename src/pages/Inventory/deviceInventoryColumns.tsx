import type { Column } from '../../components/ui/Table';
import type { DeviceData } from '../../types/inventory.types';
import { StatusPill } from '../../components/ui';
import { categoryLabel, cellText, locationLabel } from './deviceInventoryConfig.ts';

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#ef4444',
  pending: '#f59e0b',
};

export function buildDeviceTableColumns(
  onViewDetails: (item: DeviceData) => void
): Column<DeviceData>[] {
  return [
    {
      key: 'device_id',
      header: 'Device ID',
      minWidth: 90,
      render: (item) => (
        <span className="font-medium text-gray-900">{cellText(item.device_id)}</span>
      ),
    },
    {
      key: 'device_name',
      header: 'Device Name',
      minWidth: 160,
      maxWidth: 220,
      render: (item) => cellText(item.device_name),
    },
    {
      key: 'category',
      header: 'Category',
      minWidth: 140,
      maxWidth: 200,
      render: (item) => categoryLabel(item),
    },
    {
      key: 'location',
      header: 'Location',
      minWidth: 120,
      maxWidth: 160,
      render: (item) => locationLabel(item),
    },
    {
      key: 'screen_location',
      header: 'Screen Location',
      minWidth: 140,
      maxWidth: 200,
      render: (item) => cellText(item.screen_location),
    },
    {
      key: 'resolution',
      header: 'Resolution',
      minWidth: 110,
      render: (item) => cellText(item.resolution),
    },
    {
      key: 'screen_size',
      header: 'Screen Size',
      minWidth: 100,
      render: (item) => cellText(item.screen_size),
    },
    {
      key: 'preview',
      header: 'Preview',
      minWidth: 80,
      disableTooltip: true,
      render: (item) => {
        const src = item.device_image || item.aws_device_image || item.old_device_image;
        if (!src) return <span className="text-xs text-gray-400">N/A</span>;
        return (
          <img
            src={src}
            alt={item.device_name || 'Device'}
            className="h-10 w-10 rounded-md border border-gray-200 object-cover"
          />
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      disableTooltip: true,
      render: (item) => {
        const label = cellText(item.status);
        if (label === '-') return label;
        const color = STATUS_COLORS[label.toLowerCase()] || '#64748b';
        return <StatusPill label={label} color={color} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: 120,
      disableTooltip: true,
      allowOverflow: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="inline-flex items-center rounded-lg border border-[var(--brand-primary,#007b83)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary,#007b83)] transition-colors hover:bg-[var(--brand-primary,#007b83)] hover:text-white"
        >
          View Details
        </button>
      ),
    },
  ];
}
