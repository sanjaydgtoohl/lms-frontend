import PptxGenJS from 'pptxgenjs';
import logoUrl from '../assets/logo.svg';
import { BRAND } from '../constants/brand';
import type { DeviceData } from '../types/inventory.types';
import { loadDeviceImageDataUrl } from './deviceImageLoader';

const SLIDE_BACKGROUND = 'FFFFFF';
const DETAIL_CARD_BACKGROUND = 'FFFFFF';
const BORDER_COLOR = 'D1D5DB';
const TEXT_PRIMARY = '111827';
const TEXT_SECONDARY = '64748B';
const ACCENT_COLOR = '0F4C81';
const FOOTER_ACCENT = 'FF6600';
const PANEL_BACKGROUND = 'F8FAFC';
const TABLE_LABEL_BG = 'F1F5F9';

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;
const LOGO_WIDTH = 1.45;
const LOGO_HEIGHT = 0.55;
const SLIDE_PADDING = 0.3;
const COLUMN_GAP = 0.35;
const HEADER_BLOCK_HEIGHT = 0.95;
const FOOTER_BLOCK_HEIGHT = 0.72;
const LEFT_PANEL_WIDTH = 6.15;
const RIGHT_PANEL_WIDTH =
  SLIDE_WIDTH - SLIDE_PADDING * 2 - LEFT_PANEL_WIDTH - COLUMN_GAP;
const PANEL_HEIGHT =
  SLIDE_HEIGHT - SLIDE_PADDING * 2 - HEADER_BLOCK_HEIGHT - FOOTER_BLOCK_HEIGHT - 0.15;
const HEADER_TITLE = 'Device Inventory Report';
const DETAIL_FONT_SIZE = 9;
const DETAIL_ROW_HEIGHT = 0.28;
const IMAGE_BATCH_SIZE = 20;
const IMAGE_FETCH_TIMEOUT = 8000;

const brandLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60"><rect width="260" height="60" rx="12" fill="#0F4C81"/><text x="20" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">${BRAND.productShort}</text><text x="20" y="52" font-family="Arial, sans-serif" font-size="12" fill="#D9E7FF">LMS</text></svg>`;

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" rx="24" fill="#F1F5F9"/><rect x="128" y="96" width="384" height="232" rx="16" fill="#E2E8F0"/><path d="M208 320h224a16 16 0 0 1 16 16v24H192v-24a16 16 0 0 1 16-16Z" fill="#CBD5E1"/><text x="320" y="360" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#64748B" text-anchor="middle">No Image Available</text></svg>`;
const PLACEHOLDER_IMAGE = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(placeholderSvg)))}`;

const safeText = (value?: string | null) => (value ? String(value) : 'N/A');

const encodeSvgToDataUrl = (svg: string) =>
  `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;

const getLogoDataUrl = async (): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);

  try {
    const response = await fetch(logoUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`Logo fetch failed: ${response.status}`);
    const svgText = await response.text();
    return encodeSvgToDataUrl(svgText);
  } catch (error) {
    console.warn('Failed to fetch logo asset, using fallback brand logo.', error);
    return encodeSvgToDataUrl(brandLogoSvg);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

type ImageSource = {
  data: string;
};

const getImageSource = async (device: DeviceData): Promise<ImageSource> => {
  const dataUrl = await loadDeviceImageDataUrl(device);
  if (dataUrl) {
    return { data: dataUrl };
  }

  console.warn('PPT image fetch failed, using placeholder:', device.device_name);
  return { data: PLACEHOLDER_IMAGE };
};

type DetailRow = { label: string; value: string };

const buildDetailRows = (device: DeviceData): DetailRow[] => [
  { label: 'City', value: safeText(device.city) },
  { label: 'State', value: safeText(device.state) },
  { label: 'Location Type', value: safeText(device.location_type) },
  { label: 'Category', value: safeText(device.category_name) },
  { label: 'Screen Size', value: safeText(device.screen_size) },
  { label: 'Resolution', value: safeText(device.resolution) },
  { label: 'Aspect Ratio', value: safeText(device.aspect_ratio) },
  { label: 'Latitude', value: safeText(device.latitude) },
  { label: 'Longitude', value: safeText(device.longitude) },
  { label: 'Width', value: safeText(device.width) },
  { label: 'Height', value: safeText(device.height) },
  { label: 'Daily Impressions', value: safeText(device.daily_impression) },
  { label: 'Mode of Media', value: safeText(device.mode_of_media) },
];

function splitDetailRows(rows: DetailRow[]): [DetailRow[], DetailRow[]] {
  const midpoint = Math.ceil(rows.length / 2);
  return [rows.slice(0, midpoint), rows.slice(midpoint)];
}

function getDeviceNamePresentation(
  name: string,
  boxWidthInches: number
): { text: string; fontSize: number; blockHeight: number } {
  const text = name.trim() || 'Unknown Device';
  const length = text.length;

  let fontSize = 13;
  if (length > 70) fontSize = 9;
  else if (length > 50) fontSize = 10;
  else if (length > 32) fontSize = 11;
  else if (length > 20) fontSize = 12;

  const charsPerLine = Math.max(18, Math.floor(boxWidthInches * 11.5));
  const lineCount = Math.max(1, Math.ceil(length / charsPerLine));
  const lineHeight = fontSize / 72 + 0.055;
  const blockHeight = Math.min(1.0, 0.12 + lineCount * lineHeight);

  return { text, fontSize, blockHeight };
}

function buildDetailTableRows(rows: DetailRow[]): PptxGenJS.TableRow[] {
  return rows.map((row) => [
    {
      text: row.label,
      options: {
        bold: true,
        fontSize: DETAIL_FONT_SIZE,
        color: TEXT_SECONDARY,
        fill: { color: TABLE_LABEL_BG },
        align: 'left' as const,
        valign: 'middle' as const,
      },
    },
    {
      text: row.value,
      options: {
        bold: false,
        fontSize: DETAIL_FONT_SIZE,
        color: TEXT_PRIMARY,
        fill: { color: DETAIL_CARD_BACKGROUND },
        align: 'left' as const,
        valign: 'middle' as const,
      },
    },
  ]);
}

export type DeviceInventoryPptxProgress = {
  loaded: number;
  total: number;
  stage: 'images' | 'slides' | 'file';
};

export type DeviceInventoryPptxOptions = {
  onProgress?: (progress: DeviceInventoryPptxProgress) => void;
};

export type DeviceInventoryPptxResult = {
  exportedCount: number;
};

async function loadImageSourcesInBatches(
  devices: DeviceData[],
  onProgress?: (progress: DeviceInventoryPptxProgress) => void
): Promise<ImageSource[]> {
  const results: ImageSource[] = [];
  const total = devices.length;

  for (let index = 0; index < devices.length; index += IMAGE_BATCH_SIZE) {
    const batch = devices.slice(index, index + IMAGE_BATCH_SIZE);
    const batchSources = await Promise.all(batch.map((device) => getImageSource(device)));
    results.push(...batchSources);

    onProgress?.({
      loaded: Math.min(index + batch.length, total),
      total,
      stage: 'images',
    });
  }

  return results;
}

export async function generateDeviceInventoryPptx(
  devices: DeviceData[],
  options: DeviceInventoryPptxOptions = {}
): Promise<DeviceInventoryPptxResult> {
  const exportDevices = devices;
  const { onProgress } = options;

  const pptx = new PptxGenJS();
  pptx.author = BRAND.exportAuthor;
  pptx.company = BRAND.exportCompany;
  pptx.title = 'Device Inventory Report';
  pptx.layout = 'LAYOUT_WIDE';

  const logoDataUrl = await getLogoDataUrl();

  const contentTop = SLIDE_PADDING + HEADER_BLOCK_HEIGHT;

  const addReportHeader = (slide: PptxGenJS.Slide, device: DeviceData) => {
    const locationLine = `${safeText(device.city)} - ${safeText(device.location_type)}`;

    slide.addImage({
      data: logoDataUrl,
      x: SLIDE_PADDING,
      y: SLIDE_PADDING,
      w: LOGO_WIDTH,
      h: LOGO_HEIGHT,
      sizing: { type: 'contain', w: LOGO_WIDTH, h: LOGO_HEIGHT },
    });

    slide.addText(
      [
        { text: 'LOCATION: ', options: { bold: true, fontSize: 14, color: FOOTER_ACCENT } },
        { text: locationLine, options: { bold: false, fontSize: 14, color: TEXT_PRIMARY } },
      ],
      {
        x: SLIDE_PADDING + LOGO_WIDTH + 0.2,
        y: SLIDE_PADDING + 0.02,
        w: 5.5,
        h: 0.35,
        fontFace: 'Arial',
      }
    );

    slide.addText(HEADER_TITLE, {
      x: SLIDE_PADDING + LOGO_WIDTH + 0.15,
      y: SLIDE_PADDING + 0.34,
      w: SLIDE_WIDTH - SLIDE_PADDING * 2 - LOGO_WIDTH - 0.15,
      h: 0.42,
      align: 'center',
      fontSize: 22,
      bold: true,
      color: TEXT_PRIMARY,
      fontFace: 'Arial',
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: SLIDE_PADDING,
      y: SLIDE_PADDING + HEADER_BLOCK_HEIGHT - 0.08,
      w: SLIDE_WIDTH - SLIDE_PADDING * 2,
      h: 0.03,
      fill: { color: ACCENT_COLOR },
      line: { color: ACCENT_COLOR },
    });
  };

  const addDeviceImagePanel = (slide: PptxGenJS.Slide, imageSource: ImageSource) => {
    const panelX = SLIDE_PADDING;
    const panelY = contentTop;

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX,
      y: panelY,
      w: LEFT_PANEL_WIDTH,
      h: PANEL_HEIGHT,
      fill: { color: PANEL_BACKGROUND },
      line: { color: BORDER_COLOR },
      rectRadius: 0.15,
    });

    slide.addImage({
      data: imageSource.data,
      x: panelX + 0.18,
      y: panelY + 0.18,
      w: LEFT_PANEL_WIDTH - 0.36,
      h: PANEL_HEIGHT - 0.36,
      sizing: {
        type: 'contain',
        w: LEFT_PANEL_WIDTH - 0.36,
        h: PANEL_HEIGHT - 0.36,
      },
    });
  };

  const addDeviceDetailsPanel = (slide: PptxGenJS.Slide, device: DeviceData) => {
    const panelX = SLIDE_PADDING + LEFT_PANEL_WIDTH + COLUMN_GAP;
    const panelY = contentTop;
    const innerPad = 0.22;
    const innerWidth = RIGHT_PANEL_WIDTH - innerPad * 2;
    const tableGap = 0.12;
    const halfTableWidth = (innerWidth - tableGap) / 2;
    const labelColWidth = 1.05;
    const valueColWidth = halfTableWidth - labelColWidth;
    const detailRows = buildDetailRows(device);
    const [leftRows, rightRows] = splitDetailRows(detailRows);
    const deviceName = getDeviceNamePresentation(device.device_name || 'Unknown Device', innerWidth);
    const nameY = panelY + innerPad + 0.4;
    const metaY = nameY + deviceName.blockHeight + 0.05;
    const tableY = metaY + 0.24;

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX,
      y: panelY,
      w: RIGHT_PANEL_WIDTH,
      h: PANEL_HEIGHT,
      fill: { color: DETAIL_CARD_BACKGROUND },
      line: { color: BORDER_COLOR },
      rectRadius: 0.15,
    });

    slide.addText('Device details', {
      x: panelX + innerPad,
      y: panelY + innerPad,
      w: innerWidth,
      h: 0.28,
      fontSize: 11,
      bold: true,
      color: ACCENT_COLOR,
      fontFace: 'Arial',
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX + innerPad,
      y: panelY + innerPad + 0.34,
      w: innerWidth,
      h: 0.025,
      fill: { color: ACCENT_COLOR },
      line: { color: ACCENT_COLOR },
    });

    slide.addText(deviceName.text, {
      x: panelX + innerPad,
      y: nameY,
      w: innerWidth,
      h: deviceName.blockHeight,
      fontSize: deviceName.fontSize,
      bold: true,
      color: TEXT_PRIMARY,
      fontFace: 'Arial',
      valign: 'top',
      wrap: true,
      lineSpacing: Math.max(12, Math.round(deviceName.fontSize * 1.2)),
    });

    slide.addText(
      `Device ID: ${safeText(device.device_id)}  |  Screen ID: ${safeText(device.screen_id)}`,
      {
        x: panelX + innerPad,
        y: metaY,
        w: innerWidth,
        h: 0.2,
        fontSize: 8,
        color: TEXT_SECONDARY,
        fontFace: 'Arial',
        valign: 'top',
      }
    );

    const tableOptions = {
      x: panelX + innerPad,
      y: tableY,
      w: halfTableWidth,
      colW: [labelColWidth, valueColWidth],
      rowH: DETAIL_ROW_HEIGHT,
      fontFace: 'Arial',
      border: { type: 'solid' as const, color: BORDER_COLOR, pt: 0.5 },
      margin: [2, 4, 2, 4] as [number, number, number, number],
    };

    slide.addTable(buildDetailTableRows(leftRows), tableOptions);

    slide.addTable(buildDetailTableRows(rightRows), {
      ...tableOptions,
      x: panelX + innerPad + halfTableWidth + tableGap,
    });
  };

  const addFooter = (slide: PptxGenJS.Slide, device: DeviceData) => {
    const footerY = SLIDE_HEIGHT - SLIDE_PADDING - FOOTER_BLOCK_HEIGHT;
    const footerWidth = SLIDE_WIDTH - SLIDE_PADDING * 2;
    const exportTime = new Date().toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: SLIDE_PADDING,
      y: footerY,
      w: footerWidth,
      h: FOOTER_BLOCK_HEIGHT,
      fill: { color: FOOTER_ACCENT },
      line: { color: FOOTER_ACCENT },
      rectRadius: 0.08,
    });

    const footerMetrics = [
      `Display Size: ${safeText(device.screen_size)}`,
      `Media Type: ${safeText(device.mode_of_media)}`,
      `Impressions/Day: ${safeText(device.daily_impression)}`,
      `Resolution: ${safeText(device.resolution)}`,
      `Spot (Sec): ${safeText(device.slot_timing)}`,
      `Loop (Min): ${safeText(device.loop_timing)}`,
    ];

    const metricWidth = footerWidth / 3;
    footerMetrics.forEach((metric, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      slide.addText(metric, {
        x: SLIDE_PADDING + col * metricWidth + 0.12,
        y: footerY + 0.1 + row * 0.28,
        w: metricWidth - 0.2,
        h: 0.24,
        fontSize: 9,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
        valign: 'middle',
      });
    });

    slide.addText(`${BRAND.exportFooter}  •  ${exportTime}`, {
      x: SLIDE_PADDING,
      y: footerY + FOOTER_BLOCK_HEIGHT + 0.04,
      w: footerWidth,
      h: 0.18,
      align: 'right',
      fontSize: 8,
      color: TEXT_SECONDARY,
      fontFace: 'Arial',
    });
  };

  const imageSources = await loadImageSourcesInBatches(exportDevices, onProgress);

  exportDevices.forEach((device, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: SLIDE_BACKGROUND };

    addReportHeader(slide, device);
    addDeviceImagePanel(slide, imageSources[index]);
    addDeviceDetailsPanel(slide, device);
    addFooter(slide, device);

    if ((index + 1) % IMAGE_BATCH_SIZE === 0 || index + 1 === exportDevices.length) {
      onProgress?.({
        loaded: index + 1,
        total: exportDevices.length,
        stage: 'slides',
      });
    }
  });

  onProgress?.({
    loaded: exportDevices.length,
    total: exportDevices.length,
    stage: 'file',
  });

  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  await pptx.writeFile({ fileName: `Device_Inventory_Report_${dateStamp}.pptx` });

  return {
    exportedCount: exportDevices.length,
  };
}
