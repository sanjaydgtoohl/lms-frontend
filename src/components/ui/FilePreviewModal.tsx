import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type RemoteSource = { kind: 'remote'; url: string; name?: string };
type FileSource = { kind: 'file'; file: File };
type Source = RemoteSource | FileSource;

const getExt = (name: string | undefined) => (name || '').split('.').pop()?.toLowerCase() || '';

const isImage = (ext: string) => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
const isPdf = (ext: string) => ext === 'pdf';
const isText = (ext: string) => ['txt', 'log', 'md', 'csv'].includes(ext);
const isOffice = (ext: string) => ['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'xls', 'xlsx', 'doc', 'docx', 'odp', 'ods'].includes(ext);

// const ANIMATION_DURATION = 250;

const FilePreviewModal: React.FC<{
  isOpen: boolean;
  source?: Source | null;
  onClose: () => void;
}> = ({ isOpen, source, onClose }) => {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const name = useMemo(() => {
    if (!source) return undefined;
    return source.kind === 'file' ? source.file.name : source.name || source.url.split('/').pop();
  }, [source]);

  const ext = useMemo(() => getExt(name), [name]);

  useEffect(() => {
    if (!source) return;
    if (source.kind === 'file') {
      const url = URL.createObjectURL(source.file);
      setLocalUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setLocalUrl(null);
      };
    }
    return undefined;
  }, [source]);

  if (!isOpen || !source || typeof document === 'undefined') return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 100);
  };

  const src = source.kind === 'file' ? localUrl : source.url;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`modal-overlay fixed inset-0 bg-black/50 z-40 backdrop-blur-sm
          ${isClosing ? 'closing' : ''}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`modal-content 
          modal-body rounded-2xl shadow-2xl z-50
           overflow-hidden border border-gray-200 dark:border-gray-700
          ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="modal-title font-semibold text-lg text-gray-900  truncate">
              {name || 'File Preview'}
            </h3>
            <p className="modal-subtitle text-xs text-gray-500 dark:text-gray-400 mt-1">
              {ext ? `${ext.toUpperCase()} File` : 'File'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="modal-close-btn bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xl md:text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 active:scale-95 shrink-0 ml-4"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-scrollable p-4 overflow-auto max-h-[calc(90%-60px)]">
          {src && isImage(ext) && (
            <div className="flex justify-center items-center">
              <img src={src} alt={name || 'image'} className="max-w-full max-h-[70vh] rounded-lg shadow-lg" />
            </div>
          )}

          {src && isPdf(ext) && (
            <iframe
              title={name || 'pdf-preview'}
              src={src}
              className="w-full h-[70vh] rounded-lg border border-gray-200"
            />
          )}

          {src && isText(ext) && (
            <div className="overflow-auto max-h-[70vh] bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              <RemoteTextViewer src={src} isRemote={source.kind === 'remote'} />
            </div>
          )}

          {src && isOffice(ext) && (
            source.kind === 'remote' ? (
              <iframe
                title={name || 'office-preview'}
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`}
                className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="text-center py-12">
                <div className="mb-4 text-gray-600 dark:text-gray-400">Preview not available for local Office files. Please download to view.</div>
                <a
                  href={src ?? undefined}
                  download={name}
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Download File
                </a>
              </div>
            )
          )}

          {!isImage(ext) && !isPdf(ext) && !isText(ext) && !isOffice(ext) && (
            <div className="text-center py-12">
              <div className="mb-4 text-gray-600 dark:text-gray-400">Preview not available for this file type.</div>
              {src ? (
                <a
                  href={src}
                  download={name}
                  className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Download File
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

const RemoteTextViewer: React.FC<{ src?: string | null; isRemote: boolean }> = ({ src, isRemote }) => {
  const [text, setText] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    if (!src) {
      setText(null);
      return undefined;
    }
    setText(undefined);
    fetch(src)
      .then((r) => r.text())
      .then((t) => { if (mounted) setText(t); })
      .catch(() => { if (mounted) setText(null); });
    return () => { mounted = false; };
  }, [src, isRemote]);

  if (text === undefined) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  if (text === null) return <div className="text-gray-500 dark:text-gray-400">Unable to load preview (CORS or network error).</div>;
  return <pre className="whitespace-pre-wrap">{text}</pre>;
};

export default FilePreviewModal;
