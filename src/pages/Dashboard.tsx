import React from 'react';
import { useAuthStore } from '../store/auth';
import { Target, Users, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-[var(--text-secondary)]">
          Here's what's happening with your Lead Management System.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[#005A61] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Total Leads</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Converted</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">324</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Conversion Rate</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">26.0%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)] p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Revenue</h3>
              <p className="text-2xl font-bold text-[var(--text-primary)]">$45.2K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border-color)]">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 hover:bg-[var(--hover-bg)] rounded-lg transition-colors duration-200">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
              <p className="text-[var(--text-primary)]">New lead from Website Contact Form</p>
              <span className="text-sm text-[var(--text-secondary)] ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-[var(--hover-bg)] rounded-lg transition-colors duration-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-[var(--text-primary)]">Lead converted to customer</p>
              <span className="text-sm text-[var(--text-secondary)] ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 hover:bg-[var(--hover-bg)] rounded-lg transition-colors duration-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-[var(--text-primary)]">Campaign "Q1 Outreach" launched</p>
              <span className="text-sm text-[var(--text-secondary)] ml-auto">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
