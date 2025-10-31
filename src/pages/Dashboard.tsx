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
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen"> 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">12</p>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Assignments */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shadow-inner">
                <FileCheck className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Assignments</h3>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">3</p>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shadow-inner">
                <IndianRupee className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Monthly Revenue</h3>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">₹2,850,00</p>
            </div>
          </div>
        </div>

        {/* Card 4: Team Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shadow-inner">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team Performance</h3>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">92%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Pending Assignments</h2>
          </div>
          <div className="p-4">
            <div className="space-y-5">
              {currentAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Enhanced Initials Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-md ${assignment.priority === 'High' ? 'bg-red-500' : assignment.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}>
                      <span className="text-xs">{assignment.initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">{assignment.name}</p>
                      <p className="text-xs text-gray-500 truncate">Assignment due</p>
                    </div>
                  </div>
                  {/* Priority Tag */}
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityClasses(assignment.priority)} flex-shrink-0`}> 
                    {assignment.priority}
                  </span>
                  <button className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0">
                    Assign
                  </button>
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

        {/* System Alerts Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">System Alerts</h2>
          </div>
          <div className="p-4">
            <div className="space-y-5">
              {currentAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 border-b pb-4 last:border-b-0 last:pb-0">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /> 
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 inline-block mr-1 text-gray-400" />
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

      {/* Progress Topics Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Progress Topics</h2>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {/* Progress Bar 1 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-base font-medium text-gray-800">Sales Team Onboarding</span>
                <span className="text-sm text-blue-600 font-semibold">76% Complete</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full shadow-inner" style={{ width: '76%' }}></div>
              </div>
            </div>
            {/* Progress Bar 2 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-base font-medium text-gray-800">Campaign Manager Training</span>
                <span className="text-sm text-blue-600 font-semibold">52% Complete</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full shadow-inner" style={{ width: '52%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;