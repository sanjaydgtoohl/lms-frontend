import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterHeader from '../ui/MasterHeader';
import { RefreshCw } from 'lucide-react';
import gmailService from '../../services/gmailService';
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
    return `<div class="email-body" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      word-wrap: break-word;
      overflow-wrap: break-word;
    ">
      <style>
        .email-body { max-width: 100%; }
        .email-body a { 
          color: #0066cc !important; 
          text-decoration: underline !important;
          cursor: pointer;
          word-break: break-word;
        }
        .email-body a:hover { 
          color: #0052a3 !important;
        }
        .email-body img { 
          max-width: 100%; 
          height: auto; 
          display: block; 
          margin: 12px 0; 
        }
        .email-body p { 
          margin: 12px 0;
          word-wrap: break-word;
        }
        .email-body blockquote { 
          border-left: 4px solid #ddd; 
          margin: 12px 0; 
          padding: 0 12px; 
          color: #666; 
        }
        .email-body table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 12px 0; 
        }
        .email-body th, .email-body td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .email-body code { 
          background: #f5f5f5; 
          padding: 2px 6px; 
          border-radius: 3px; 
          font-family: 'Courier New', monospace;
          word-break: break-word;
        }
        .email-body pre { 
          background: #f5f5f5; 
          padding: 12px; 
          border-radius: 6px; 
          overflow-x: auto;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .email-body div, .email-body span {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      </style>
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
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]*)/g;
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
      const markers = [ /-{4,}.*forwarded message.*-{0,}/im, /forwarded message/i, /^[-]{6,}$/m ];
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
      .replace(/(https?:\/\/[^\s<>"{}|\\^`\[\]]*)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">$1</a>')
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
        // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('[gmail] loadList error', err);
      
      if (errorMsg.includes('authentication required') || errorMsg.includes('Failed to refresh') || errorMsg.includes('No access token')) {
        alert('Your session has expired. Please sign in again to load emails.');
        setToken(null);
        setMessages([]);
      } else {
        alert('Failed to load emails. Please try again.');
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
      // eslint-disable-next-line no-console
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
              // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('[gmail] viewMessage error', err);
      
      // Check if error is auth-related
      if (errorMsg.includes('authentication required') || errorMsg.includes('Failed to refresh') || errorMsg.includes('No access token')) {
        alert('Your session has expired. Please sign in again to view this email.');
        setToken(null);
        setSelected(null);
      } else {
        alert('Failed to load email. Please try again.');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <div style={{ flex: '0 0 auto' }}>
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

      <div style={{ display: 'flex', gap: 0, flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: 320, borderRight: '1px solid #e6e6e6', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
          <div style={{ padding: '12px 12px', backgroundColor: 'white', borderBottom: '1px solid #e6e6e6' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadList()}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 4, border: '1px solid #e6e6e6', fontSize: 13, boxSizing: 'border-box' }}
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="Refresh"
                onClick={refreshList}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { refreshList(); } }}
                title="Refresh"
                style={{
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                className="hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'white' }}>
            {loading ? (
              <div style={{ padding: 12, fontSize: 13 }}>Loading…</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, color: '#666' }}>No messages</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {messages.map((m) => (
                  <li 
                    key={m.id} 
                    style={{ 
                      padding: 10, 
                      borderBottom: '1px solid #f5f5f5', 
                      cursor: 'pointer',
                      backgroundColor: selected?.id === m.id ? '#fff3e0' : 'white'
                    }} 
                    onClick={() => viewMessage(m.id)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                      {m.subject || '(no subject)'}
                      {m.isForwarded && <span style={{ marginLeft: 8, color: '#ff9800', fontSize: 10 }}>⬆ Fwd</span>}
                      {m.attachments.length > 0 && <span style={{ marginLeft: 8, color: '#1976d2', fontSize: 10 }}>📎 {m.attachments.length}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#333', marginBottom: 2 }}>
                      <strong>{m.senderName}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{m.senderEmail}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{m.date}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <div style={{ background: 'white', padding: '20px', overflowY: 'auto', height: '100%' }}>
              {loadingMessage ? (
                <div style={{ fontSize: 13 }}>Loading message…</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 22, color: '#1a1a1a' }}>{selected.subject || '(no subject)'}</h3>
                      <div style={{ color: '#666', fontSize: 13 }}>{selected.snippet}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 180 }}>
                      <div style={{ color: '#666', fontSize: 12 }}>{formatDate(selected.dateTime, selected.date)}</div>
                      {selected.isForwarded && <div style={{ marginTop: 8, display: 'inline-block', fontSize: 12, color: '#ff9800', backgroundColor: '#fff3e0', padding: '4px 8px', borderRadius: 4 }}>⬆ Forwarded</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 16, marginBottom: 20, alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2b2b8a', fontSize: 20 }}>
                      {getInitials(selected.senderName)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{selected.senderName || 'Unknown'}</div>
                      <div style={{ marginTop: 4 }}><span style={{ color: '#666' }}>📧</span> <a style={{ color: '#3498db' }} href={`mailto:${selected.senderEmail}`}>{selected.senderEmail || '(no email)'}</a></div>
                      {selected.replyTo && <div style={{ marginTop: 6, color: '#666' }}><strong>↩️ Reply-To:</strong> <span style={{ color: '#3498db' }}>{selected.replyTo}</span></div>}
                      {selected.to && <div style={{ marginTop: 6, color: '#666' }}><strong>📮 To:</strong> <span style={{ color: '#666' }}>{selected.to}</span></div>}
                    </div>
                  </div>

                  {selected.attachments.length > 0 && (
                    <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f7fbff', borderRadius: 8, border: '1px solid #e1f0ff' }}>
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: '#1a1a1a' }}>📎 Attachments ({selected.attachments.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selected.attachments.map((att) => (
                          <div key={att.id} style={{ padding: 12, backgroundColor: 'white', borderRadius: 6, border: '1px solid #eef6fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ width: 46, height: 46, borderRadius: 6, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#444' }}>{att.filename.split('.').pop()?.toUpperCase()}</div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{att.filename}</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{att.mimeType} • {formatFileSize(att.size)}</div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {/(image|video)\//i.test(att.mimeType) || /(csv|excel|spreadsheet|sheet)/i.test(att.mimeType) ? (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const blob = await gmailService.fetchAttachmentBlob(selected.id, att.id, att.mimeType);
                                        const url = URL.createObjectURL(blob);
                                        objectUrlsRef.current.push(url);
                                        // open preview in new tab/window
                                        window.open(url, '_blank');
                                      } catch (err) {
                                        // eslint-disable-next-line no-console
                                        console.error('Preview failed', err);
                                        alert(`Preview failed for ${att.filename}`);
                                      }
                                    }}
                                    style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', backgroundColor: '#22c55e' }}
                                  >
                                    Preview
                                  </button>
                                ) : null}

                                <button 
                                  onClick={() => {
                                    gmailService.downloadAttachment(selected.id, att.id, att.filename)
                                      .catch((err) => {
                                        // eslint-disable-next-line no-console
                                        console.error('Download failed:', err);
                                        alert(`Failed to download ${att.filename}`);
                                      });
                                  }}
                                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', backgroundColor: '#3498db' }}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: 14, lineHeight: 1.8, color: '#1a1a1a', padding: '16px 0', borderTop: '1px solid #e9ecef', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                    {selected.bodyHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: enhanceEmailHtml(selected.bodyHtml) }} />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: formatTextWithForwarded(selected.bodyText || selected.snippet) }} />
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              width: '100%',
              backgroundColor: '#f9f9f9',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#333', marginBottom: 8 }}>No Message Selected</h2>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24, maxWidth: 350 }}>
                Select a message from the list on the left to view its details, attachments, and content.
              </p>
              <div style={{ 
                padding: 12, 
                backgroundColor: '#fff3e0', 
                borderRadius: 4, 
                border: '1px solid #ffe0b2',
                color: '#e65100',
                fontSize: 12,
                maxWidth: 350
              }}>
                💡 Tip: Click on any email to view its full content and download attachments
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
