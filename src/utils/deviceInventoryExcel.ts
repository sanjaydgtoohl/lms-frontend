import * as XLSX from 'xlsx';
import type { DeviceData } from '../types/inventory.types';
import { DEVICE_INVENTORY_CSV_COLUMNS } from '../pages/Inventory/deviceInventoryCsv';
import { defaultDatedXlsxFilename, downloadBlobFile } from './downloadFile';

function cellValue(row: DeviceData, key: string, valueFn?: (row: DeviceData) => unknown): string {
  const raw = valueFn?.(row) ?? (row as unknown as Record<string, unknown>)[key];
  if (raw === null || raw === undefined) return '';
  return String(raw);
}

export function exportDeviceInventoryExcel(rows: DeviceData[]): void {
  const headers = DEVICE_INVENTORY_CSV_COLUMNS.map((column) => column.header ?? column.key);
  const body = rows.map((row) =>
    DEVICE_INVENTORY_CSV_COLUMNS.map((column) =>
      cellValue(row, column.key, column.value)
    )
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Device Inventory');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlobFile(defaultDatedXlsxFilename('device-inventory'), blob);
}
