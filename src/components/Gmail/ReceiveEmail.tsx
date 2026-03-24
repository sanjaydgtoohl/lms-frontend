import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterHeader from '../ui/MasterHeader';
import { RefreshCw } from 'lucide-react';
import gmailService from '../../services/gmailService';
import SweetAlert from '../../utils/SweetAlert';
import DOMPurify from 'dompurify';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';

interface EmailAttachment {
  id: string; // attachmentId
  filename: string;
  mimeType: string;
  size: number;
  partId?: string;
  contentId?: string;
  isInline?: boolean;
}

interface EmailMetadata {
  id: string;
  subject: string;
  date: string;
  dateTime: Date | null;
  senderName: string;
  senderEmail: string;
  from: string;
  replyTo?: string;
  to: string;
  snippet: string;
  attachments: EmailAttachment[];
  isForwarded: boolean;
  forwardedFrom?: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
}

export default function ReceiveEmail() {
  const [messages, setMessages] = useState<EmailMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [selected, setSelected] = useState<EmailMetadata | null>(null);
  const [query, setQuery] = useState('');
  const [token, setToken] = useState<string | null>(gmailService.getAccessToken() || null);
  const navigate = useNavigate();
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      // cleanup any object URLs when component unmounts
      if (objectUrlsRef.current.length > 0) {
        objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        objectUrlsRef.current = [];
      }
    };
  }, []);

  // Robust parser for "From" header to extract display name and email address
  function parseFromHeader(fromHeader: string) {
    if (!fromHeader) return { name: '', email: '' };
    let s = String(fromHeader).trim();
    // remove surrounding quotes
    s = s.replace(/^"|"$/g, '').trim();
    // try angle bracket form: Name <email@domain>
    const angleMatch = s.match(/^(.*?)<(.+?)>$/);
    if (angleMatch) {
      const name = (angleMatch[1] || '').trim().replace(/^"(.*)"$/, '$1');
      const email = (angleMatch[2] || '').trim();
      return { name: name || '', email };
    }
    // fallback: find an email-like substring
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailOnlyMatch = s.match(emailRegex);
    if (emailOnlyMatch) {
      const email = emailOnlyMatch[1];
      // name is the rest without the email
      const name = s.replace(email, '').replace(/["<>]/g, '').trim();
      return { name: name || '', email };
    }
    // no email found, return raw as name
    return { name: s, email: '' };
  }

  // Extract attachments from email parts
  function extractAttachments(payload: any): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    if (!payload) return attachments;

    const parts = payload.parts || [];
    parts.forEach((part: any) => {
      if (part.filename && part.filename.length > 0) {
        const headers = part.headers || [];
        const dispositionHeader = headers.find((h: any) => h.name === 'Content-Disposition');

        if (dispositionHeader && dispositionHeader.value.includes('attachment')) {
          attachments.push({
            id: part.body?.attachmentId || '',
            filename: part.filename,
            mimeType: part.mimeType || '',
            size: part.body?.size || 0,
          });
        }
      }
    });

    return attachments;
  }

  // Detect if email is forwarded
  function isForwardedEmail(subject: string, snippet: string): boolean {
    const forwardedPatterns = /^(Fwd:|Forward:|Re: Fwd:)/i;
    return forwardedPatterns.test(subject) || /forwarded message/i.test(snippet);
  }

  // Format file size in human-readable format
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Parse date string to Date object
  function parseDate(dateStr: string): Date | null {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  // Format date for display
  function formatDate(date?: Date | null, fallback?: string) {
    if (date) return date.toLocaleString();
    return fallback || '';
  }

  // Sanitize HTML content for safe display
  function sanitizeHtml(html: string) {
    const config = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'div', 'span', 'blockquote', 'pre', 'code', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'hr', 'section', 'article', 'footer'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'style', 'class', 'target', 'rel', 'id', 'data-*'],
      KEEP_CONTENT: true,
      FORCE_BODY: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
    };
    return DOMPurify.sanitize(html, config);
  }

  // Add email-specific styling to HTML content
  function enhanceEmailHtml(html: string) {
    const sanitized = sanitizeHtml(html);
    return `<div class="email-body"> 
      ${sanitized}
    </div>`;
  }

  // Return initials for avatar display
  function getInitials(name?: string) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
  }

  // Convert plain text email body to simple HTML: escape, paragraphs, line breaks, bold using *text*
  function formatPlainTextToHtml(text?: string) {
    if (!text) return '<i style="color: #999;">(no content)</i>';
    // escape
    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const escaped = escapeHtml(text);
    // simple bold for *text*
    const bolded = escaped.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    // convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]*)/g;
    const withLinks = bolded.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline; word-break: break-word;">$1</a>');
    // paragraphs: two newlines -> paragraph, single newline -> <br />
    const paragraphs = withLinks.split(/\n\n+/g).map((p) => p.replace(/\n/g, '<br/>'));
    return paragraphs.map((p) => `<p style="margin:12px 0; word-wrap: break-word; overflow-wrap: break-word;">${p}</p>`).join('\n');
  }

  // Format plain text but detect forwarded blocks and style them separately
  function formatTextWithForwarded(text?: string) {
    if (!text) return formatPlainTextToHtml(text);

    // Look for common forwarded separators or "Forwarded message" markers
    const forwardedIndex = (() => {
      const markers = [/-{4,}.*forwarded message.*-{0,}/im, /forwarded message/i, /^[-]{6,}$/m];
      for (const r of markers) {
        const m = text.match(r);
        if (m && m.index !== undefined) return m.index;
      }
      return -1;
    })();

    if (forwardedIndex === -1) {
      return formatPlainTextToHtml(text);
    }

    const before = text.slice(0, forwardedIndex).trim();
    const after = text.slice(forwardedIndex).trim();

    const beforeHtml = before ? formatPlainTextToHtml(before) : '';

    // Escape and preserve line breaks for forwarded block
    const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const forwardedEscaped = escape(after)
      .replace(
        /(https?:\/\/[^\s<>"{}|\\^`[\]]*)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">$1</a>'
      )
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    const forwardedHtml = `<div style="background:#fafafa;border-left:3px solid #e0e0e0;padding:12px;border-radius:6px;margin-top:12px;color:#444;font-family:monospace;white-space:pre-wrap;word-break:break-word;">` +
      `<div style="font-size:12px;color:#666;margin-bottom:8px">Forwarded message</div><div><p style="margin:0">${forwardedEscaped}</p></div></div>`;

    return beforeHtml + forwardedHtml;
  }

  useEffect(() => {
    try {
      gmailService.initGmail(CLIENT_ID);
    } catch (e) {
      console.warn('Gmail init error', e);
    }
  }, []);

  async function loadList() {
    setLoading(true);
    try {
      let t = gmailService.getAccessToken();
      if (!t) {
        t = await gmailService.requestAccessToken('consent');
        setToken(t || gmailService.getAccessToken() || null);
      }
      const res = await gmailService.listMessages(query || undefined, 50);
      const ids = (res.messages || []).slice(0, 50).map((m: any) => m.id);
      const metas = await Promise.all(ids.map((id: string) => gmailService.getMessageMetadata(id)));
      const mapped: EmailMetadata[] = metas.map((m: any, idx: number) => {
        const headersArr = m?.payload?.headers || [];
        const h: Record<string, string> = {};
        headersArr.forEach((hh: any) => (h[hh.name] = hh.value));

        // Extract sender name and email from "From" header
        const fromHeader = h.From || h.from || '';
        const parsed = parseFromHeader(fromHeader);
        let senderName = parsed.name || 'Unknown';
        let senderEmail = parsed.email || '';
        // prefer Reply-To when From is a system/noreply address or missing
        const replyToHeader = h['Reply-To'] || h['ReplyTo'] || h.ReplyTo || '';
        if ((!senderEmail || /noreply|no-reply|drive-shares|do-not-reply/i.test(senderEmail)) && replyToHeader) {
          const r = parseFromHeader(replyToHeader);
          if (r.email) {
            senderName = r.name || senderName;
            senderEmail = r.email;
          }
        }
        // fallback: search snippet for an email address
        if (!senderEmail) {
          const snippetEmailMatch = (m?.snippet || '').match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (snippetEmailMatch) senderEmail = snippetEmailMatch[1];
        }

        const subject = h.Subject || '';
        const snippet = m?.snippet || '';
        const isForwarded = isForwardedEmail(subject, snippet);

        // Extract attachments
        const attachments = extractAttachments(m?.payload);

        // debug: show parsed values in console to help troubleshoot missing email

        console.debug('[gmail] mapped sender', { id: m?.id || ids[idx], fromHeader, senderName, senderEmail, isForwarded, attachments });

        return {
          id: m?.id || ids[idx],
          snippet: snippet,
          subject: subject,
          from: fromHeader || '',
          replyTo: replyToHeader || undefined,
          to: h.To || '',
          senderName: senderName || 'Unknown',
          senderEmail: senderEmail || '',
          date: h.Date || '',
          dateTime: parseDate(h.Date || ''),
          isForwarded,
          attachments,
        };
      });
      setMessages(mapped);
    } catch (err) {
      const errorMsg = String(err || '');

      console.error('[gmail] loadList error', err);

      if (errorMsg.includes('authentication required') || errorMsg.includes('Failed to refresh') || errorMsg.includes('No access token')) {
        SweetAlert.showWarning('Your session has expired. Please sign in again to load emails.');
        setToken(null);
        setMessages([]);
      } else {
        SweetAlert.showError('Failed to load emails. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function viewMessage(id: string) {
    setLoadingMessage(true);
    try {
      const res = await gmailService.getMessageBody(id);
      // parse From header to include senderName and senderEmail on selected
      const fromHeader = (res.headers && (res.headers.From || res.headers.from)) || '';
      let parsed = parseFromHeader(fromHeader);
      // prefer Reply-To when From is system/noreply
      const replyToHeader = (res.headers && (res.headers['Reply-To'] || res.headers['ReplyTo'] || res.headers.ReplyTo)) || '';
      if ((!parsed.email || /noreply|no-reply|drive-shares|do-not-reply/i.test(parsed.email)) && replyToHeader) {
        const r = parseFromHeader(replyToHeader);
        if (r.email) parsed = r;
      }
      // fallback: try to extract email from snippet
      if (!parsed.email && res.snippet) {
        const snippetEmailMatch = (res.snippet || '').match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (snippetEmailMatch) parsed.email = snippetEmailMatch[1];
      }

      // Use attachments provided by the gmailService (collected from payload)
      const attachments = res.attachments || [];
      const subject = res.headers?.Subject || '';
      const snippet = res.snippet || '';
      const isForwarded = isForwardedEmail(subject, snippet);
      const dateStr = res.headers?.Date || '';

      // debug: log parsed selection

      console.debug('[gmail] viewMessage parsed', { id, fromHeader, parsed, attachments, isForwarded });
      // Revoke any previous object URLs
      if (objectUrlsRef.current.length > 0) {
        objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        objectUrlsRef.current = [];
      }

      let finalBodyHtml = res.bodyHtml || null;

      // If HTML body contains cid: references, replace them with blob URLs fetched from attachments
      if (finalBodyHtml && Array.isArray(attachments) && attachments.length > 0) {
        const inlineAttachments = attachments.filter((a: any) => a.isInline && a.attachmentId);
        if (inlineAttachments.length > 0) {
          await Promise.all(inlineAttachments.map(async (att: any) => {
            try {
              const blob = await gmailService.fetchAttachmentBlob(res.id, att.attachmentId, att.mimeType);
              const url = URL.createObjectURL(blob);
              objectUrlsRef.current.push(url);
              const cid = (att.contentId || '').replace(/^<|>$/g, '');
              if (cid) {
                const re = new RegExp("cid:" + cid.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g');
                finalBodyHtml = finalBodyHtml!.replace(re, url);
              }
            } catch (e) {
              // ignore individual attachment preview failures

              console.warn('[gmail] inline preview failed', att, e);
            }
          }));
        }
      }

      setSelected({
        id,
        subject,
        date: dateStr,
        dateTime: parseDate(dateStr),
        from: fromHeader,
        replyTo: replyToHeader || undefined,
        to: res.headers?.To || '',
        senderName: parsed.name || 'Unknown',
        senderEmail: parsed.email || '',
        snippet: snippet,
        isForwarded,
        attachments: (attachments || []).map((a: any) => ({
          id: a.attachmentId || a.id || '',
          filename: a.filename || (a.contentId ? a.contentId : ''),
          mimeType: a.mimeType || '',
          size: a.size || 0,
          partId: a.partId,
          contentId: a.contentId,
          isInline: !!a.isInline,
        })),
        bodyHtml: finalBodyHtml,
        bodyText: res.bodyText,
      });
    } catch (err) {
      const errorMsg = String(err || '');

      console.error('[gmail] viewMessage error', err);

      // Check if error is auth-related
      if (errorMsg.includes('authentication required') || errorMsg.includes('Failed to refresh') || errorMsg.includes('No access token')) {
        SweetAlert.showWarning('Your session has expired. Please sign in again to view this email.');
        setToken(null);
        setSelected(null);
      } else {
        SweetAlert.showError('Failed to load email. Please try again.');
        setSelected(null);
      }
    } finally {
      setLoadingMessage(false);
    }
  }

  async function signIn() {
    try {
      if (gmailService.getAccessToken()) {
        await gmailService.revokeToken();
        setToken(null);
        setMessages([]);
        setSelected(null);
      } else {
        const t = await gmailService.requestAccessToken('consent');
        setToken(t || gmailService.getAccessToken() || null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function refreshList() {
    loadList();
  }

  return (
    <div className="flex flex-col sm:h-[calc(100dvh-100px)] w-full">
      <div className="flex-none">
        <MasterHeader
          onCreateClick={() => navigate('/gmail/send')}
          createButtonLabel="Compose"
          showBreadcrumb={true}
          breadcrumbItems={[{ label: 'Gmail', path: '/gmail' }, { label: 'Receive', isActive: true }]}
          onSignInClick={signIn}
          signInButtonLabel={token ? 'Sign Out' : 'Sign In'}
          showSignInButton={true}
        />
      </div>
      
      <div className="sm:grid grid-cols-10 flex flex-col flex-1 min-h-0 bg-gray-50 h-full">
        <aside className="h-[calc(100dvh-100px)] sm:h-full col-span-10 sm:col-span-3 rounded-lg sm:rounded-r-none border border-gray-200 flex flex-col overflow-y-auto min-h-0">
          <div className="px-3 py-3 bg-white border-b border-gray-200">
            <div className="flex gap-2 items-center">
              <input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadList()}
                className="flex-1 px-2.5 py-2 rounded border border-gray-200 text-sm box-border focus:outline-0 focus:border-black"
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="Refresh"
                onClick={refreshList}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    refreshList();
                  }
                }}
                title="Refresh"
                className="px-2.5 py-2 flex items-center justify-center rounded-md bg-gray-800 text-white cursor-pointer shadow-md hover:bg-gray-900">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {loading ? (
              <div className="p-3 text-sm">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="p-3 min-h-[100px] text-sm text-gray-500 text-center"> No messages</div>
            ) : (
              <ul className="list-none p-0 m-0">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`p-2.5 border-b border-gray-100 cursor-pointer ${selected?.id === m.id ? 'bg-orange-100' : 'bg-white'
                      }`}
                    onClick={() => viewMessage(m.id)}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {m.subject || '(no subject)'}
                      {m.isForwarded && (
                        <span className="ml-2 text-orange-500 text-[10px]">⬆ Fwd</span>
                      )}
                      {m.attachments.length > 0 && (
                        <span className="ml-2 text-blue-600 text-[10px]">
                          📎 {m.attachments.length}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-800 mb-0.5">
                      <strong>{m.senderName}</strong>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-1">
                      {m.senderEmail}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {m.date}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="col-span-10 sm:col-span-7 mt-5 sm:mt-0 flex flex-col border-gray-200 rounded-lg bg-gray-50 border sm:rounded-l-none overflow-y-auto min-h-0">
          {selected ? (
            <div className="bg-white p-5 overflow-y-auto h-full">
              {loadingMessage ? (
                <div className='text-sm'>Loading message…</div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <h3 className="mt-0 mb-2 text-[18px] sm:text-[22px] text-gray-900">
                        {selected.subject || '(no subject)'}
                      </h3>

                      <div className="text-gray-500 text-[12px] sm:text-[13px]">
                        {selected.snippet}
                      </div>
                    </div>

                    <div className="text-left sm:text-right min-w-0 sm:min-w-[180px]">
                      <div className="text-gray-500 text-[11px] sm:text-[12px]">
                        {formatDate(selected.dateTime, selected.date)}
                      </div>

                      {selected.isForwarded && (
                        <div className="mt-2 inline-block text-[11px] sm:text-[12px] text-orange-500 bg-orange-100 px-2 py-1 rounded">
                          ⬆ Forwarded
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-5 items-start">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-indigo-50 flex items-center justify-center font-bold text-indigo-900 text-[18px] sm:text-[20px] shrink-0">
                      {getInitials(selected.senderName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] sm:text-[15px] font-bold text-gray-900">
                        {selected.senderName || 'Unknown'}
                      </div>

                      <div className="mt-1 text-[12px] sm:text-[13px]">
                        <span className="text-gray-500">📧</span>{" "}
                        <a
                          className="text-blue-500 break-all"
                          href={`mailto:${selected.senderEmail}`}
                        >
                          {selected.senderEmail || '(no email)'}
                        </a>
                      </div>

                      {selected.replyTo && (
                        <div className="mt-1.5 text-gray-500 text-[12px] sm:text-[13px] break-all">
                          <strong>↩️ Reply-To:</strong>{" "}
                          <span className="text-blue-500">{selected.replyTo}</span>
                        </div>
                      )}

                      {selected.to && (
                        <div className="mt-1.5 text-gray-500 text-[12px] sm:text-[13px] break-all">
                          <strong>📮 To:</strong>{" "}
                          <span>{selected.to}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selected.attachments.length > 0 && (
                    <div className="mb-5 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <div className="font-bold mb-3 text-[13px] sm:text-[14px] text-gray-900">
                        📎 Attachments ({selected.attachments.length})
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {selected.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-3 bg-white rounded-md border border-blue-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                          >
                            <div className="flex gap-3 items-center min-w-0">
                              <div className="w-12 h-12 sm:w-[46px] sm:h-[46px] rounded-md bg-gray-50 flex items-center justify-center font-bold text-gray-600 shrink-0">
                                {att.filename.split('.').pop()?.toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="font-semibold text-[12px] sm:text-[13px] text-gray-900 truncate">
                                  {att.filename}
                                </div>
                                <div className="text-[11px] sm:text-[12px] text-gray-500 mt-1 break-all">
                                  {att.mimeType} • {formatFileSize(att.size)}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                              {/(image|video)\//i.test(att.mimeType) ||
                                /(csv|excel|spreadsheet|sheet)/i.test(att.mimeType) ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      const blob = await gmailService.fetchAttachmentBlob(
                                        selected.id,
                                        att.id,
                                        att.mimeType
                                      );
                                      const url = URL.createObjectURL(blob);
                                      objectUrlsRef.current.push(url);
                                      window.open(url, '_blank');
                                    } catch (err) {
                                      console.error('Preview failed', err);
                                      SweetAlert.showError(`Preview failed for ${att.filename}`);
                                    }
                                  }}
                                  className="px-3 py-2 text-[11px] sm:text-[12px] font-semibold rounded-md cursor-pointer text-white bg-green-500 w-full sm:w-auto"
                                >
                                  Preview
                                </button>
                              ) : null}

                              <button
                                onClick={() => {
                                  gmailService
                                    .downloadAttachment(selected.id, att.id, att.filename)
                                    .catch((err) => {
                                      console.error('Download failed:', err);
                                      SweetAlert.showError(`Failed to download ${att.filename}`);
                                    });
                                }}
                                className="px-3 py-2 text-[11px] sm:text-[12px] font-semibold rounded-md cursor-pointer text-white bg-blue-500 w-full sm:w-auto"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[13px] sm:text-[14px] leading-[1.7] sm:leading-[1.8] text-gray-900 py-3 sm:py-4 border-t border-gray-200 break-words whitespace-normal overflow-x-auto">
                    {selected.bodyHtml ? (
                      <div
                        className="max-w-full break-words [&_img]:max-w-full [&_table]:w-full [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{
                          __html: enhanceEmailHtml(selected.bodyHtml),
                        }}
                      />
                    ) : (
                      <div
                        className="max-w-full break-words"
                        dangerouslySetInnerHTML={{
                          __html: formatTextWithForwarded(
                            selected.bodyText || selected.snippet
                          ),
                        }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-white px-5 py-10 text-center">
              <div className="text-[48px] mb-4">📬</div>

              <h2 className="text-[20px] font-semibold text-gray-700 mb-2">
                No Message Selected saii
              </h2>

              <p className="text-[14px] text-gray-500 mb-6 max-w-[350px]">
                Select a message from the list on the left to view its details, attachments, and content.
              </p>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 text-sm max-w-[350px]">
                💡 Tip: Click on any email to view its full content and download attachments
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
