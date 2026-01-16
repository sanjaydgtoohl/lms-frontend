// Lightweight cookie utilities used to read/write/delete cookies
// Note: HttpOnly cookies cannot be set from client-side JavaScript.
// For true HttpOnly protection the server must set the cookie via Set-Cookie header.
type CookieOptions = {
  expires?: Date | number; // Date or seconds from now
  path?: string;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  httpOnly?: boolean; // can't be enforced from client-side; included for API parity
};

export function setCookie(name: string, value: string, opts: CookieOptions = {}) {
  const parts: string[] = [];
  parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);

  if (opts.expires) {
    let date: Date;
    if (opts.expires instanceof Date) {
      date = opts.expires;
    } else {
      // treat as seconds from now
      date = new Date(Date.now() + (opts.expires as number) * 1000);
    }
    parts.push(`Expires=${date.toUTCString()}`);
  }

  parts.push(`Path=${opts.path || '/'}`);
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);

  // NOTE: HttpOnly cannot be set from JS. If httpOnly requested, we just ignore it here.
  document.cookie = parts.join('; ');
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  // Set expiry in past
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
