import React, { useState, useEffect } from 'react';
import { Users, FileCheck, BarChart3, X, Check } from 'lucide-react';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import SimpleListCard from '../components/ui/SimpleListCard';
import { getPendingAssignments, getDashboardStats, getMeetings, type PendingAssignment, type Meeting } from '../services/Dashboard';
import { getBusinessForecast } from '../services/BusinessForecast';
import { BsGraphUpArrow } from "react-icons/bs";

const ITEMS_PER_PAGE = 3;

const Dashboard: React.FC = () => {
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [assignments, setAssignments] = useState<PendingAssignment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsPage, setMeetingsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingAssignments: 0,
    teamPerformance: '0%',
    openAlerts: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const formatNumber = (num: number) => num.toLocaleString('en-IN');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          getPendingAssignments(),
          getDashboardStats(),
          getMeetings(),
          getBusinessForecast(),
        ]);

        // Handle assignments
        if (results[0].status === 'fulfilled') {
          setAssignments(results[0].value.data);
        } else {
          console.error('Failed to fetch pending assignments:', results[0].reason);
          setAssignments([]);
        }

        // Handle stats
        if (results[1].status === 'fulfilled') {
          setStats(results[1].value.data);
        } else {
          console.error('Failed to fetch dashboard stats:', results[1].reason);
          // Keep default stats
        }

        // Handle meetings
        if (results[2].status === 'fulfilled') {
          setMeetings(results[2].value.data);
        } else {
          console.error('Failed to fetch meetings:', results[2].reason);
          setMeetings([]);
        }

        // Handle business forecast (monthly revenue)
        if (
          results[3].status === 'fulfilled' &&
          results[3].value &&
          typeof results[3].value.total_budget === 'number'
        ) {
          console.log('Business Forecast total_budget:', results[3].value.total_budget);
          setMonthlyRevenue(results[3].value.total_budget);
        } else {
          console.error('Failed to fetch business forecast:', results[3]);
          setMonthlyRevenue(0);
        }
      } catch (error) {
        console.error('Unexpected error in fetchData:', error);
        // Fallback to empty array or handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Note: I've replaced your custom CSS variables like [var(--text-primary)]
  // with standard Tailwind color classes for better integration and readability.
  // If you are using a custom theme with CSS variables, you can revert those parts.

  const getCurrentPageItems = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  const filteredAssignments = assignments.filter(a => assignmentFilter === 'all' ? true : a.priority === assignmentFilter);

  const currentAssignments = getCurrentPageItems(filteredAssignments, assignmentsPage);

  const completeAssignment = (id: number) => setAssignments(prev => prev.filter(a => a.id !== id));

  const formatName = (n: PendingAssignment['name']): string => {
    if (!n) return '';
    if (typeof n === 'string') return n;
    return (n && ((n as any).full_name || (n as any).name)) || JSON.stringify(n);
  };

  const deriveInitials = (assignment: PendingAssignment) => {
    if (assignment.initials) return assignment.initials;
    const name = formatName(assignment.name);
    if (!name) return '';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDate = (s?: string | null) => {
    if (!s) return '';
    // try to clean up common backend formats like "2026-01-19 20:24:52 PM"
    let txt = String(s).trim();
    // remove duplicate AM/PM if present with 24h time
    txt = txt.replace(/\s+(AM|PM)$/i, ' $1');
    // If parsable by Date, format as locale string, else show raw
    const parsed = Date.parse(txt.replace(/\s+(AM|PM)$/i, ''));
    if (!Number.isNaN(parsed)) {
      try {
        return new Date(parsed).toLocaleString();
      } catch {
        return txt;
      }
    }
    return txt;
  };

  // Removed unused formatDateTime function

  const currentMeetings = getCurrentPageItems(meetings, meetingsPage);

  const dismissMeeting = (id: number) => setMeetings(prev => prev.filter(m => m.id !== id));

  const progressTopics = [
    {
      abbr: 'ST',
      title: 'Sales Team Onboarding',
      meta: 'Assigned to: Mike, Ashish',
      percent: 76,
      colorBg: 'bg-indigo-100',
      colorText: 'text-indigo-700',
    },
    {
      abbr: 'CM',
      title: 'Campaign Manager Training',
      meta: 'Assigned to: Parul, Rakesh',
      percent: 52,
      colorBg: 'bg-rose-100',
      colorText: 'text-rose-700',
    },
    {
      abbr: 'PR',
      title: 'Product Review Cycle',
      meta: 'Due: Dec 20',
      percent: 34,
      colorBg: 'bg-emerald-100',
      colorText: 'text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4">
        <StatCard
          title={
            <div className="flex flex-col items-start">
              <span className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Total Users</span>
            </div>
          }
          value={stats.totalUsers}
          icon={<Users className="" />}
        />
        <StatCard
          title={
            <span className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Pending Assignments</span>
          }
          value={stats.pendingAssignments}
          icon={<FileCheck className="" />}
        />
        <StatCard
          title={
            <span className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Team Performance</span>
          }
          value={stats.teamPerformance}
          icon={<BarChart3 className="" />}
        />
        <StatCard
          title={
            <div className="flex flex-col items-start">
              <span className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Monthly Revenue</span>
            </div>
          }
          value={formatNumber(monthlyRevenue)}
          icon={<BsGraphUpArrow className=" w-[24px] h-[24px]" />}
        />
      </div>

      {/* Assignments & Alerts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max lg:auto-rows-fr">
        <div className="flex flex-col h-full">
          <SimpleListCard
            title={`Pending Assignments ${loading ? '(Loading...)' : `(${assignments.length})`}`}
            headerRight={(
              <div className="flex items-center gap-2">
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value as any)}
                  className="text-xs sm:text-sm border border-gray-200 text-gray-800 rounded-lg px-2 py-2 bg-white">
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            )}
            items={currentAssignments}
            onItemClick={(item) => console.log('open assignment', item)}
            renderItem={(assignment) => (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-2 min-w-0 sm:flex-1">
                  <div className="min-w-10 w-10 sm-w-12 aspect-square  rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center   text-xs font-semibold flex-shrink-0 mt-0.5">
                    {deriveInitials(assignment)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">{formatName(assignment.name)}</h5>
                 
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {(assignment as any).brand && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium text-black">Brand Name:</span> {(assignment as any).brand}
                          </p>
                        )}
                        {(assignment as any).sub_source && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium text-black">Source:</span> {(assignment as any).sub_source}
                          </p>
                        )}
                        {(assignment as any).mobile_numbers && (assignment as any).mobile_numbers.length > 0 && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium text-black">Mobile No.:</span> {(assignment as any).mobile_numbers[0]}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                  <p className="text-xs text-gray-500">
                    Created: {formatDate((assignment as any).created_at)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap ${assignment.priority === 'High' ? 'bg-red-100 text-red-700' : assignment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {assignment.priority}
                    </span>
                    <Check
                      className="w-4 h-4 text-green-500 hover:text-green-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 rounded flex-shrink-0"
                      onClick={() => completeAssignment(assignment.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') completeAssignment(assignment.id); }}
                      aria-label="Mark complete"
                    />
                  </div>
                </div>
              </div>
            )}
            footer={filteredAssignments.length >= ITEMS_PER_PAGE ? (
              <Pagination
                currentPage={assignmentsPage}
                totalItems={filteredAssignments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setAssignmentsPage}
              />
            ) : null}
          />
        </div>

        <div className="flex flex-col h-full">
          <SimpleListCard
            title={`Meeting (${meetings.length})`}
            items={currentMeetings}
            onItemClick={(item) => console.log('open meeting', item)}
            renderItem={(meeting) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Lead: {meeting.lead.name}</p>
                  <p className="text-xs font-medium text-gray-900">{meeting.title}</p>
                  <p className="text-xs text-gray-500">Attendees: {meeting.attendees?.map((a: { name: string }) => a.name).join(', ') || 'None'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-gray-500">
                    Start: {formatDate(meeting.meetin_start_date)}<br />
                    End: {formatDate(meeting.meetin_end_date)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${meeting.type === 'face_to_face' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {meeting.type}
                    </span>
                    <X
                      className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none focus:ring-0"
                      onClick={() => dismissMeeting(meeting.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismissMeeting(meeting.id); }}
                    />
                  </div>
                </div>
              </div>
            )}
            footer={meetings.length >= ITEMS_PER_PAGE ? (
              <Pagination
                currentPage={meetingsPage}
                totalItems={meetings.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setMeetingsPage}
              />
            ) : null}
          />
        </div>
      </div>

      {/* Progress Topics */}
      <SimpleListCard
        title={`Progress Topics`}
        headerRight={(
          <div className="flex items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-500">Overview</p>
            <select className="text-xs sm:text-sm border border-gray-200 text-gray-800 rounded-lg px-2 py-2 bg-white">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        )}
        items={progressTopics}
        renderItem={(topic) => (
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${topic.colorBg} ${topic.colorText} flex items-center justify-center font-semibold`}>{topic.abbr}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{topic.title}</p>
                <p className="text-xs text-gray-500 mt-1">{topic.meta.includes('Assigned') ? <><span className="text-gray-700 font-medium">{topic.meta.replace('Assigned to: ', '')}</span></> : topic.meta}</p>
              </div>
            </div>
            <div className="w-1/3 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-gray-600 font-medium">{topic.percent}%</span>
              </div>
              <div className="w-full process-item bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${topic.percent}%` }} />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Dashboard;