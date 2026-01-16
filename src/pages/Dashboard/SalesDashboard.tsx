import React, { useState, useEffect, useRef } from 'react';


interface LeadRow {
  id: number;
  source: string;
  name: string;
  role?: string;
  mobile?: string;
  priority?: string;
  callStatus?: string;
  attempts?: number;
}

interface Activity {
  id: number;
  brandName: string;
  to: string;
  contactPerson: string;
  comment: string;
  date: string;
  time: string;
  status?: string;
}

interface BriefItem {
  id: number;
  briefName: string;
  brandName: string;
  productName: string;
  budget: string;
  contactPerson: string;
  progress: number;
  status?: string;
}

const mockLeads: LeadRow[] = [
  { id: 1, source: 'DOOH', name: 'Krishna', role: 'BDM / Agency', mobile: '8687678787', priority: 'Select Priority', callStatus: 'Select Call Status', attempts: 0 },
  { id: 2, source: 'DOOH', name: 'Krishna', role: 'BDM / Agency', mobile: '8687678787', priority: 'Select Priority', callStatus: 'Select Call Status', attempts: 0 },
];

const mockActivities: Activity[] = [
  { id: 1, brandName: 'Lava', to: 'Sales Man1', contactPerson: 'Aryan Sharma', comment: 'Send proposal', date: '2024-01-15', time: '10:00 PM', status: 'Pending' },
  { id: 2, brandName: 'Samsung', to: 'Sales Man2', contactPerson: 'Rahul Verma', comment: 'Follow up call', date: '2024-01-16', time: '2:00 PM', status: 'Interested' },
  { id: 3, brandName: 'Apple', to: 'Sales Man3', contactPerson: 'Priya Singh', comment: 'Schedule meeting', date: '2024-01-17', time: '11:00 AM', status: 'Meeting Scheduled' },
  { id: 4, brandName: 'OnePlus', to: 'Sales Man4', contactPerson: 'Amit Kumar', comment: 'Send quote', date: '2024-01-18', time: '4:00 PM', status: 'Meeting Done' },
  { id: 5, brandName: 'Google', to: 'Sales Man5', contactPerson: 'Sneha Patel', comment: 'Email confirmation', date: '2024-01-19', time: '9:00 AM', status: 'Brief Recieved' },
];

const mockBriefs: BriefItem[] = [
  { id: 1, briefName: 'Vivo_X300_2025', brandName: 'Vivo', productName: 'Vivo_X300', budget: '₹250,000', contactPerson: 'Aryan Sharma', progress: 0, status: 'Not Interested' },
  { id: 2, briefName: 'Samsung_Galaxy_2025', brandName: 'Samsung', productName: 'Galaxy_S25', budget: '₹300,000', contactPerson: 'Rahul Verma', progress: 25, status: 'SUBMISSION' },
  { id: 3, briefName: 'Apple_iPhone_2025', brandName: 'Apple', productName: 'iPhone_16', budget: '₹500,000', contactPerson: 'Priya Singh', progress: 50, status: 'Negotiation' },
  { id: 4, briefName: 'OnePlus_Nord_2025', brandName: 'OnePlus', productName: 'Nord_CE4', budget: '₹200,000', contactPerson: 'Amit Kumar', progress: 75, status: 'Approve' },
  { id: 5, briefName: 'Google_Pixel_2025', brandName: 'Google', productName: 'Pixel_9', budget: '₹400,000', contactPerson: 'Sneha Patel', progress: 100, status: 'Closed' },
];

const SalesDashboard: React.FC = () => {
  const [leads] = useState<LeadRow[]>(mockLeads);
  const [activities] = useState<Activity[]>(mockActivities);
  const [briefs] = useState<BriefItem[]>(mockBriefs);
  const [activeTab, setActiveTab] = useState<'new'|'brief'|'follow'|'meeting'>('new');
  const [selectedPriorityLead, setSelectedPriorityLead] = useState<string>('Priority');
  const [selectedPriorityBrief, setSelectedPriorityBrief] = useState<string>('Priority');
  const [isPriorityDropdownOpenLead, setIsPriorityDropdownOpenLead] = useState(false);
  const [isPriorityDropdownOpenBrief, setIsPriorityDropdownOpenBrief] = useState(false);

  const leadDropdownRef = useRef<HTMLDivElement | null>(null);
  const briefDropdownRef = useRef<HTMLDivElement | null>(null);

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Interested': 'bg-green-100 text-green-800',
      'Meeting Scheduled': 'bg-blue-100 text-blue-800',
      'Meeting Done': 'bg-purple-100 text-purple-800',
      'Brief Recieved': 'bg-indigo-100 text-indigo-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'SUBMISSION': 'bg-orange-100 text-orange-800',
      'Negotiation': 'bg-teal-100 text-teal-800',
      'Approve': 'bg-lime-100 text-lime-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        isPriorityDropdownOpenLead &&
        leadDropdownRef.current &&
        !leadDropdownRef.current.contains(target)
      ) {
        setIsPriorityDropdownOpenLead(false);
      }
      if (
        isPriorityDropdownOpenBrief &&
        briefDropdownRef.current &&
        !briefDropdownRef.current.contains(target)
      ) {
        setIsPriorityDropdownOpenBrief(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPriorityDropdownOpenLead, isPriorityDropdownOpenBrief]);

  // (Using mock data; no API calls in this implementation)

  return (
    <div className="space-y-6">
      {/* Top small metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div ref={leadDropdownRef} className="bg-blue-50 p-4 rounded-lg relative">
          <p className="text-xs text-gray-500">Total Leaad</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">34/12</h3>
            <span onClick={() => setIsPriorityDropdownOpenLead(!isPriorityDropdownOpenLead)} className="text-gray-400 cursor-pointer">{selectedPriorityLead} ▾</span>
          </div>
          {isPriorityDropdownOpenLead && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {['All ', 'High', 'Medium', 'Low', 'Others'].map(option => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedPriorityLead(option);
                    setIsPriorityDropdownOpenLead(false);
                  }}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={briefDropdownRef} className="bg-indigo-50 p-4 rounded-lg relative">
          <p className="text-xs text-gray-500">TOTAL BRIEF</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">20/12</h3>
            <span onClick={() => setIsPriorityDropdownOpenBrief(!isPriorityDropdownOpenBrief)} className="text-gray-400 cursor-pointer">{selectedPriorityBrief} ▾</span>
          </div>
          {isPriorityDropdownOpenBrief && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {['All', 'High', 'Medium', 'Low', 'Others'].map(option => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedPriorityBrief(option);
                    setIsPriorityDropdownOpenBrief(false);
                  }}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Business Forecast</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">₹2,850,000</h3>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Business Weightage</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">33.33%</h3>
          </div>
        </div>
      </div>

      {/* Tabs and leads list */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-10">
            <span onClick={() => setActiveTab('new')} className={`cursor-pointer text-sm ${activeTab==='new' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>New Leads</span>
            <span onClick={() => setActiveTab('brief')} className={`cursor-pointer text-sm ${activeTab==='brief' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>Brief</span>
            <span onClick={() => setActiveTab('follow')} className={`cursor-pointer text-sm ${activeTab==='follow' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>Follow Up</span>
            <span onClick={() => setActiveTab('meeting')} className={`cursor-pointer text-sm ${activeTab==='meeting' ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>Meeting Scheduled</span>
          </div>
          <a className="text-sm text-blue-600">View All</a>
        </div>

        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-14 min-w-0">
                <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-semibold">{l.source}</div>
                <div>
                  <div className="text-sm font-semibold">{l.name}</div>
                  <div className="text-xs text-gray-500">{l.role}</div>
                </div>
                <div className="text-xs text-gray-500">Mobile Number<br/><span className="text-gray-700 font-medium text-xs">{l.mobile}</span></div>
                <div className="text-xs text-gray-500">Priority<br/><span className="text-gray-700 font-medium text-xs">{l.priority}</span></div>
                <div className="text-xs text-gray-500">Call Status<br/><span className="text-gray-700 font-medium text-xs">{l.callStatus}</span></div>
                <div className="text-xs text-gray-500">Call Attempts<br/><span className="text-gray-700 font-medium text-xs">{l.attempts}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">👁</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {activities.map(a => (
              <div key={a.id} className="bg-white p-3 rounded-md border border-gray-100 h-[100px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs mb-1"><span className="font-semibold">Brand Name:</span> {a.brandName}</div>
                    <div className="text-xs mb-1"><span className="font-semibold">To:</span> {a.to}</div>
                    <div className="text-xs mb-1"><span className="font-semibold">Contact Person:</span> {a.contactPerson}</div>
                    <div className="text-xs"><span className="font-semibold">Comment:</span> {a.comment}</div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    <div><span className="font-semibold">Date:</span> {a.date} | {a.time}</div>
                    <div className="mt-1"><span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(a.status || '')}`}>{a.status}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Brief</h3>
          </div>
          <div className="space-y-3">
            {briefs.map(b => (
              <div key={b.id} className="bg-white p-3 rounded-md border border-gray-100 flex items-center justify-between h-[100px]">
                <div>
                  <div className="text-xs mb-1"><span className="font-semibold">Brief Name:</span> {b.briefName} <span className={`ml-4 px-2 py-0.5 text-xs rounded ${getStatusColor(b.status || '')}`}>{b.status}</span></div>
                  <div className="text-xs mb-1"><span className="font-semibold">Brand Name:</span> {b.brandName}</div>
                  <div className="text-xs mb-1"><span className="font-semibold">Product Name:</span> {b.productName}</div>
                  <div className="text-xs"><span className="font-semibold">Budget:</span> {b.budget} <span className="ml-4 font-semibold">Contact Person:</span> {b.contactPerson}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
                    <svg viewBox="0 0 36 36" className="w-12 h-12">
                      <path className="text-gray-200" d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32z" fill="#e6eef6"/>
                      <path d="M18 2a16 16 0 1 0 0 32" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${b.progress},100`} strokeLinecap="round"/>
                      <text x="18" y="20" fontSize="8" textAnchor="middle" fill="#111827">{b.progress}%</text>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;