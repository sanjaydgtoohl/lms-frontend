import type { DeviceData } from '../../types/inventory.types';

export const DEFAULT_APPLIED_LOCATION = {
  country: 'India',
  state: '',
  city: '',
  zoneArea: '',
  subZoneArea: '',
  pincode: '',
  arterialRoute: '',
  modeOfMedia: '',
  publisher: '',
  mainCategory: '',
  categorySub: '',
  category: '',
  locationType: '',
  orientation: '',
  resolution: '',
  screenLocation: '',
  stretch: '',
  property: '',
};

export type DeviceDetailSection = {
  title: string;
  fields: Array<keyof DeviceData | 'media_owner_name'>;
};

export const DEVICE_DETAIL_SECTIONS: DeviceDetailSection[] = [
  {
    title: 'Basic Information',
    fields: [
      'device_details_id',
      'device_id',
      'screen_id',
      'device_name',
      'status',
      'screen_type',
      'code',
      'media_owner_name',
    ],
  },
  {
    title: 'Category & Placement',
    fields: [
      'main_category_name',
      'category_name',
      'sub_category_name',
      'location_type',
      'screen_location',
      'mode_of_media',
      'illumination',
      'facing',
    ],
  },
  {
    title: 'Location',
    fields: [
      'country',
      'state',
      'city',
      'zone',
      'sub_zone_area',
      'pincode',
      'arterial_route',
      'stretch',
      'property',
      'touchpoint',
      'traffic_direction',
      'latitude',
      'longitude',
    ],
  },
  {
    title: 'Screen Specifications',
    fields: [
      'resolution',
      'aspect_ratio',
      'screen_size',
      'width',
      'height',
      'sq_ft',
      'total_sq_ft',
      'orientation',
      'elevation',
      'tilt_degree',
      'on_field_screen_count',
    ],
  },
  {
    title: 'Audience & Pricing',
    fields: [
      'monthly_footfall',
      'daily_impression',
      'max_traffic',
      'languages',
      'min_operating_price',
      'cost_for_impression',
      'cpi_cost',
      'cost_per_spot',
      'cost_per_audience_imp',
      'loop_timing',
      'slot_timing',
      'slot_details',
      'spots_day',
      'slot_per_month',
      'daily_hours_of_loop',
    ],
  },
  {
    title: 'Operating Hours',
    fields: [
      'monday_start_time',
      'monday_end_time',
      'tuesday_start_time',
      'tuesday_end_time',
      'wednesday_start_time',
      'wednesday_end_time',
      'thursday_start_time',
      'thursday_end_time',
      'friday_start_time',
      'friday_end_time',
      'saturday_start_time',
      'saturday_end_time',
      'sunday_start_time',
      'sunday_end_time',
    ],
  },
  {
    title: 'Account & Metadata',
    fields: [
      'company_name',
      'manager_name',
      'email_id',
      'second_email_id',
      'first_name',
      'last_name',
      'access_type',
      'device_limit',
      'expiry_date',
      'markup_applicable',
      'markup_type',
      'markup_value',
      'default_date',
      'update_date',
      'admin_flag',
    ],
  },
];

export const DEVICE_IMAGE_FIELDS: Array<keyof DeviceData> = [
  'device_image',
  'aws_device_image',
  'old_device_image',
];

export function formatDeviceFieldLabel(key: string): string {
  if (key === 'media_owner_name') return 'Media Owner';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getDeviceFieldValue(item: DeviceData, key: string): string {
  if (key === 'media_owner_name') return item.media_owner?.name?.trim() || '-';
  const value = item[key as keyof DeviceData];
  if (value == null || value === '') return '-';
  if (typeof value === 'object') return '-';
  return String(value);
}

export function cellText(value?: string | null): string {
  return value?.trim() || '-';
}

export function locationLabel(item: DeviceData): string {
  const parts = [item.city, item.state].filter(Boolean);
  return parts.length ? parts.join(', ') : '-';
}

export function categoryLabel(item: DeviceData): string {
  const parts = [item.main_category_name, item.category_name].filter(Boolean);
  return parts.length ? parts.join(' · ') : '-';
}
