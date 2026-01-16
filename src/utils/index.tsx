// Utility helpers for search parsing and matching
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

export interface SearchOptions {
  fields?: string[];
  useStartsWith?: boolean;
}

// item: record, q: raw query string, options?: SearchOptions
export function matchesQuery(item: Record<string, any>, q: string, { fields, useStartsWith = false }: SearchOptions = {}): boolean {
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
		return useStartsWith ? left.startsWith(right) : left === right;
	}

	const qLower = raw.toLowerCase();
	const keys = fields && fields.length ? fields : Object.keys(item);
	return keys.some(k => {
		const value = String(item[k] ?? '').toLowerCase();
		return useStartsWith ? value.startsWith(qLower) : value.includes(qLower);
	});
}

export default {};

