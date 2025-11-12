import React, { useState } from 'react';
import { Users, FileCheck, BarChart3, AlertTriangle, Clock } from 'lucide-react';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import SimpleListCard from '../components/ui/SimpleListCard';


interface PendingAssignment {
  initials: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface SystemAlert {
  message: string;
  time: string;
}

const ITEMS_PER_PAGE = 3;

const pendingAssignments: PendingAssignment[] = [
  { initials: 'MK', name: 'Mike', priority: 'High' },
  { initials: 'AP', name: 'Ashish', priority: 'Medium' },
  { initials: 'PP', name: 'Parul', priority: 'Low' },
  { initials: 'RK', name: 'Rakesh', priority: 'High' },
  { initials: 'SK', name: 'Sarah', priority: 'Medium' },
  { initials: 'JD', name: 'John', priority: 'Low' },
];

const systemAlerts: SystemAlert[] = [
  { message: 'User Sarah Johnson has not logged in for 5 days', time: '2 hours ago' },
  { message: 'Planner 1 is approaching deadline for Samsung campaign', time: '5 hours ago' },
  { message: '2 modules are overdue by more than 90 days', time: '1 day ago' },
  { message: 'Team meeting scheduled for tomorrow', time: '3 hours ago' },
  { message: 'New course materials need review', time: '6 hours ago' },
  { message: 'System maintenance scheduled for next week', time: '2 days ago' },
];

// Helper function to map priority to Tailwind classes
const getPriorityClasses = (priority: 'High' | 'Medium' | 'Low') => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-700';
    case 'Medium':
      return 'bg-amber-100 text-amber-700';
    case 'Low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};


const Dashboard: React.FC = () => {
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [alertsPage, setAlertsPage] = useState(1);

  // Note: I've replaced your custom CSS variables like [var(--text-primary)]
  // with standard Tailwind color classes for better integration and readability.
  // If you are using a custom theme with CSS variables, you can revert those parts.
  
  const getCurrentPageItems = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };

  const currentAssignments = getCurrentPageItems(pendingAssignments, assignmentsPage);
  const currentAlerts = getCurrentPageItems(systemAlerts, alertsPage);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={12} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Pending Assignments" value={3} icon={<FileCheck className="w-5 h-5" />} />
        <StatCard title="Team Performance" value={"92%"} icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard title="Open Alerts" value={systemAlerts.length} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimpleListCard
          title="Pending Assignments"
          items={currentAssignments}
          renderItem={(assignment) => (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                  {assignment.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{assignment.name}</p>
                  <p className="text-xs text-gray-500 truncate">Assignment Due</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {assignment.priority}
              </span>
            </div>
          )}
          footer={pendingAssignments.length > ITEMS_PER_PAGE ? (
            <Pagination
              currentPage={assignmentsPage}
              totalItems={pendingAssignments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setAssignmentsPage}
            />
          ) : null}
        />

        <SimpleListCard
          title="System Alerts"
          items={currentAlerts}
          renderItem={(alert) => (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800 truncate">{alert.message}</p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {alert.time}
                </p>
              </div>
            </div>
          )}
          footer={systemAlerts.length > ITEMS_PER_PAGE ? (
            <Pagination
              currentPage={alertsPage}
              totalItems={systemAlerts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setAlertsPage}
            />
          ) : null}
        />
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Progress Topics</h2>
        </div>
        <div className="p-4 space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Sales Team Onboarding</span>
              <span className="text-xs text-gray-600 font-medium">76% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gray-600 h-2 rounded-full" style={{ width: '76%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Campaign Manager Training</span>
              <span className="text-xs text-gray-600 font-medium">52% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gray-600 h-2 rounded-full" style={{ width: '52%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;