import React from 'react';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

const CommentSection: React.FC<Props> = ({ value = '', onChange = () => {} }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-[var(--border-color)]">
      <div className="p-6 bg-[#F9FAFB]">
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Comment</label>
        <textarea
          placeholder="Additional notes about the lead..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-28 px-3 py-2 border border-[var(--border-color)] rounded-lg bg-white text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
        />
      </div>
    </div>
  );
};

export default CommentSection;
