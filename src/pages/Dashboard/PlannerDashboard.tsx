import React, { useState } from 'react';

interface Brief {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  brand: string;
  agency: string;
  productName: string;
  budget: number;
  location: string;
  submissionDate: string;
  timeRemaining: number;
  status: 'Active' | 'Completed' | 'Overdue';
}

const mockBriefs: Brief[] = [
  { id: 'BR001', priority: 'High', brand: 'Nike', agency: 'Agency A', productName: 'Air Max', budget: 50000, location: 'New York', submissionDate: '2024-01-20T10:00:00', timeRemaining: 2, status: 'Active' },
  { id: 'BR002', priority: 'Medium', brand: 'Adidas', agency: 'Agency B', productName: 'Ultraboost', budget: 30000, location: 'Los Angeles', submissionDate: '2024-01-18T14:00:00', timeRemaining: -1, status: 'Overdue' },
  { id: 'BR003', priority: 'Low', brand: 'Puma', agency: 'Agency C', productName: 'Suede', budget: 20000, location: 'Chicago', submissionDate: '2024-01-15T09:00:00', timeRemaining: 5, status: 'Active' },
  { id: 'BR004', priority: 'High', brand: 'Reebok', agency: 'Agency A', productName: 'Classic', budget: 40000, location: 'Miami', submissionDate: '2024-01-10T11:00:00', timeRemaining: 0, status: 'Completed' },
  { id: 'BR005', priority: 'Medium', brand: 'Nike', agency: 'Agency B', productName: 'Air Force', budget: 60000, location: 'Seattle', submissionDate: '2024-01-19T16:00:00', timeRemaining: 3, status: 'Active' },
  { id: 'BR006', priority: 'Low', brand: 'Adidas', agency: 'Agency C', productName: 'Stan Smith', budget: 25000, location: 'Boston', submissionDate: '2024-01-17T13:00:00', timeRemaining: 4, status: 'Active' },
  { id: 'BR007', priority: 'High', brand: 'Puma', agency: 'Agency A', productName: 'RS-X', budget: 35000, location: 'Denver', submissionDate: '2024-01-16T12:00:00', timeRemaining: 1, status: 'Active' },
  { id: 'BR008', priority: 'Medium', brand: 'Reebok', agency: 'Agency B', productName: 'Nano', budget: 45000, location: 'Austin', submissionDate: '2024-01-14T15:00:00', timeRemaining: -2, status: 'Overdue' },
];

const PlannerDashboard: React.FC = () => {
  const briefs = mockBriefs;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getPriorityColor = (priority: string) => {
    const colorMap: { [key: string]: string } = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTimeRemainingText = (days: number) => {
    if (days > 0) return `${days} days left`;
    if (days === 0) return 'Due today';
    return `Overdue by ${Math.abs(days)} days`;
  };

  const activeBriefs = briefs.filter(b => b.status === 'Active');
  const completedThisMonth = briefs.filter(b => b.status === 'Completed').length;
  const overdueCount = briefs.filter(b => b.timeRemaining < 0).length;
  const dueThisWeek = activeBriefs.filter(b => b.timeRemaining <= 7 && b.timeRemaining > 0).length;
  const avgPlanningTime = 4.5; // Mock value
  const onTimePercent = 85; // Mock value

  const totalPages = Math.ceil(activeBriefs.length / itemsPerPage);
  const paginatedBriefs = activeBriefs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-['Inter','Poppins',system-ui,sans-serif]">
      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Active Briefs</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">{activeBriefs.length}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">{dueThisWeek} due this week</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Completed This Month</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">{completedThisMonth}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">{onTimePercent}% on-time delivery</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Avg Planning Time</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">{avgPlanningTime} days</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">Target: 3 days</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Overdue Items</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">{overdueCount}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">{overdueCount === 0 ? 'All on schedule' : `${overdueCount} overdue`}</p>
        </div>
      </div>

      {/* My Assigned Briefs */}
      <div className="bg-gray-100 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">My Assigned Briefs</h3>
          <a className="text-sm text-blue-600 cursor-pointer">View All</a>
        </div>
        <div className="space-y-3">
          {paginatedBriefs.map(brief => (
            <div key={brief.id} className="bg-white p-4 rounded-lg flex items-center justify-between gap-6">
              {/* Section 1: Brief ID + Priority */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Brief ID</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 cursor-pointer font-semibold">#{brief.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(brief.priority)}`}>{brief.priority}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">Product Name</p>
                <p className="text-sm text-blue-400 truncate">{brief.productName}</p>
              </div>
              {/* Section 2: Brand & Detail */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Brand Name</p>
                <p className="text-sm text-blue-600 mb-2">{brief.brand}</p>
                <p className="text-xs text-gray-500 mb-1">Detail</p>
                <p className="text-sm text-blue-400 truncate">Analyze and approve upcoming campaigns</p>
              </div>
              {/* Section 3: Budget & Submission */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Budget</p>
                <p className="text-sm font-semibold mb-2">{formatCurrency(brief.budget)}</p>
                <p className="text-xs text-gray-500 mb-1">Brief Submission Date & Time</p>
                <p className="text-sm text-gray-500">{formatDateTime(brief.submissionDate)}</p>
              </div>
              {/* Section 4 & 5: Deadline and Action */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  <span className="text-sm">{getTimeRemainingText(brief.timeRemaining)}</span>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md">
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex justify-end mt-4 gap-2">
          <button className="px-2 py-1 text-sm bg-gray-200 rounded">‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {page}
            </button>
          ))}
          <button className="px-2 py-1 text-sm bg-gray-200 rounded">›</button>
        </div>
      </div>

    </div>
  );
};

export default PlannerDashboard;