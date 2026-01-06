import React, { useState } from 'react';
import { Users, FileCheck, BarChart3, AlertTriangle, Clock, X, Check } from 'lucide-react';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import SimpleListCard from '../components/ui/SimpleListCard';


interface PendingAssignment {
  id: number;
  initials: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  dueInDays?: number;
  progress?: number; // 0-100
}

interface SystemAlert {
  id: number;
  message: string;
  time: string;
}

const ITEMS_PER_PAGE = 3;

const pendingAssignments: PendingAssignment[] = [
  { id: 1, initials: 'MK', name: 'Mike', priority: 'High', dueInDays: 2, progress: 40 },
  { id: 2, initials: 'AP', name: 'Ashish', priority: 'Medium', dueInDays: 5, progress: 20 },
  { id: 3, initials: 'PP', name: 'Parul', priority: 'Low', dueInDays: 8, progress: 10 },
  { id: 4, initials: 'RK', name: 'Rakesh', priority: 'High', dueInDays: 1, progress: 60 },
  { id: 5, initials: 'SK', name: 'Sarah', priority: 'Medium', dueInDays: 4, progress: 50 },
  { id: 6, initials: 'JD', name: 'John', priority: 'Low', dueInDays: 10, progress: 5 },
];

const systemAlerts: SystemAlert[] = [
  { id: 1, message: 'User Sarah Johnson has not logged in for 5 days', time: '2 hours ago' },
  { id: 2, message: 'Planner 1 is approaching deadline for Samsung campaign', time: '5 hours ago' },
  { id: 3, message: '2 modules are overdue by more than 90 days', time: '1 day ago' },
  { id: 4, message: 'Team meeting scheduled for tomorrow', time: '3 hours ago' },
  { id: 5, message: 'New course materials need review', time: '6 hours ago' },
  { id: 6, message: 'System maintenance scheduled for next week', time: '2 days ago' },
];

const Dashboard: React.FC = () => {
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [assignments, setAssignments] = useState<PendingAssignment[]>(pendingAssignments);
  const [alertsPage, setAlertsPage] = useState(1);
  const [alerts, setAlerts] = useState<SystemAlert[]>(systemAlerts);
  const [alertFilter, setAlertFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

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
  const mapSeverity = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('overdue') || t.includes('deadline')) return 'high';
    if (t.includes('maintenance') || t.includes('not logged') || t.includes('approaching')) return 'medium';
    return 'low';
  };

  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'all') return true;
    return mapSeverity(a.message) === alertFilter;
  });

  const currentAlerts = getCurrentPageItems(filteredAlerts, alertsPage);

  const dismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));
  const markAllRead = () => setAlerts([]);

  // Simple inline sparkline chart component (small, dependency-free)
  const SparklineChart: React.FC = () => {
    const data = [45, 48, 50, 52, 49, 55, 58, 60, 62, 61, 64, 66, 70, 68, 72, 75, 74, 76, 78, 80, 82, 85, 84, 86, 88, 90, 92, 91, 93, 95];
    const width = 680; // will scale via viewBox
    const height = 180;
    const padding = 12;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (d - min) / range) * (height - padding * 2);
      return [x, y];
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    const areaD = `${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

    const last = points[points.length - 1];

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
          <defs>
            <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          <path d={areaD} fill="url(#g1)" />
          <path d={pathD} fill="none" stroke="url(#g2)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line key={i} x1={padding} x2={width - padding} y1={padding + t * (height - padding * 2)} y2={padding + t * (height - padding * 2)} stroke="#f3f4f6" strokeWidth={1} />
          ))}

          {/* last point */}
          <circle cx={last[0]} cy={last[1]} r={4} fill="#06b6d4" />
        </svg>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div>Min {min}</div>
          <div>Average {Math.round(data.reduce((s, v) => s + v, 0) / data.length)}%</div>
          <div>Max {max}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={12} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Pending Assignments" value={assignments.length} icon={<FileCheck className="w-5 h-5" />} />
        <StatCard title="Team Performance" value={"92%"} icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard title="Open Alerts" value={alerts.length} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* Performance Chart - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Performance</h2>
            <p className="text-xs text-gray-500 mt-1">Overview of recent activity</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-xs text-gray-500">Range:</div>
              <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1">
                <button className="px-2 py-1 text-xs rounded text-gray-700 bg-white">7d</button>
                <button className="px-2 py-1 text-xs rounded text-gray-700 bg-white">30d</button>
                <button className="px-2 py-1 text-xs rounded text-gray-700 bg-white">90d</button>
              </div>
            </div>
            <button className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100">Export</button>
          </div>
        </div>

        {/* Inline SVG sparkline + summary */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <SparklineChart />
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">+3.4%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Avg. Completion</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments & Alerts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SimpleListCard
            title={`Pending Assignments (${assignments.length})`}
            headerRight={(
              <div className="flex items-center gap-2">
                <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value as any)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100">New</button>
              </div>
            )}
            items={currentAssignments}
            onItemClick={(item) => console.log('open assignment', item)}
            renderItem={(assignment) => (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {assignment.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{assignment.name}</p>
                    <p className="text-xs text-gray-500">Due <span className="font-medium text-gray-700">{assignment.dueInDays}d</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded whitespace-nowrap ${assignment.priority === 'High' ? 'bg-red-100 text-red-700' : assignment.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {assignment.priority}
                  </span>
                  <button className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded hover:bg-gray-100">Assign</button>
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
            footer={filteredAssignments.length > ITEMS_PER_PAGE ? (
              <Pagination
                currentPage={assignmentsPage}
                totalItems={filteredAssignments.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setAssignmentsPage}
              />
            ) : null}
          />

        <SimpleListCard
          title={`System Alerts (${alerts.length})`}
            headerRight={(
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100">Mark all read</button>
                <select value={alertFilter} onChange={(e) => setAlertFilter(e.target.value as any)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
                  <option value="all">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
            items={currentAlerts}
            renderItem={(alert) => {
              const sev = mapSeverity(alert.message);
              const sevCls = sev === 'high' ? 'bg-red-100 text-red-700' : sev === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
              return (
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 ${sev === 'high' ? 'bg-red-500' : sev === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {alert.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sevCls}`}>{sev}</span>
                    <X
                      className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none focus:ring-0"
                      onClick={() => dismissAlert(alert.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismissAlert(alert.id); }}
                    />
                  </div>
                </div>
              );
            }}
            footer={alerts.length > ITEMS_PER_PAGE ? (
              <Pagination
                currentPage={alertsPage}
                totalItems={filteredAlerts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setAlertsPage}
              />
            ) : null}
          />
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