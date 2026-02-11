import React, { useEffect, useState } from 'react';
import gmailService from '../../services/gmailService';
import SweetAlert from '../../utils/SweetAlert';

import './gmailPanel.css';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';

export default function GmailPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    try {
      gmailService.initGmail(CLIENT_ID);
    } catch (e) {
      console.warn('Gmail init error', e);
    }
  }, []);

  async function signIn() {
    try {
      await gmailService.requestAccessToken();
    } catch (e: any) {
      SweetAlert.showError('Sign-in failed: ' + String(e));
    }
  }

  async function doList() {
    setLoadingList(true);
    try {
      // Ensure we have an access token
      let t = gmailService.getAccessToken();
      if (!t) {
        t = await gmailService.requestAccessToken('consent');
      }

      const res = await gmailService.listMessages(query || undefined, 50);
      const ids = (res.messages || []).slice(0, 50).map((m: any) => m.id);

      // Fetch metadata with limited concurrency and retry handled in service
      const concurrency = 4;
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      async function fetchMetadataWithLimit(ids: string[], limit = concurrency) {
        const results: any[] = new Array(ids.length);
        let index = 0;

        async function worker() {
          while (true) {
            const i = index++;
            if (i >= ids.length) break;
            const id = ids[i];
            let attempts = 0;
            while (attempts < 4) {
              try {
                const m = await gmailService.getMessageMetadata(id);
                results[i] = m;
                break;
              } catch (err: any) {
                attempts++;
                const msg = err?.message || JSON.stringify(err);
                if (msg.includes('429') || msg.includes('rateLimitExceeded') || (err && err.toString().includes('Too Many Requests'))) {
                  await sleep(300 * attempts);
                  continue;
                }
                results[i] = { error: msg };
                break;
              }
            }
          }
        }

        const workers = [] as Promise<void>[];
        for (let w = 0; w < Math.min(limit, ids.length); w++) workers.push(worker());
        await Promise.all(workers);
        return results;
      }

      const metas = await fetchMetadataWithLimit(ids, concurrency);
      const mapped = metas.map((m: any, idx: number) => {
        if (!m || m.error) return { id: ids[idx], snippet: '', subject: '(error)', from: m?.error || '', date: '' };
        const headersArr = m.payload?.headers || [];
        const h: Record<string, string> = {};
        headersArr.forEach((hh: any) => (h[hh.name] = hh.value));
        return { id: m.id, snippet: m.snippet, subject: h.Subject || '', from: h.From || '', date: h.Date || '' };
      });
      setMessages(mapped);
    } catch (e: any) {
      SweetAlert.showError('List failed: ' + String(e));
    } finally {
      setLoadingList(false);
    }
  }

  async function viewMessage(id: string) {
    setLoadingMessage(true);
    try {
      const res = await gmailService.getMessageBody(id);
      let raw = null;
      try {
        raw = await gmailService.getMessage(id, 'full');
      } catch (err) {
        raw = null;
      }
      setSelected({ ...res, raw });
    } catch (e: any) {
      SweetAlert.showError('Get message failed: ' + String(e));
    } finally {
      setLoadingMessage(false);
    }
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const to = String(data.get('to') || '');
    const subject = String(data.get('subject') || '');
    const body = String(data.get('body') || '');
    setSending(true);
    setSendResult(null);
    try {
      let t = gmailService.getAccessToken();
      if (!t) {
        t = await gmailService.requestAccessToken('consent');
      }
      const res = await gmailService.sendEmail(to, subject, body);
      setSendResult('Sent: ' + (res.id || JSON.stringify(res)));
      form.reset();
    } catch (err: any) {
      setSendResult('Send failed: ' + String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="gmail-panel" style={{ padding: 12 }}>
      <h2>Gmail</h2>
      <div style={{ marginBottom: 8 }}>
        <button onClick={signIn}>Sign in / Grant access</button>
        <button onClick={doList} style={{ marginLeft: 8 }}>Refresh inbox</button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>Send Email</h3>
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: 6 }}>
              <input name="to" placeholder="To" style={{ width: '100%' }} required />
            </div>
            <div style={{ marginBottom: 6 }}>
              <input name="subject" placeholder="Subject" style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <textarea name="body" placeholder="HTML body" rows={6} style={{ width: '100%' }} />
            </div>
            <div>
              <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </form>
          {sendResult && <div style={{ marginTop: 8 }}><strong>Result:</strong> {sendResult}</div>}
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>Inbox</h3>
          <div style={{ marginBottom: 8 }}>
            <input placeholder="Search (subject, from)" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '60%' }} />
            <button onClick={doList} style={{ marginLeft: 8 }}>{loadingList ? 'Loading…' : 'Search / Refresh'}</button>
          </div>
          <div style={{ maxHeight: 360, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {messages.length === 0 && !loadingList && <div>No messages loaded</div>}
            {loadingList && <div>Loading messages…</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {messages.map((m) => (
                <li key={m.id} style={{ padding: '8px 6px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.subject || '(no subject)'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{m.from} — <span style={{ color: '#999' }}>{m.date}</span></div>
                    <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>{m.snippet}</div>
                  </div>
                  <div style={{ marginLeft: 8 }}>
                    <button onClick={() => viewMessage(m.id)}>View</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <h3>Message</h3>
          {loadingMessage && <div>Loading message…</div>}
          {selected ? (
            <div>
              <div><strong>From:</strong> {selected.headers?.From}</div>
              <div><strong>To:</strong> {selected.headers?.To}</div>
              <div><strong>Subject:</strong> {selected.headers?.Subject}</div>
              <div><strong>Date:</strong> {selected.headers?.Date}</div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>Body</strong>
                  <button onClick={() => setShowRaw((s) => !s)} style={{ marginLeft: 'auto' }}>{showRaw ? 'Hide raw JSON' : 'Show raw JSON'}</button>
                </div>
                {!showRaw ? (
                  selected.bodyHtml ? (
                    <div style={{ border: '1px solid #eee', padding: 8, marginTop: 6 }} dangerouslySetInnerHTML={{ __html: selected.bodyHtml }} />
                  ) : selected.bodyText ? (
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{selected.bodyText}</pre>
                  ) : (
                    <div style={{ marginTop: 6, color: '#666' }}>No body available</div>
                  )
                ) : (
                  <div style={{ marginTop: 6 }}>
                    <strong>Raw JSON</strong>
                    <pre style={{ maxHeight: 400, overflow: 'auto', background: '#fafafa', padding: 8, border: '1px solid #eee' }}>{JSON.stringify(selected.raw || selected, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>No message selected</div>
          )}
        </div>
      </div>
    </div>
  );
}
