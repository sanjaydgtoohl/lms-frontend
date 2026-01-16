import { useEffect, useState } from 'react';
import gmailService from '../../services/gmailService';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';

export default function GmailDemo() {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    gmailService.initGmail(CLIENT_ID);
  }, []);

  async function handleSignIn() {
    try {
      const t = await gmailService.requestAccessToken();
      setToken(t);
    } catch (e) {
      alert('Sign-in failed: ' + String(e));
    }
  }

  async function handleSend() {
    try {
      await gmailService.sendEmail('recipient@example.com', 'Test from app', '<p>This is a test</p>');
      alert('Sent (API responded)');
    } catch (e) {
      alert('Send failed: ' + String(e));
    }
  }

  async function handleList() {
    try {
      const res = await gmailService.listMessages();
      setMessages(res.messages || []);
    } catch (e) {
      alert('List failed: ' + String(e));
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Gmail Demo</h3>
      <div>
        <button onClick={handleSignIn}>Sign in / Grant</button>
        <button onClick={handleSend} style={{ marginLeft: 8 }}>Send test email</button>
        <button onClick={handleList} style={{ marginLeft: 8 }}>List messages</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Access token:</strong> {token ? 'available' : 'none'}
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Messages:</strong>
        <ul>
          {messages.map((m) => (
            <li key={m.id}>{m.id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
