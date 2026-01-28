import React, { useState, useEffect } from 'react';
import { Users, FileCheck, BarChart3, AlertTriangle, X, Check } from 'lucide-react';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import SimpleListCard from '../components/ui/SimpleListCard';
import { getPendingAssignments, getDashboardStats, getMeetings, type PendingAssignment, type Meeting } from '../services/Dashboard';
import { getBusinessForecast } from '../services/BusinessForecast';

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
        if (results[3].status === 'fulfilled') {
          setMonthlyRevenue(results[3].value.data.total_budget || 0);
        } else {
          console.error('Failed to fetch business forecast:', results[3].reason);
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
      } catch (e) {
        return txt;
      }
    }
    return txt;
  };

  const formatDateTime = (date: string, time?: string): string => {
    if (!date) return '';
    // Extract YYYY-MM-DD from ISO string
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let dateStr = date;
    if (match) {
      const [_, year, month, day] = match;
      // Format as 'Month DD, YYYY'
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      dateStr = `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    }
    let timeStr = '';
    if (time) {
      // Format time as HH:mm or h:mm AM/PM
      const [h, m] = time.split(":");
      if (h !== undefined && m !== undefined) {
        // Show as 14:15 or 2:15 PM (24h or 12h format)
        // For 24h format:
        timeStr = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      } else {
        timeStr = time;
      }
    }
    return timeStr ? `${dateStr}, ${timeStr}` : dateStr;
  };

  const currentMeetings = getCurrentPageItems(meetings, meetingsPage);

  const dismissMeeting = (id: number) => setMeetings(prev => prev.filter(m => m.id !== id));

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={<><span>Total</span><br /><span>Users</span></>} value={stats.totalUsers} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Pending Assignments" value={stats.pendingAssignments} icon={<FileCheck className="w-5 h-5" />} />
        <StatCard title="Team Performance" value={stats.teamPerformance} icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard title={<><span>Monthly Revenue</span><br /><span></span></>} value={monthlyRevenue} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* Assignments & Alerts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-full">
          <SimpleListCard
            title={`Pending Assignments ${loading ? '(Loading...)' : `(${assignments.length})`}`}
            headerRight={(
              <div className="flex items-center gap-2">
                <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value as any)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {deriveInitials(assignment)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{formatName(assignment.name)}</p>
                    <p className="text-xs text-gray-500">{formatDate((assignment as any).created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
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

        <div className="h-full">
          <SimpleListCard
          title={`Meeting (${meetings.length})`}
            items={currentMeetings}
            renderItem={(meeting) => (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Lead: {meeting.lead.name}</p>
                  <p className="text-xs font-medium text-gray-900">{meeting.title}</p>
                  <p className="text-xs text-gray-500">Attendees: {meeting.attendees?.map((a: {name: string}) => a.name).join(', ') || 'None'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-gray-500">{formatDateTime(meeting.meeting_date, meeting.meeting_time)}</p>
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

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Progress Topics</h2>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">Overview</p>
            <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">ST</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sales Team Onboarding</p>
                <p className="text-xs text-gray-500 mt-1">Assigned to: <span className="text-gray-700 font-medium">Mike, Ashish</span></p>
              </div>
            </div>
            <div className="w-1/3 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-gray-600 font-medium">76%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '76%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-semibold">CM</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Campaign Manager Training</p>
                <p className="text-xs text-gray-500 mt-1">Assigned to: <span className="text-gray-700 font-medium">Parul, Rakesh</span></p>
              </div>
            </div>
            <div className="w-1/3 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-gray-600 font-medium">52%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">PR</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Product Review Cycle</p>
                <p className="text-xs text-gray-500 mt-1">Due: <span className="text-gray-700 font-medium">Dec 20</span></p>
              </div>
            </div>
            <div className="w-1/3 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs text-gray-600 font-medium">34%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '34%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;