/**
 * Parse API date strings like "19-11-2025 10:35:57" (DD-MM-YYYY HH:mm:ss)
 */
export function parseApiDateToISO(s?: string): string {
  if (!s) return '';
  const m = String(s).trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return s;
  const [, dd, mm, yyyy, hh, min, sec] = m;
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec || '00'}`;
}

export function formatDisplayDate(s?: string): string {
  if (!s) return '-';
  try {
    const iso = parseApiDateToISO(s);
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(s);
    return d.toLocaleString();
  } catch {
    return String(s);
  }
}
