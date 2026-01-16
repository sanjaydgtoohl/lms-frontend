import React, { useRef } from 'react';
import Button from './Button';

type UploadCardProps = {
  supported?: string;
  files: File[];
  accept?: string;
  onChange: (files: File[]) => void;
};

const humanFileSize = (size: number) => {
  if (size === 0) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  return `${(size / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const UploadCard: React.FC<UploadCardProps> = ({ supported, files, accept, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      const newFiles = Array.from(dt.files);
      onChange([...files, ...newFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    onChange([...files, ...newFiles]);
    e.currentTarget.value = '';
  };

  const handleRemove = (index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors bg-white cursor-pointer"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={handleInputChange}
        />

        <div className="text-4xl mb-3">☁️</div>
        <p className="text-gray-600 mb-2">Drag & drop files</p>
        {supported && <p className="text-sm text-gray-500">Supported formats: {supported}</p>}
      </div>

      {files && files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-500">{humanFileSize(f.size)}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 px-3 py-1"
                onClick={() => handleRemove(i)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadCard;
