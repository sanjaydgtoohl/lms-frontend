import React from 'react';
import ModalPopup from '../../components/ui/ModalPopup';
import type { DeviceData } from '../../types/inventory.types';
import {
  DEVICE_DETAIL_SECTIONS,
  DEVICE_IMAGE_FIELDS,
  formatDeviceFieldLabel,
  getDeviceFieldValue,
} from './deviceInventoryConfig.ts';

type DeviceDetailModalProps = {
  device: DeviceData | null;
  onClose: () => void;
};

const isImageUrl = (value: string) =>
  /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(value) ||
  value.includes('cloudfront.net') ||
  value.includes('/images/');

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, onClose }) => {
  if (!device) return null;

  const title = device.device_name?.trim() || `Device #${device.device_id || device.device_details_id}`;

  return (
    <ModalPopup
      show={Boolean(device)}
      onClose={onClose}
      title={title}
      panelClassName="max-w-4xl"
      bodyClassName="max-h-[75vh] overflow-y-auto"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Device ID:</span> {device.device_id || '-'}
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium text-gray-900">Screen ID:</span> {device.screen_id || '-'}
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium text-gray-900">City:</span> {device.city || '-'}
        </div>

        {DEVICE_IMAGE_FIELDS.some((key) => getDeviceFieldValue(device, key) !== '-') && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Images
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DEVICE_IMAGE_FIELDS.map((key) => {
                const value = getDeviceFieldValue(device, key);
                if (value === '-') return null;
                return (
                  <div
                    key={key}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                      {formatDeviceFieldLabel(key)}
                    </div>
                    {isImageUrl(value) ? (
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        <img
                          src={value}
                          alt={formatDeviceFieldLabel(key)}
                          className="h-36 w-full object-cover"
                        />
                      </a>
                    ) : (
                      <p className="px-3 py-4 text-sm text-gray-700 break-all">{value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {DEVICE_DETAIL_SECTIONS.map((section) => {
          const rows = section.fields
            .map((field) => ({
              field,
              label: formatDeviceFieldLabel(field),
              value: getDeviceFieldValue(device, field),
            }))
            .filter((row) => row.value !== '-');

          if (rows.length === 0) return null;

          return (
            <section key={section.title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rows.map((row) => (
                  <div
                    key={row.field}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 break-words">{row.value}</dd>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </ModalPopup>
  );
};

export default DeviceDetailModal;
