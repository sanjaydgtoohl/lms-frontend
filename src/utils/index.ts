// Utility functions
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const toTitleCase = (input: string): string => {
  if (!input) return input;
  return String(input)
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// --- Search helpers (support exact field matching with syntax `field:term`) ---
export type FieldQuery = { field: string; term: string } | null;

const normalizeKey = (s: string) => String(s || '').toLowerCase().replace(/\s+/g, '');

export function parseFieldQuery(q: string): FieldQuery {
  if (!q) return null;
  const idx = q.indexOf(':') >= 0 ? q.indexOf(':') : q.indexOf('=');
  if (idx === -1) return null;
  const field = q.slice(0, idx).trim();
  const term = q.slice(idx + 1).trim();
  if (!field) return null;
  return { field: field.toLowerCase(), term };
}

// item: record, q: raw query string, fields?: list of keys to search when not using field query
export function matchesQuery(item: Record<string, any>, q: string, fields?: string[]): boolean {
  if (!q) return true;
  const raw = String(q).trim();
  if (!raw) return true;
  const parsed = parseFieldQuery(raw);
  if (parsed) {
    const wantKeyNorm = parsed.field.replace(/\s+/g, '');
    const foundKey = Object.keys(item).find(k => normalizeKey(k) === wantKeyNorm || k.toLowerCase() === parsed.field);
    if (!foundKey) return false;
    const val = item[foundKey];
    const left = String(val ?? '').trim().toLowerCase();
    const right = String(parsed.term ?? '').trim().toLowerCase();
    return left === right; // exact match
  }

  const qLower = raw.toLowerCase();
  const keys = fields && fields.length ? fields : Object.keys(item);
  return keys.some(k => String(item[k] ?? '').toLowerCase().includes(qLower));
}

