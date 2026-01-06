import { useEffect, useState } from 'react';
import gmailService from '../../services/gmailService';
import { MasterFormHeader } from '../../components/ui';
import { Trash2 } from 'lucide-react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';

interface AttachedFile {
  name: string;
  size: number;
  file: File;
}

export default function SendEmail() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    try {
      gmailService.initGmail(CLIENT_ID);
    } catch (e) {
      console.warn('Gmail init error', e);
    }
  }, []);

  async function ensureToken() {
    let t = gmailService.getAccessToken();
    if (!t) {
      t = await gmailService.requestAccessToken('consent');
    }
    return t;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;
    if (!files) return;

    const newAttachments: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        name: file.name,
        size: file.size,
        file: file,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input
    e.currentTarget.value = '';
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!formData.to.trim()) {
      newErrors.to = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.to)) {
      newErrors.to = 'Please enter a valid email address';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSending(true);
    setResult(null);
    try {
      await ensureToken();
      
      // Send with attachments if any
      const attachmentFilesArray = attachments.length > 0 ? attachments.map((a) => a.file) : undefined;
      const res = await gmailService.sendEmail(formData.to, formData.subject, formData.body, attachmentFilesArray);
      setResult({ type: 'success', message: 'Email sent successfully! ID: ' + (res?.id || 'N/A') });
      setFormData({ to: '', subject: '', body: '' });
      setAttachments([]);
    } catch (err: any) {
      setResult({ type: 'error', message: 'Send failed: ' + String(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <MasterFormHeader onBack={() => {}} title="Compose Email" />

      {/* Form Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 bg-[#F9FAFB] space-y-6">
          {/* To Field */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              To <span className="text-[#FF0000]">*</span>
            </label>
            <input
              name="to"
              type="email"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {errors.to && <div className="text-xs text-red-500 mt-1">{errors.to}</div>}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Subject</label>
            <input
              name="subject"
              placeholder="Email subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {errors.subject && <div className="text-xs text-red-500 mt-1">{errors.subject}</div>}
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Message</label>
            <textarea
              name="body"
              rows={8}
              placeholder="Enter email content (HTML supported)"
              value={formData.body}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono resize-vertical"
            />
            {errors.body && <div className="text-xs text-red-500 mt-1">{errors.body}</div>}
          </div>

          {/* Attachments Field */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">📎 Attachments</label>
            <div
              className="w-full px-4 py-6 rounded-lg border-2 border-dashed border-[var(--border-color)] bg-[#F9FAFB] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-opacity-70 transition"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                const files = e.dataTransfer.files;
                if (files) {
                  const newAttachments: AttachedFile[] = [];
                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    newAttachments.push({
                      name: file.name,
                      size: file.size,
                      file: file,
                    });
                  }
                  setAttachments((prev) => [...prev, ...newAttachments]);
                }
              }}
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <div className="text-[var(--text-primary)] font-medium">Drag files here or click to select</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Supported: All file types (Max 25MB per file)</div>
              </label>
            </div>
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="bg-[#F9FAFB] border border-[var(--border-color)] rounded-lg p-4 space-y-3">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                📎 {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </div>
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white border border-[var(--border-color)] rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{att.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{formatFileSize(att.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove file"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex items-center justify-end pt-4 border-t border-[var(--border-color)]">
            <button
              type="submit"
              disabled={sending}
              className={`px-4 py-2 rounded-lg btn-primary text-white shadow-sm ${
                sending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {sending ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`rounded-lg border-l-4 p-4 ${
            result.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}
        >
          <strong>{result.type === 'success' ? '✓ Success' : '✗ Error'}</strong>
          <p className="text-sm mt-1">{result.message}</p>
        </div>
      )}
    </div>
  );
}
