import React from 'react';

const CommentSection: React.FC = () => {
  return (
    <div className="bg-white border border-[#E6E8EC] rounded-2xl shadow-sm p-4 mb-6">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Comment</label>
      <textarea
        placeholder="Additional notes about the lead..."
        className="w-full h-28 px-3 py-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
};

export default CommentSection;
