import React, { useState } from 'react';
import { Users, FileCheck, IndianRupee, BarChart3, AlertTriangle, Clock } from 'lucide-react';
import Pagination from '../components/ui/Pagination';

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

const Dashboard: React.FC = () => {
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [alertsPage, setAlertsPage] = useState(1);

  

  const getCurrentPageItems = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  };



  return (
    <div className="p-6 space-y-6 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Total Users</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Pending Assignments</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹2,850,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Team Performance</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">92%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
          <div className="px-6 py-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pending Assignments</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                {getCurrentPageItems(pendingAssignments, assignmentsPage).map((assignment, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">{assignment.initials}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{assignment.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{assignment.priority} Priority</p>
                    </div>
                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Assign</span>
                  </div>
                ))}
                {pendingAssignments.length > ITEMS_PER_PAGE && (
                  <Pagination
                    currentPage={assignmentsPage}
                    totalItems={pendingAssignments.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setAssignmentsPage}
                  />
                )}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
          <div className="px-6 py-4 border-b border-[var(--border-color)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">System Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                {getCurrentPageItems(systemAlerts, alertsPage).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{alert.message}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        <Clock className="w-4 h-4 inline-block mr-1" />
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
                {systemAlerts.length > ITEMS_PER_PAGE && (
                  <Pagination
                    currentPage={alertsPage}
                    totalItems={systemAlerts.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setAlertsPage}
                  />
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Topics */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Progress Topics</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Sales Team</span>
                <span className="text-sm text-[var(--text-secondary)]">76% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Campaign Manager</span>
                <span className="text-sm text-[var(--text-secondary)]">52% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
