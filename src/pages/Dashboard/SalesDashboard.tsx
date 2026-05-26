/**
 * @file SalesDashboard.tsx
 * @description Sales role dashboard with leads, briefs, and KPI widgets.
 * @author Sanjay Jangid <sanjay.jangid@dgtoohl.com>
 * @date 2026-05-25
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Table, { type Column } from '../../components/ui/Table';
import { ROUTES } from '../../constants';
import {
  getLatestTwoBriefs,
  getRecentActivities,
  getLatestTwoLeads,
  getLatestFollowUpTwoLeads,
  getLatestMeetingScheduledTwoLeads,
  getRecentBriefs,
  getBusinessForecast,
  getPriorities,
  getLeadCountByPriority,
  getBriefCountByPriority,
} from '../../services/SalesDashboard';

type DashboardTab = 'new' | 'brief' | 'follow' | 'meeting';

const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: 'new', label: 'Leads' },
  { id: 'brief', label: 'Brief' },
  { id: 'follow', label: 'Follow Up' },
  { id: 'meeting', label: 'Meeting Scheduled' },
];

const dash = (value: unknown) => (value == null || value === '' ? '-' : String(value));

const TypeBadge = ({ label }: { label: string }) => (
  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-medium whitespace-nowrap">
    {label}
  </span>
);

const getBrandName = (row: { brand?: { name?: string }; agency?: { name?: string } }) =>
  dash(row.brand?.name ?? row.agency?.name);

const getMobile = (row: { mobile_number?: { number?: string }[] }) => {
  const first = row.mobile_number?.[0]?.number;
  return dash(first);
};

const LEAD_COLUMNS: Column<any>[] = [
  { key: 'type', header: 'Type', render: () => <TypeBadge label="Brand" /> },
  { key: 'brand', header: 'Brand Name', render: (l) => getBrandName(l) },
  { key: 'name', header: 'Contact Person', render: (l) => dash(l.name) },
  { key: 'email', header: 'Email', className: 'max-w-[200px] truncate', render: (l) => dash(l.email) },
  { key: 'priority', header: 'Priority', render: (l) => dash((l.priority as { name?: string })?.name) },
  { key: 'call_status', header: 'Call Status', render: (l) => dash((l.call_status_relation as { name?: string })?.name) },
  { key: 'lead_status', header: 'Lead Status', render: (l) => dash((l.lead_status_relation as { name?: string })?.name) },
  { key: 'call_attempt', header: 'Call Attempts', render: (l) => dash(l.call_attempt) },
];

const LEAD_FOLLOW_COLUMNS: Column<any>[] = [
  {
    key: 'type',
    header: 'Type',
    render: (l) => <TypeBadge label={String(l.type ?? 'Lead')} />,
  },
  { key: 'name', header: 'Contact Person', render: (l) => dash(l.name) },
  { key: 'brand', header: 'Brand Name', render: (l) => getBrandName(l) },
  { key: 'email', header: 'Email', className: 'max-w-[200px] truncate', render: (l) => dash(l.email) },
  { key: 'mobile', header: 'Mobile', render: (l) => getMobile(l) },
  { key: 'priority', header: 'Priority', render: (l) => dash((l.priority as { name?: string })?.name) },
  { key: 'call_status', header: 'Call Status', render: (l) => dash((l.call_status_relation as { name?: string })?.name) },
  { key: 'lead_status', header: 'Lead Status', render: (l) => dash((l.lead_status_relation as { name?: string })?.name) },
  { key: 'call_attempt', header: 'Call Attempts', render: (l) => dash(l.call_attempt) },
];

const BRIEF_COLUMNS: Column<any>[] = [
  { key: 'type', header: 'Type', render: () => <TypeBadge label="Brief" /> },
  { key: 'name', header: 'Brief Name', render: (b) => dash(b.name) },
  { key: 'brand', header: 'Brand Name', render: (b) => dash((b.brand as { name?: string })?.name) },
  { key: 'product_name', header: 'Product', render: (b) => dash(b.product_name) },
  { key: 'budget', header: 'Budget', render: (b) => (b.budget != null ? `₹${b.budget}` : '-') },
  { key: 'brief_status', header: 'Brief Status', render: (b) => dash((b.brief_status as { name?: string })?.name) },
  { key: 'contact', header: 'Contact Person', render: (b) => dash((b.contact_person as { name?: string })?.name) },
];

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
    getLatestTwoBriefs()
      .then(setBriefs)
      .catch(() => setBriefs([]));
    getRecentActivities()
      .then(setActivities)
      .catch(() => setActivities([]));
    getLatestTwoLeads()
      .then(setLeads)
      .catch(() => setLeads([]));
    getLatestFollowUpTwoLeads()
      .then(setFollowUpLeads)
      .catch(() => setFollowUpLeads([]));
    getLatestMeetingScheduledTwoLeads()
      .then(setMeetingLeads)
      .catch(() => setMeetingLeads([]));
  }, []);

  // Fetch only for Recent Brief section
  useEffect(() => {
    getRecentBriefs()
      .then(setRecentBriefs)
      .catch(() => setRecentBriefs([]));
  }, []);

  const [activeTab, setActiveTab] = useState<'new' | 'brief' | 'follow' | 'meeting'>('new');
  const [selectedPriorityLead, setSelectedPriorityLead] = useState<string>('Priority');
  const [selectedPriorityBrief, setSelectedPriorityBrief] = useState<string>('Priority');
  const [selectedPriorityBriefId, setSelectedPriorityBriefId] = useState<number | null>(null);
  const [briefCount, setBriefCount] = useState<{ total_briefs: number; priority_brief_count: number } | null>(null);
  const [isPriorityDropdownOpenLead, setIsPriorityDropdownOpenLead] = useState(false);
  const [isPriorityDropdownOpenBrief, setIsPriorityDropdownOpenBrief] = useState(false);
  const [businessForecast, setBusinessForecast] = useState<{ total_budget: number; total_brief_count: number; business_weightage: number } | null>(null);

  useEffect(() => {
    getBusinessForecast()
      .then(setBusinessForecast)
      .catch(() => setBusinessForecast(null));
  }, []);

  const [priorities, setPriorities] = useState<{ id: number; name: string; slug: string }[]>([]);

  const leadDropdownRef = useRef<HTMLDivElement | null>(null);
  const briefDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getPriorities()
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
  }, []);

  useEffect(() => {
    if (selectedPriorityBriefId != null) {
      getBriefCountByPriority(selectedPriorityBriefId)
        .then(data => setBriefCount({ total_briefs: data.total_briefs, priority_brief_count: data.priority_brief_count }))
        .catch(() => setBriefCount(null));
    }
  }, [selectedPriorityBriefId]);

  useEffect(() => {
    if (selectedPriorityLeadId != null) {
      getLeadCountByPriority(selectedPriorityLeadId)
        .then(data => setLeadCount({ total_leads: data.total_leads, priority_lead_count: data.priority_lead_count }))
        .catch(() => setLeadCount(null));
    }
  }, [selectedPriorityLeadId]);

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

  const { tableData, tableColumns } = useMemo(() => {
    switch (activeTab) {
      case 'brief':
        return { tableData: briefs, tableColumns: BRIEF_COLUMNS };
      case 'follow':
        return { tableData: followUpLeads, tableColumns: LEAD_FOLLOW_COLUMNS };
      case 'meeting':
        return { tableData: meetingLeads, tableColumns: LEAD_FOLLOW_COLUMNS };
      default:
        return { tableData: leads, tableColumns: LEAD_COLUMNS };
    }
  }, [activeTab, leads, briefs, followUpLeads, meetingLeads]);

  const handleViewAll = () => {
    navigate(activeTab === 'brief' ? ROUTES.BRIEF.PIPELINE : ROUTES.LEAD.ALL);
  };

  const handleRowView = useCallback(
    (item: { id?: string | number }) => {
      const rowId = String(item.id ?? '');
      if (activeTab === 'brief') {
        navigate(ROUTES.BRIEF.EDIT(rowId));
      } else {
        navigate(ROUTES.LEAD.EDIT(rowId));
      }
    },
    [activeTab, navigate],
  );

  const tableColumnsWithView = useMemo<Column<any>[]>(
    () => [
      ...tableColumns,
      {
        key: 'view',
        header: 'View',
        className: 'text-center',
        render: (item) => (
          <button
            type="button"
            onClick={() => handleRowView(item)}
            className="inline-flex items-center justify-center w-8 h-8 !p-0 border-0 !bg-transparent rounded-full hover:!bg-orange-50 transition-colors"
            title={activeTab === 'brief' ? 'View Brief' : 'View Lead'}
            aria-label={activeTab === 'brief' ? 'View brief' : 'View lead'}
          >
            <Eye className="w-5 h-5 shrink-0 !text-orange-700" strokeWidth={2} />
          </button>
        ),
      },
    ],
    [tableColumns, activeTab, handleRowView],
  );

  return (
    <div className="space-y-6">
      {/* Top small metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4">
        {/* New Leads Card - styled like Brief */}
        <div ref={leadDropdownRef} className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 gap-3 shadow-custom relative">
          <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Total Leads</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl lg:text-2xl font-semibold">
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

        <div ref={briefDropdownRef} className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 gap-3 shadow-custom relative">
          <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Total Briefs</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl md:text-2xl font-semibold">
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

        <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 gap-3 shadow-custom relative">
          <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Business Forecast</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl md:text-2xl font-semibold">
              {businessForecast ? `₹${businessForecast.total_budget}` : '--'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 gap-3 shadow-custom relative">
          <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Business Weightage</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl md:text-2xl font-semibold">
              {businessForecast ? `${businessForecast.business_weightage}%` : '--'}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs and data table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-4 border-b border-gray-200">
          <nav className="flex gap-0 overflow-x-auto -mb-px" aria-label="Dashboard tabs">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button type="button" className="a-tag-button shrink-0 self-start sm:self-center sm:mb-3" onClick={handleViewAll}>
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table
            data={tableData}
            columns={tableColumnsWithView}
            compact
            desktopOnMobile
            keyExtractor={(item, index) => String(item.id ?? index)}
          />
        </div>
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-0 md:gap-x-3 lg:gap-x-4">
        <div className="pb-4 border-b border-gray-200 recent-activities-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm md:text-base">Recent Activities</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3">
            {activities.map((a) => (
              <div key={a.id}>
                <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col h-full">
                  {/* Single-row layout: content on left, status on right */}
                  <div className="flex flex-row items-start justify-between gap-3">
                    {/* Left side: Activity details */}
                    <div className="flex-1 card-item text-gray-800">
                      <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Brand Name:</span> {a.brand_name}</div>
                      <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Assign To:</span> {a.assign_to}</div>
                      <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Contact Person:</span> {a.contact_person_name}</div>
                      <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Call Status:</span> {a.call_status}</div>
                      <div className="text-xs"><span className="font-semibold">Created At:</span> {a.created_at}</div>
                    </div>

                    {/* Right side: Status badge - top right */}
                    {a.lead_status && (
                      <div className="flex-shrink-0">
                        <div className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold text-xs whitespace-nowrap">
                          {a.lead_status}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-4 border-b border-gray-200 recent-brief-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm md:text-base">Recent Brief</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 lg:gap-3">
            {recentBriefs.map(b => (
              <div key={b.id} className="bg-white p-3 rounded-xl border border-gray-100">
                {/* Single-row layout: content on left, progress circle on right */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 pr-3 card-item">
                    <div className="text-xs mb-1 text-gray-800">
                      <span className="font-semibold">Brief Name:</span> {b.name}
                    </div>
                    <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Brand Name:</span> {b.brand_name || '-'}</div>
                    <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Product Name:</span> {b.product_name}</div>
                    <div className="text-xs mb-1 text-gray-800"><span className="font-semibold">Budget:</span> ₹{b.budget}</div>
                    <div className="text-xs"><span className="font-semibold">Contact Person:</span> {b.contact_person_name || '-'}</div>
                  </div>

                  {/* Percentage/progress circle on the right, centered vertically */}
                  <div className='flex flex-col items-end'>
                    {b.brief_status?.name && (
                      <span className="ml-auto mb-3 inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold text-xs">
                        {b.brief_status.name}
                      </span>
                    )}
                    <div className="flex items-center justify-center flex-shrink-0 w-19 h-19 rounded-full bg-gray-100">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <path className="text-gray-200" d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32z" fill="#e6eef6" />
                        <path d="M18 2a16 16 0 1 0 0 32" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${Number(b.brief_status?.percentage || 0)},100`} strokeLinecap="round" />
                        <text x="18" y="20" fontSize="7" className='' textAnchor="middle" fill="#111827">{b.brief_status?.percentage || 0}%</text>
                      </svg>
                    </div>
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