import PptxGenJS from 'pptxgenjs';
import logoUrl from '../assets/DGTOOHL 360.svg';
import type { DeviceData } from '../types/inventory.types';

const SLIDE_BACKGROUND = 'F7F8FA';
const DETAIL_CARD_BACKGROUND = 'FFFFFF';
const BORDER_COLOR = 'D1D5DB';
const TEXT_PRIMARY = '111827';
const TEXT_SECONDARY = '475569';
const ACCENT_COLOR = '0F4C81';
const PANEL_BACKGROUND = 'F4F6F8';

const LOGO_WIDTH = 1.6;
const LOGO_HEIGHT = 0.6;
const SLIDE_PADDING = 0.35;
const COLUMN_GAP = 0.4;
const LEFT_PANEL_WIDTH = 5.0;
const RIGHT_PANEL_WIDTH = 4.35;
const PANEL_HEIGHT = 4.4;
const HEADER_TITLE = 'Device Inventory Report';

const brandLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60"><rect width="260" height="60" rx="12" fill="#0F4C81"/><text x="20" y="38" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">DGTOOHL360</text><text x="20" y="52" font-family="Arial, sans-serif" font-size="12" fill="#D9E7FF">LMS</text></svg>`;

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><rect width="640" height="480" rx="24" fill="#F1F5F9"/><rect x="128" y="96" width="384" height="232" rx="16" fill="#E2E8F0"/><path d="M208 320h224a16 16 0 0 1 16 16v24H192v-24a16 16 0 0 1 16-16Z" fill="#CBD5E1"/><text x="320" y="360" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#64748B" text-anchor="middle">No Image Available</text></svg>`;
const PLACEHOLDER_IMAGE = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(placeholderSvg)))}`;

const safeText = (value?: string | null) => (value ? String(value) : 'N/A');

const encodeSvgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;

const getLogoDataUrl = async (): Promise<string> => {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) throw new Error(`Logo fetch failed: ${response.status}`);
    const svgText = await response.text();
    return encodeSvgToDataUrl(svgText);
  } catch (error) {
    console.warn('Failed to fetch logo asset, using fallback brand logo.', error);
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(brandLogoSvg)))}`;
  }
};

const normalizeImageUrl = (url: string): string => {
  try {
    if (url.startsWith('//')) {
      return `${window.location.protocol}${url}`;
    }
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
};

type ImageSource = {
  data: string;
};

const getImageSource = async (url: string | undefined | null): Promise<ImageSource> => {
  if (!url) {
    return { data: PLACEHOLDER_IMAGE };
  }

  const normalizedUrl = normalizeImageUrl(url);
  const origin = window.location.origin;
  let fetchUrl = normalizedUrl;

  try {
    const imageUrl = new URL(normalizedUrl, origin);
    if (imageUrl.origin !== origin) {
      if (imageUrl.host === 'd2nljoxssb7y4b.cloudfront.net') {
        fetchUrl = `/remote-images${imageUrl.pathname}${imageUrl.search}`;
      } else {
        return { data: PLACEHOLDER_IMAGE };
      }
    }
  } catch {
    return { data: PLACEHOLDER_IMAGE };
  }

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.warn('PPT image fetch returned non-ok response:', response.status, normalizedUrl);
      return { data: PLACEHOLDER_IMAGE };
    }

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to convert image to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });

    return { data: dataUrl };
  } catch (error) {
    console.warn('PPT image fetch failed, using placeholder:', error, normalizedUrl);
    return { data: PLACEHOLDER_IMAGE };
  }
};

const buildDetailRows = (device: DeviceData) => [
  { label: 'Device ID', value: safeText(device.device_id) },
  { label: 'Device Name', value: safeText(device.device_name) },
  { label: 'Latitude', value: safeText(device.latitude) },
  { label: 'Longitude', value: safeText(device.longitude) },
  { label: 'Width', value: safeText(device.width) },
  { label: 'Height', value: safeText(device.height) },
  { label: 'Resolution', value: safeText(device.resolution) },
  { label: 'Aspect Ratio', value: safeText(device.aspect_ratio) },
];

const formatDetailText = (rows: Array<{ label: string; value: string }>) =>
  rows.flatMap((row, index) => [
    {
      text: `${row.label}: `,
      options: { bold: true, fontSize: 12, color: TEXT_SECONDARY, fontFace: 'Arial' },
    },
    {
      text: row.value,
      options: { bold: false, fontSize: 12, color: TEXT_PRIMARY, fontFace: 'Arial' },
    },
    index < rows.length - 1
      ? { text: '\n', options: { fontSize: 12, color: TEXT_PRIMARY, fontFace: 'Arial' } }
      : null,
  ])
  .filter(Boolean) as Array<{ text: string; options: { bold: boolean; fontSize: number; color: string; fontFace: string } }>;

export async function generateDeviceInventoryPptx(devices: DeviceData[]): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.author = 'DGTOOHL360 LMS';
  pptx.company = 'DGTOOHL360';
  pptx.title = 'Device Inventory Report';
  pptx.layout = 'LAYOUT_WIDE';

  const logoDataUrl = await getLogoDataUrl();
  const imageSources = await Promise.all(
    devices.map((device) =>
      getImageSource(device.aws_device_image || device.device_image || device.old_device_image)
    )
  );

  const addReportHeader = (slide: any) => {
    slide.addImage({
      data: logoDataUrl,
      x: SLIDE_PADDING,
      y: SLIDE_PADDING,
      w: LOGO_WIDTH,
      h: LOGO_HEIGHT,
      sizing: { type: 'contain', w: LOGO_WIDTH, h: LOGO_HEIGHT },
    });

    slide.addText(HEADER_TITLE, {
      x: SLIDE_PADDING + LOGO_WIDTH + 0.3,
      y: SLIDE_PADDING + 0.05,
      w: 8.2,
      h: 0.8,
      align: 'center',
      fontSize: 28,
      bold: true,
      color: TEXT_PRIMARY,
      fontFace: 'Arial',
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: SLIDE_PADDING + LOGO_WIDTH + 0.8,
      y: SLIDE_PADDING + 0.85,
      w: 6.8,
      h: 0.04,
      fill: { color: ACCENT_COLOR },
      line: { color: ACCENT_COLOR },
    });
  };

  const addDeviceImagePanel = (slide: any, imageSource: ImageSource) => {
    const panelX = SLIDE_PADDING;
    const panelY = SLIDE_PADDING + 1.1;

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX,
      y: panelY,
      w: LEFT_PANEL_WIDTH,
      h: PANEL_HEIGHT,
      fill: { color: PANEL_BACKGROUND },
      line: { color: BORDER_COLOR },
      rectRadius: 0.3,
      // shadow: panelShadow, // Removed shadow to prevent PowerPoint corruption
    });

    slide.addImage({
      data: imageSource.data,
      x: panelX + 0.25,
      y: panelY + 0.25,
      w: LEFT_PANEL_WIDTH - 0.5,
      h: PANEL_HEIGHT - 0.5,
      sizing: { type: 'contain', w: LEFT_PANEL_WIDTH - 0.5, h: PANEL_HEIGHT - 0.5 },
    });
  };

  const addDeviceDetailsPanel = (slide: any, device: DeviceData) => {
    const panelX = SLIDE_PADDING + LEFT_PANEL_WIDTH + COLUMN_GAP;
    const panelY = SLIDE_PADDING + 1.1;

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX,
      y: panelY,
      w: RIGHT_PANEL_WIDTH,
      h: PANEL_HEIGHT,
      fill: { color: DETAIL_CARD_BACKGROUND },
      line: { color: BORDER_COLOR },
      rectRadius: 0.3,
      // shadow: panelShadow, // Removed shadow to prevent PowerPoint corruption
    });

    slide.addText('Device details', {
      x: panelX + 0.25,
      y: panelY + 0.25,
      fontSize: 12,
      bold: true,
      color: ACCENT_COLOR,
      fontFace: 'Arial',
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: panelX + 0.25,
      y: panelY + 0.7,
      w: RIGHT_PANEL_WIDTH - 0.5,
      h: 0.03,
      fill: { color: ACCENT_COLOR },
      line: { color: ACCENT_COLOR },
    });

    slide.addText(
      [
        {
          text: device.device_name ? device.device_name : 'Unknown Device',
          options: { bold: true, fontSize: 22, color: TEXT_PRIMARY, fontFace: 'Arial' },
        },
        {
          text: `\nDevice ID: ${safeText(device.device_id)}`,
          options: { bold: false, fontSize: 13, color: TEXT_SECONDARY, fontFace: 'Arial' },
        },
      ],
      {
        x: panelX + 0.25,
        y: panelY + 0.95,
        w: RIGHT_PANEL_WIDTH - 0.5,
        h: 0.9,
        lineSpacing: 18,
      }
    );

    slide.addText(formatDetailText(buildDetailRows(device)), {
      x: panelX + 0.25,
      y: panelY + 2.0,
      w: RIGHT_PANEL_WIDTH - 0.5,
      h: 3.4,
      lineSpacing: 18,
    });
  };

  const addFooter = (slide: any) => {
    const exportTime = new Date().toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    slide.addText(
      [
        {
          text: 'Generated from DGTOOHL360 LMS',
          options: { fontSize: 10, color: TEXT_SECONDARY, fontFace: 'Arial' },
        },
        {
          text: ` • ${exportTime}`,
          options: { fontSize: 10, color: TEXT_SECONDARY, fontFace: 'Arial' },
        },
      ],
      {
        x: SLIDE_PADDING,
        y: SLIDE_PADDING + PANEL_HEIGHT + 1.05,
        w: 12.3,
        h: 0.4,
        align: 'right',
      }
    );
  };

  devices.forEach((device, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: SLIDE_BACKGROUND };

    addReportHeader(slide);
    addDeviceImagePanel(slide, imageSources[index]);
    addDeviceDetailsPanel(slide, device);
    addFooter(slide);
  });

  await pptx.writeFile({ fileName: 'Device_Inventory_Report.pptx' });
}
