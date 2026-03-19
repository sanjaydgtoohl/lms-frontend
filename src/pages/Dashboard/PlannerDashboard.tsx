import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlannerDashboardCard, getLatestFiveBriefs } from '../../services/PlannerDashboard';
import type { PlannerDashboardCardResponse, PlannerDashboardBrief } from '../../services/PlannerDashboard';


import { RiFileList3Line, RiCheckboxCircleLine, RiTimerLine, RiErrorWarningLine } from "react-icons/ri";



const PlannerDashboard: React.FC = () => {
  // State for latest assigned briefs
  const navigate = useNavigate();
  const [assignedBriefs, setAssignedBriefs] = useState<PlannerDashboardBrief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState<boolean>(true);
  const [briefsError, setBriefsError] = useState<string | null>(null);

  // Dashboard card state
  const [cardData, setCardData] = useState<PlannerDashboardCardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPlannerDashboardCard()
      .then((data) => {
        setCardData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setBriefsLoading(true);
    setBriefsError(null);
    getLatestFiveBriefs()
      .then((data) => {
        setAssignedBriefs(data);
        setBriefsLoading(false);
      })
      .catch((err) => {
        setBriefsError(err.message || 'Failed to load assigned briefs');
        setBriefsLoading(false);
      });
  }, []);


  // Card values from API
  const activeBriefsCount = cardData?.active_briefs ?? 0;
  const completedThisMonthCount = cardData?.closed_briefs ?? 0;
  const avgPlanningTime = cardData?.average_planning_time_days ?? 0;
  const paginatedBriefs = assignedBriefs;
  const overdueCount = 0; // Not available from API for assigned briefs

  return (
    <div className="space-y-6 font-['Inter','Poppins',system-ui,sans-serif]">
      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-4">
        {/* Loading/Error State */}
        {loading ? (
          <div className="col-span-4 flex justify-center items-center h-24">
            <span className="text-gray-500">Loading dashboard...</span>
          </div>
        ) : error ? (
          <div className="col-span-4 flex justify-center items-center h-24">
            <span className="text-red-500">{error}</span>
          </div>
        ) : <>
          <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
            <div className="bg-item w-16 h-16 rounded-xl bg-gray-100 flex justify-center items-center border border-gray-200">
              <div className="text-3xl text-black">   <RiFileList3Line /></div>
            </div>

            <div>
              <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Active Briefs</p>
              <div className="flex items-center justify-between mt-2 static">
                <h3 className="text-xl lg:text-2xl font-semibold">{activeBriefsCount}</h3>
              </div>
            </div>

          </div>

          <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
            <div className="bg-item w-16 h-16 rounded-xl bg-gray-100 flex justify-center items-center border border-gray-200">
              <div className="text-3xl text-black">   <RiCheckboxCircleLine /></div>
            </div>

            <div>
              <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Completed Brief</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-xl lg:text-2xl font-semibold">{completedThisMonthCount}</h3>
              </div>
            </div>

          </div>

          <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
            <div className="bg-item w-16 h-16 rounded-xl bg-gray-100 flex justify-center items-center border border-gray-200">
              <div className="text-3xl text-black">   <RiTimerLine /></div>
            </div>

            <div>
              <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Avg Planning Time</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-xl lg:text-2xl font-semibold">{avgPlanningTime} days</h3>
              </div>
            </div>

          </div>

          <div className="bg-white p-3 md:p-4 xl:p-5 xxl:p-6 rounded-2xl border border-gray-200 flex items-center gap-3 shadow-custom">
            <div className="bg-item w-16 h-16 rounded-xl bg-gray-100 flex justify-center items-center border border-gray-200">
              <div className="text-3xl text-black"> <RiErrorWarningLine /></div>
            </div>

            <div>
              <p className="text-base lg:text-sm font-medium text-gray-700 leading-tight">Overdue Items</p>
              <div className="flex items-center justify-between mt-2">
                <h3 className="text-xl lg:text-2xl font-semibold">{overdueCount}</h3>
              </div>
            </div>
          </div>
        </>}
      </div>

      {/* My Assigned Briefs */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">My Assigned Briefs</h3>
          <a
            className="a-tag-button"
            onClick={() => navigate('/brief/log')}
          >
            View All
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {briefsLoading ? (
            <div className="flex justify-center items-center h-20 text-gray-500">Loading briefs...</div>
          ) : briefsError ? (
            <div className="flex justify-center items-center h-20 text-red-500">{briefsError}</div>
          ) : !Array.isArray(paginatedBriefs) || paginatedBriefs.length === 0 ? (
            <div className="flex justify-center items-center h-20 text-gray-500">No assigned briefs found.</div>
          ) : (
            (paginatedBriefs || []).map(brief => {
              // Status badge color
              let statusColor = 'bg-gray-100';
              const statusText = brief.status || '';
              if (statusText.toLowerCase() === 'approve') statusColor = 'bg-green-200 text-green-800';
              else if (statusText.toLowerCase() === 'closed') statusColor = 'bg-gray-300 text-gray-800';
              else if (statusText.toLowerCase() === 'submission') statusColor = 'bg-yellow-200 text-yellow-800';
              else if (statusText.toLowerCase() === 'pending') statusColor = 'bg-orange-200 text-orange-800';

              // Budget formatting
              const budget = brief.budget ? `₹${Number(brief.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-';

              // Time left formatting (left_time is a string, e.g., '0 days 19 hours 10 minutes left')
              const timeLeftStr = brief.left_time || '';

              return (
                <div
                  key={brief.id}
                  className="bg-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center md:items-stretch p-3 sm:p-4 gap-3 sm:gap-4 shadow-custom duration-300"
                >
                  {/* Left: Brief Info */}
                  <div className="flex-1 min-w-0 sm:w-auto md:w-auto">
                    <div className="flex flex-row items-center gap-1 sm:gap-2 mb-2 sm:mb-1 flex-wrap">
                      <span className="text-xs text-gray-500">Brief ID</span>
                      <span className="font-semibold text-blue-700 text-sm cursor-pointer">#{brief.id}</span>
                      {statusText && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${statusColor}`}>{statusText}</span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-1">
                      <span className="font-semibold">Product Name :</span> <span className="truncate">{brief.product_name || '-'}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-1">
                      <span className="font-semibold">Brand Name :</span> <span className="truncate">{brief.brand_name || '-'}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-1">
                      <span className="font-semibold">Brief Name :</span> <span className="truncate">{brief.brief_name || '-'}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 mb-1 line-clamp-1">
                      <span className="font-semibold">Brief Submission Date &amp; Time :</span> <span className="truncate">{brief.submission_date || '-'}</span>
                    </div>
                  </div>

                  {/* Right: Time Left & Budget Row, then Submit */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 sm:gap-3 sm:w-auto md:w-auto justify-between md:justify-start flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full shadow-sm border border-blue-100 flex-1 md:flex-initial justify-center md:justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate text-xs">{timeLeftStr}</span>
                    </span>
                    <span className="font-bold text-base sm:text-lg text-gray-900 whitespace-nowrap">{budget}</span>
                    <button
                      type="button"
                      className="icon-button"
                      title="Upload"
                      style={{ padding: 0 }}
                      onClick={() => navigate(`/brief/plan-submission/${brief.id}`)}
                    >
                      {/* Upload (arrow up) icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default PlannerDashboard;