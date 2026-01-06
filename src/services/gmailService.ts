// Gmail integration using Google Identity Services (browser)
// Usage:
// 1. Set your client id in an env var: VITE_GOOGLE_CLIENT_ID
// 2. Call `initGmail(clientId)` once (e.g., app startup)
// 3. Call `await requestAccessToken()` to prompt the user to sign in and grant scopes
// 4. Use `sendEmail`, `listMessages`, `getMessage` to interact with Gmail
// Example (React):
// import React, {useEffect} from 'react'
// import gmailService from 'src/services/gmailService'
// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'
// useEffect(() => { gmailService.initGmail(CLIENT_ID); }, [])
// async function signInAndSend() {
//   await gmailService.requestAccessToken();
//   await gmailService.sendEmail('recipient@example.com', 'Hello', '<p>Hi</p>')
// }

let tokenClient: any = null;
let accessToken: string | null = null;
let pendingResolver: ((token: string | null) => void) | null = null;

export function initGmail(clientId: string, scopes: string[] = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
]) {
  if (!(window as any).google) {
    throw new Error('Google Identity Services script not loaded. Add the script to index.html');
  }

  // Basic runtime validation to help debug invalid_client errors
  try {
    const origin = window.location.origin;
    // log helpful info to console for debugging
    // eslint-disable-next-line no-console
    console.info('[gmailService] initGmail', { clientId, origin, scopes });

    if (!clientId || clientId === 'YOUR_CLIENT_ID' || clientId.indexOf('apps.googleusercontent.com') === -1) {
      // eslint-disable-next-line no-console
      console.error('[gmailService] Invalid Google client id. Please set VITE_GOOGLE_CLIENT_ID in .env to your Web OAuth Client ID.');
      throw new Error('Invalid Google client id. Please set VITE_GOOGLE_CLIENT_ID to your Web OAuth Client ID.');
    }
  } catch (e) {
    // Re-throw after logging
    throw e;
  }

  tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    callback: (resp: any) => {
      accessToken = resp?.access_token || null;
      if (pendingResolver) {
        pendingResolver(accessToken);
        pendingResolver = null;
      }
    },
  });
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function requestAccessToken(prompt: 'none' | 'consent' | 'select_account' = 'consent') {
  return new Promise<string>((resolve, reject) => {
    if (!tokenClient) return reject(new Error('tokenClient not initialized. Call initGmail(clientId)'));
    pendingResolver = (token) => {
      if (token) resolve(token);
      else reject(new Error('Failed to obtain access token'));
    };

    try {
      tokenClient.requestAccessToken({ prompt });
    } catch (err) {
      pendingResolver = null;
      reject(err);
    }
  });
}

export async function revokeToken() {
  if (!accessToken) throw new Error('No access token to revoke');
  await fetch('https://oauth2.googleapis.com/revoke?token=' + accessToken, { method: 'POST', headers: { 'Content-type': 'application/x-www-form-urlencoded' } });
  accessToken = null;
}

function base64UrlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Module-level queue and retry/backoff for Gmail API requests to avoid 429 rateLimitExceeded
const _gmailQueue: Array<() => Promise<void>> = [];
let _gmailActive = 0;
const _GMAIL_MAX_CONCURRENT = 1; // serialize requests by default

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function _processQueue() {
  while (_gmailActive < _GMAIL_MAX_CONCURRENT && _gmailQueue.length > 0) {
    const job = _gmailQueue.shift()!;
    _gmailActive++;
    job()
      .catch(() => {
        // errors handled by job's promise
      })
      .finally(() => {
        _gmailActive--;
        // schedule next tick to avoid deep recursion
        setTimeout(_processQueue, 0);
      });
  }
}

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    _gmailQueue.push(async () => {
      try {
        const r = await fn();
        resolve(r);
      } catch (e) {
        reject(e);
      }
    });
    _processQueue();
  });
}

async function attemptFetchWithRetries(path: string, opts: RequestInit = {}) {
  if (!accessToken) {
    // Token is missing, request a new one with minimal prompt
    try {
      await requestAccessToken('none').catch(() => {
        // If 'none' fails (user not signed in), request consent
        return requestAccessToken('consent');
      });
    } catch (e) {
      throw new Error('No access token. User authentication required. Call requestAccessToken()');
    }
  }
  const headers = Object.assign({}, opts.headers || {}, { Authorization: `Bearer ${accessToken}` });
  const MAX_ATTEMPTS = 4;
  let attempt = 0;
  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, { ...opts, headers });
      if (res.ok) {
        return res.json();
      }
      const body = await res.text();
      // Handle 401 Unauthorized - token likely expired
      if (res.status === 401) {
        accessToken = null;
        // eslint-disable-next-line no-console
        console.warn('[gmailService] Access token expired, requesting new one');
        try {
          await requestAccessToken('none').catch(() => {
            return requestAccessToken('consent');
          });
          // Retry with new token
          if (accessToken) {
            const newHeaders = Object.assign({}, opts.headers || {}, { Authorization: `Bearer ${accessToken}` });
            const retryRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, { ...opts, headers: newHeaders });
            if (retryRes.ok) {
              return retryRes.json();
            }
          }
        } catch (e) {
          throw new Error('Failed to refresh access token');
        }
        throw new Error(`Gmail API error ${res.status}: ${body}`);
      }
      // Retry on 429 Too Many Requests or 5xx server errors
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const backoff = 200 * Math.pow(2, attempt - 1);
        await sleep(backoff);
        continue;
      }
      throw new Error(`Gmail API error ${res.status}: ${body}`);
    } catch (err: any) {
      // Network errors or other unexpected errors: retry a few times
      const msg = String(err || '');
      if (attempt < MAX_ATTEMPTS && (msg.includes('NetworkError') || msg.includes('Failed to fetch') || msg.includes('429') || msg.includes('rateLimitExceeded'))) {
        const backoff = 200 * Math.pow(2, attempt - 1);
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Gmail API: exhausted retries');
}

async function apiRequest(path: string, opts: RequestInit = {}) {
  return enqueueRequest(() => attemptFetchWithRetries(path, opts));
}

export async function sendEmail(to: string, subject: string, htmlBody: string, attachmentFiles?: File[]) {
  let raw: string;

  if (!attachmentFiles || attachmentFiles.length === 0) {
    // Simple case: no attachments
    raw = [`To: ${to}`, 'Content-Type: text/html; charset=utf-8', `Subject: ${subject}`, '', htmlBody].join('\r\n');
  } else {
    // Complex case: build multipart message with attachments
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Build headers
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ];

    // Build body parts
    const parts: string[] = [];

    // Add HTML body as first part
    parts.push(`--${boundary}`, 'Content-Type: text/html; charset=utf-8', 'Content-Transfer-Encoding: 7bit', '', htmlBody);

    // Add each attachment
    for (const file of attachmentFiles) {
      const fileBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);
      
      // Convert to base64 without causing stack overflow
      let base64Data = '';
      const chunkSize = 8192;
      for (let i = 0; i < fileBytes.length; i += chunkSize) {
        const chunk = fileBytes.subarray(i, Math.min(i + chunkSize, fileBytes.length));
        base64Data += String.fromCharCode(...chunk);
      }
      base64Data = btoa(base64Data);

      parts.push(
        `--${boundary}`,
        `Content-Type: ${file.type || 'application/octet-stream'}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${file.name}"`,
        '',
        base64Data
      );
    }

    // Close boundary
    parts.push(`--${boundary}--`);

    raw = headers.join('\r\n') + '\r\n\r\n' + parts.join('\r\n');
  }

  const encoded = base64UrlEncode(raw);
  return apiRequest('/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raw: encoded }) });
}

export async function listMessages(query?: string, maxResults?: number) {
  const q = query ? `&q=${encodeURIComponent(query)}` : '';
  const m = maxResults ? `&maxResults=${maxResults}` : '';
  return apiRequest(`/messages?includeSpamTrash=false${q}${m}`);
}

export async function getMessage(id: string, format: 'full' | 'raw' | 'metadata' | 'minimal' = 'full') {
  return apiRequest(`/messages/${id}?format=${format}`);
}

export async function getMessageMetadata(id: string, headers: string[] = ['Subject', 'From', 'Date']) {
  const qs = headers.map((h) => `metadataHeaders=${encodeURIComponent(h)}`).join('&');
  return apiRequest(`/messages/${id}?format=metadata&${qs}`);
}

function base64UrlDecode(input: string) {
  // Replace URL-safe chars
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (input.length % 4) input += '=';
  try {
    const decoded = atob(input);
    // Decode UTF-8
    try {
      return decodeURIComponent(escape(decoded));
    } catch (e) {
      return decoded;
    }
  } catch (e) {
    return '';
  }
}

function findBodyFromPayload(payload: any): { text?: string; html?: string } {
  if (!payload) return {};
  // If body data present, decode it
  if (payload.body && payload.body.data) {
    const data = base64UrlDecode(payload.body.data);
    // Heuristic: if contains HTML tags, return as html
    if (/<[a-z][\s\S]*>/i.test(data)) return { html: data };
    return { text: data };
  }
  // If multipart, traverse parts with MIME type awareness
  if (payload.parts && Array.isArray(payload.parts)) {
    let htmlBody: string | undefined;
    let textBody: string | undefined;
    
    for (const part of payload.parts) {
      const mimeType = (part.mimeType || '').toLowerCase();
      
      // Prefer multipart/alternative structure: text/plain first, then text/html
      if (mimeType === 'text/html' && part.body?.data) {
        if (!htmlBody) {
          htmlBody = base64UrlDecode(part.body.data);
        }
      } else if (mimeType === 'text/plain' && part.body?.data) {
        if (!textBody) {
          textBody = base64UrlDecode(part.body.data);
        }
      } else if (mimeType.startsWith('multipart/')) {
        // Recursively handle nested multipart structures
        const found = findBodyFromPayload(part);
        if (found.html && !htmlBody) htmlBody = found.html;
        if (found.text && !textBody) textBody = found.text;
      }
    }
    
    // Return HTML if available, else text
    if (htmlBody) return { html: htmlBody };
    if (textBody) return { text: textBody };
    
    // Fallback: try recursion on first part that isn't explicitly a multipart
    for (const part of payload.parts) {
      const found = findBodyFromPayload(part);
      if (found.html || found.text) return found;
    }
  }
  return {};
}

export async function getMessageBody(id: string) {
  const res = await getMessage(id, 'full');
  const headersArr: Array<{ name: string; value: string }> = res.payload?.headers || [];
  const headers: Record<string, string> = {};
  headersArr.forEach((h) => (headers[h.name] = h.value));
  const body = findBodyFromPayload(res.payload) || {};
  // Collect attachments (including inline) by traversing payload
  const attachments: Array<any> = [];
  function collectParts(part: any) {
    if (!part) return;
    if (part.filename && part.filename.length > 0) {
      const hdrs = part.headers || [];
      const headerMap: Record<string, string> = {};
      hdrs.forEach((h: any) => (headerMap[h.name] = h.value));
      const contentId = headerMap['Content-ID'] || headerMap['Content-Id'] || '';
      const disposition = headerMap['Content-Disposition'] || '';
      const isInline = /inline/i.test(disposition) || !!contentId;
      attachments.push({
        attachmentId: part.body?.attachmentId || '',
        partId: part.partId || undefined,
        filename: part.filename,
        mimeType: part.mimeType || '',
        size: part.body?.size || 0,
        contentId: contentId.replace(/[<>]/g, ''),
        isInline: !!isInline,
      });
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach((p: any) => collectParts(p));
    }
  }
  collectParts(res.payload);

  return {
    id: res.id,
    snippet: res.snippet,
    headers,
    bodyHtml: body.html || null,
    bodyText: body.text || null,
    payload: res.payload,
    attachments,
  };
}

export async function downloadAttachment(messageId: string, attachmentId: string, filename: string) {
  try {
    // Check if token exists, if not request one
    if (!accessToken) {
      // eslint-disable-next-line no-console
      console.warn('[gmailService] Access token missing, requesting new one for download');
      await requestAccessToken('none').catch(() => {
        // If 'none' fails (token expired), try with consent
        return requestAccessToken('consent');
      });
    }

    const blob = await fetchAttachmentBlob(messageId, attachmentId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // eslint-disable-next-line no-console
    console.debug('[gmailService] Downloaded attachment:', filename);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[gmailService] Failed to download attachment:', err);
    throw err;
  }
}

export async function fetchAttachmentBlob(messageId: string, attachmentId: string, mimeType?: string) {
  try {
    const data = await enqueueRequest(() =>
      attemptFetchWithRetries(`/messages/${messageId}/attachments/${attachmentId}`)
    );
    if (!data || !data.data) throw new Error('No attachment data received');
    const b64 = data.data.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });
    return blob;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[gmailService] fetchAttachmentBlob error', err);
    throw err;
  }
}

export default {
  initGmail,
  requestAccessToken,
  getAccessToken,
  revokeToken,
  sendEmail,
  listMessages,
  getMessage,
  getMessageMetadata,
  getMessageBody,
  downloadAttachment,
  fetchAttachmentBlob,
};
