import React from 'react';

interface BriefCardProps {
  id: number;
  brief_name: string;
  brand_name: string;
  product_name: string;
  budget: number;
  submission_date: string;
  status: 'Approve' | 'Submission' | 'Closed';
  left_time: string;
}

const BriefCard: React.FC<BriefCardProps> = ({
  id,
  brief_name,
  brand_name,
  product_name,
  budget,
  submission_date,
  status,
  left_time,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg flex items-center justify-between gap-6">
      {/* Section 1: Brief ID & Status */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">Brief ID</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600 cursor-pointer font-semibold">#BR00{id}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold 
            ${status === 'Approve' ? 'bg-green-100 text-green-800' : status === 'Submission' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{status}</span>
        </div>
        <p className="text-xs text-gray-500 mb-1">Product Name</p>
        <p className="text-sm text-blue-400 truncate">{product_name}</p>
      </div>
      {/* Section 2: Brand & Detail */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">Brand Name</p>
        <p className="text-sm text-blue-600 mb-2">{brand_name}</p>
        <p className="text-xs text-gray-500 mb-1">Brief Name</p>
        <p className="text-sm text-blue-400 truncate">{brief_name}</p>
      </div>
      {/* Section 3: Budget & Submission */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">Budget</p>
        <p className="text-sm font-semibold mb-2">₹{budget}</p>
        <p className="text-xs text-gray-500 mb-1">Brief Submission Date & Time</p>
        <p className="text-sm text-gray-500">{submission_date}</p>
      </div>
      {/* Section 4 & 5: Deadline and Action */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
          <span className="text-sm">{left_time}</span>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md">
          Submit
        </button>
      </div>
    </div>
  );
};

export default BriefCard;
