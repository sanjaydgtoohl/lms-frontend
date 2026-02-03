import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeIcon from '../../assets/icons/EyeIcon';




// New Leads will be fetched from API

const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [briefs, setBriefs] = useState<any[]>([]); // For Brief tab
  const [recentBriefs, setRecentBriefs] = useState<any[]>([]); // For Recent Brief section
  const [followUpLeads, setFollowUpLeads] = useState<any[]>([]);
  const [meetingLeads, setMeetingLeads] = useState<any[]>([]);
  const [selectedPriorityLeadId, setSelectedPriorityLeadId] = useState<number | null>(null);
  const [leadCount, setLeadCount] = useState<{ total_leads: number; priority_lead_count: number } | null>(null);
  useEffect(() => {
    import('../../services/SalesDashboard').then(({ fetchLatestTwoBriefs, fetchRecentActivities, fetchLatestTwoLeads, fetchLatestFollowUpTwoLeads, fetchLatestMeetingScheduledTwoLeads }) => {
      fetchLatestTwoBriefs()
        .then(setBriefs)
        .catch(() => setBriefs([]));
      fetchRecentActivities()
        .then(setActivities)
        .catch(() => setActivities([]));
      fetchLatestTwoLeads()
        .then(setLeads)
        .catch(() => setLeads([]));
      fetchLatestFollowUpTwoLeads()
        .then(setFollowUpLeads)
        .catch(() => setFollowUpLeads([]));
      fetchLatestMeetingScheduledTwoLeads()
        .then(setMeetingLeads)
        .catch(() => setMeetingLeads([]));
    });
  }, []);

  // Fetch only for Recent Brief section
  useEffect(() => {
    import('../../services/SalesDashboard').then(({ fetchRecentBriefs }) => {
      fetchRecentBriefs()
        .then(setRecentBriefs)
        .catch(() => setRecentBriefs([]));
    });
  }, []);

  const [activeTab, setActiveTab] = useState<'new'|'brief'|'follow'|'meeting'>('new');
  const [selectedPriorityLead, setSelectedPriorityLead] = useState<string>('Priority');
  const [selectedPriorityBrief, setSelectedPriorityBrief] = useState<string>('Priority');
  const [selectedPriorityBriefId, setSelectedPriorityBriefId] = useState<number | null>(null);
  const [briefCount, setBriefCount] = useState<{ total_briefs: number; priority_brief_count: number } | null>(null);
  const [isPriorityDropdownOpenLead, setIsPriorityDropdownOpenLead] = useState(false);
  const [isPriorityDropdownOpenBrief, setIsPriorityDropdownOpenBrief] = useState(false);
  const [businessForecast, setBusinessForecast] = useState<{ total_budget: number; total_brief_count: number; business_weightage: number } | null>(null);
    useEffect(() => {
      import('../../services/SalesDashboard').then(({ fetchBusinessForecast }) => {
        fetchBusinessForecast()
          .then(setBusinessForecast)
          .catch(() => setBusinessForecast(null));
      });
    }, []);
  const [priorities, setPriorities] = useState<{ id: number; name: string; slug: string }[]>([]);

  const leadDropdownRef = useRef<HTMLDivElement | null>(null);
  const briefDropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    import('../../services/SalesDashboard').then(({ fetchPriorities }) => {
      fetchPriorities()
        .then(data => {
          setPriorities(data);
          if (data.length > 0) {
            setSelectedPriorityLead(data[0].name);
            setSelectedPriorityLeadId(data[0].id);
            setSelectedPriorityBrief(data[0].name);
            setSelectedPriorityBriefId(data[0].id);
          }
        })
        .catch(() => setPriorities([]));
    });
  }, []);

  useEffect(() => {
    if (selectedPriorityBriefId != null) {
      import('../../services/SalesDashboard').then(({ fetchBriefCountByPriority }) => {
        fetchBriefCountByPriority(selectedPriorityBriefId)
          .then(data => setBriefCount({ total_briefs: data.total_briefs, priority_brief_count: data.priority_brief_count }))
          .catch(() => setBriefCount(null));
      });
    }
  }, [selectedPriorityBriefId]);

  useEffect(() => {
    if (selectedPriorityLeadId != null) {
      import('../../services/SalesDashboard').then(({ fetchLeadCountByPriority }) => {
        fetchLeadCountByPriority(selectedPriorityLeadId)
          .then(data => setLeadCount({ total_leads: data.total_leads, priority_lead_count: data.priority_lead_count }))
          .catch(() => setLeadCount(null));
      });
    }
  }, [selectedPriorityLeadId]);

  // ...existing code...

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
        {/* New Leads Card - styled like Brief */}
        <div ref={leadDropdownRef} className="bg-indigo-50 p-4 rounded-lg relative">
          <p className="text-xs text-gray-500">TOTAL LEADS</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">
              {leadCount ? `${leadCount.total_leads}/${leadCount.priority_lead_count}` : '--/--'}
            </h3>
            <span onClick={() => setIsPriorityDropdownOpenLead(!isPriorityDropdownOpenLead)} className="text-gray-400 cursor-pointer">{selectedPriorityLead} ▾</span>
          </div>
          {isPriorityDropdownOpenLead && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {priorities.map(option => (
                <div
                  key={option.id}
                  onClick={() => {
                    setSelectedPriorityLead(option.name);
                    setSelectedPriorityLeadId(option.id);
                    setIsPriorityDropdownOpenLead(false);
                  }}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {option.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={briefDropdownRef} className="bg-indigo-50 p-4 rounded-lg relative">
          <p className="text-xs text-gray-500">TOTAL BRIEF</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">
              {briefCount ? `${briefCount.total_briefs}/${briefCount.priority_brief_count}` : '--/--'}
            </h3>
            <span onClick={() => setIsPriorityDropdownOpenBrief(!isPriorityDropdownOpenBrief)} className="text-gray-400 cursor-pointer">{selectedPriorityBrief} ▾</span>
          </div>
          {isPriorityDropdownOpenBrief && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {priorities.map(option => (
                <div
                  key={option.id}
                  onClick={() => {
                    setSelectedPriorityBrief(option.name);
                    setSelectedPriorityBriefId(option.id);
                    setIsPriorityDropdownOpenBrief(false);
                  }}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  {option.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Business Forecast</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">
              {businessForecast ? `₹${businessForecast.total_budget}` : '--'}
            </h3>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500">Business Weightage</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-semibold">
              {businessForecast ? `${businessForecast.business_weightage}%` : '--'}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs and leads list */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <span
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all duration-150 ${activeTab==='new' ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >New Leads</span>
            <span
              onClick={() => setActiveTab('brief')}
              className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all duration-150 ${activeTab==='brief' ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >Brief</span>
            <span
              onClick={() => setActiveTab('follow')}
              className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all duration-150 ${activeTab==='follow' ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >Follow Up</span>
            <span
              onClick={() => setActiveTab('meeting')}
              className={`px-4 py-2 rounded-full cursor-pointer text-sm transition-all duration-150 ${activeTab==='meeting' ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            >Meeting Scheduled</span>
          </div>
          <a
            className="text-sm text-blue-600 font-semibold hover:underline cursor-pointer"
            onClick={() => {
              if (activeTab === 'brief') {
                navigate('/brief/Brief_Pipeline');
              } else {
                navigate('/lead-management/all-leads');
              }
            }}
          >View All</a>
        </div>

        <div className="space-y-3">
          {activeTab === 'new' && leads.map(l => (
            <div key={l.id} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center gap-6 min-w-0">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Brand</div>
                <div className="text-xs text-gray-500">Brand Name<br/><span className="text-gray-700 font-medium text-xs">{l.brand?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Contact Person<br/><span className="text-gray-700 font-medium text-xs">{l.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Email<br/><span className="text-gray-700 font-medium text-xs">{l.email}</span></div>
                <div className="text-xs text-gray-500">Priority<br/><span className="text-gray-700 font-medium text-xs">-</span></div>
                <div className="text-xs text-gray-500">Call Status<br/><span className="text-gray-700 font-medium text-xs">{l.call_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Lead Status<br/><span className="text-gray-700 font-medium text-xs">{l.lead_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Call Attempts<br/><span className="text-gray-700 font-medium text-xs">{l.call_attempt}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/lead-management/edit/${l.id}`)}
                  title="Edit Lead"
                >
                  <EyeIcon className="w-5 h-5 text-blue-500" />
                </span>
              </div>
            </div>
          ))}
          {activeTab === 'brief' && briefs.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center gap-14 min-w-0">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Brief</div>
                <div className="text-xs text-gray-500">Brief Name<br/><span className="text-gray-700 font-medium text-xs">{b.name}</span></div>
                <div className="text-xs text-gray-500">Brand Name<br/><span className="text-gray-700 font-medium text-xs">{b.brand?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Product<br/><span className="text-gray-700 font-medium text-xs">{b.product_name}</span></div>
                <div className="text-xs text-gray-500">Budget<br/><span className="text-gray-700 font-medium text-xs">₹{b.budget}</span></div>
                <div className="text-xs text-gray-500">Brief Status<br/><span className="text-xs rounded px-2 py-0.5 text-black">{b.brief_status?.name}</span></div>
                <div className="text-xs text-gray-500">Contact Person<br/><span className="text-gray-700 font-medium text-xs">{b.contact_person?.name || '-'}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/brief/${b.id}/edit`)}
                  title="View Brief"
                >
                  <EyeIcon className="w-5 h-5 text-blue-500" />
                </span>
              </div>
            </div>
          ))}
          {activeTab === 'follow' && followUpLeads.map(f => (
            <div key={f.id} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center gap-6 min-w-0">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{f.type}</div>
                <div className="text-xs text-gray-500">Contact Person Name<br/><span className="text-gray-700 font-medium text-xs">{f.name}</span></div>
                <div className="text-xs text-gray-500">Brand Name<br/><span className="text-gray-700 font-medium text-xs">{f.brand ? f.brand.name : f.agency ? f.agency.name : '-'}</span></div>
                <div className="text-xs text-gray-500">Email<br/><span className="text-gray-700 font-medium text-xs">{f.email}</span></div>
                <div className="text-xs text-gray-500">Mobile<br/><span className="text-gray-700 font-medium text-xs">{f.mobile_number && f.mobile_number.length > 0 ? f.mobile_number[0].number : '-'}</span></div>
                <div className="text-xs text-gray-500">Priority<br/><span className="text-gray-700 font-medium text-xs">{f.priority?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Call Status<br/><span className="text-gray-700 font-medium text-xs">{f.call_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Lead Status<br/><span className="text-gray-700 font-medium text-xs">{f.lead_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Call Attempts<br/><span className="text-gray-700 font-medium text-xs">{f.call_attempt}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/lead-management/edit/${f.id}`)}
                  title="Edit Lead"
                >
                  <EyeIcon className="w-5 h-5 text-blue-500" />
                </span>
              </div>
            </div>
          ))}
          {activeTab === 'meeting' && meetingLeads.map(m => (
            <div key={m.id} className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center gap-6 min-w-0">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{m.type}</div>
                <div className="text-xs text-gray-500">Contact Person Name<br/><span className="text-gray-700 font-medium text-xs">{m.name}</span></div>
                <div className="text-xs text-gray-500">Brand Name<br/><span className="text-gray-700 font-medium text-xs">{m.brand ? m.brand.name : m.agency ? m.agency.name : '-'}</span></div>
                <div className="text-xs text-gray-500">Email<br/><span className="text-gray-700 font-medium text-xs">{m.email}</span></div>
                <div className="text-xs text-gray-500">Mobile<br/><span className="text-gray-700 font-medium text-xs">{m.mobile_number && m.mobile_number.length > 0 ? m.mobile_number[0].number : '-'}</span></div>
                <div className="text-xs text-gray-500">Priority<br/><span className="text-gray-700 font-medium text-xs">{m.priority?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Call Status<br/><span className="text-gray-700 font-medium text-xs">{m.call_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Lead Status<br/><span className="text-gray-700 font-medium text-xs">{m.lead_status_relation?.name || '-'}</span></div>
                <div className="text-xs text-gray-500">Call Attempts<br/><span className="text-gray-700 font-medium text-xs">{m.call_attempt}</span></div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/lead-management/edit/${m.id}`)}
                  title="Edit Lead"
                >
                  <EyeIcon className="w-5 h-5 text-blue-500" />
                </span>
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
                    <div className="text-xs mb-1"><span className="font-semibold">Brand Name:</span> {a.brand_name}</div>
                    <div className="text-xs mb-1"><span className="font-semibold">Assign To:</span> {a.assign_to}</div>
                    <div className="text-xs mb-1"><span className="font-semibold">Contact Person:</span> {a.contact_person_name}</div>
                    <div className="text-xs"><span className="font-semibold">Call Status:</span> {a.call_status}</div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    <div><span className="font-semibold">Created At:</span> {a.created_at}</div>
                    {a.lead_status && (
                      <div className="mt-1 inline-block px-2 py-1 rounded bg-green-100 text-green-700 font-semibold text-xs">
                        {a.lead_status}
                      </div>
                    )}
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
            {recentBriefs.map(b => (
              <div key={b.id} className="bg-white p-3 rounded-md border border-gray-100 flex items-center justify-between h-[100px]">
                <div>
                  <div className="text-xs mb-1">
                    <span className="font-semibold">Brief Name:</span> {b.name}
                    {b.brief_status?.name && (
                      <span className="ml-4 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold text-xs">
                        {b.brief_status.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs mb-1"><span className="font-semibold">Brand Name:</span> {b.brand_name || '-'}</div>
                  <div className="text-xs mb-1"><span className="font-semibold">Product Name:</span> {b.product_name}</div>
                  <div className="text-xs">
                    <span className="font-semibold">Budget:</span> ₹{b.budget}
                    <span className="ml-4 font-semibold">Contact Person:</span> {b.contact_person_name || '-'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-100">
                    <svg viewBox="0 0 36 36" className="w-12 h-12">
                      <path className="text-gray-200" d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32z" fill="#e6eef6"/>
                      <path d="M18 2a16 16 0 1 0 0 32" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${Number(b.brief_status?.percentage || 0)},100`} strokeLinecap="round"/>
                      <text x="18" y="20" fontSize="8" textAnchor="middle" fill="#111827">{b.brief_status?.percentage || 0}%</text>
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