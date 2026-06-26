/**
 * @file PlannerDashboard.tsx
 * @description Planner role dashboard with brief submission and plan tasks.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiTimerLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import DashboardChartsSection from '../../components/dashboard/DashboardChartsSection';
import DashboardMetricCard from '../../components/dashboard/DashboardMetricCard';
import { useApiQuery } from '../../hooks/useApiQuery';
import { getPlannerDashboardCard, getLatestFiveBriefs } from '../../services/PlannerDashboard';
import type { PlannerDashboardBrief } from '../../services/PlannerDashboard';
import {
  createDefaultDashboardFilters,
  serializeDashboardFilters,
  type DashboardFilterState,
} from '../../utils/dashboardFilters';

const STATUS_BADGE: Record<string, string> = {
  approve: 'dashboard-badge dashboard-badge--success',
  closed: 'dashboard-badge',
  submission: 'dashboard-badge dashboard-badge--warning',
  pending: 'dashboard-badge dashboard-badge--warning',
};

type PlannerDashboardProps = {
  embedded?: boolean;
  filters?: DashboardFilterState;
};

const PlannerDashboard: React.FC<PlannerDashboardProps> = ({ embedded = false, filters: filtersProp }) => {
  const navigate = useNavigate();
  const [localFilters] = useState(createDefaultDashboardFilters);
  const filters = filtersProp ?? localFilters;
  const filterKey = serializeDashboardFilters(filters);

  const { data: cardData, loading: cardLoading, error: cardError } = useApiQuery(
    () => getPlannerDashboardCard(filters),
    [filterKey],
  );

  const { data: assignedBriefs = [], loading: briefsLoading, error: briefsError } = useApiQuery(
    () => getLatestFiveBriefs(filters),
    [filterKey],
  );

  const renderBriefCard = (brief: PlannerDashboardBrief) => {
    const statusKey = (brief.status || '').toLowerCase();
    const budget = brief.budget
      ? `₹${Number(brief.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : '-';

    return (
      <div key={brief.id} className="dashboard-planner-brief">
        <div className="dashboard-planner-brief__meta">
          <div className="dashboard-planner-brief__id-row">
            <span className="dashboard-planner-brief__id-label">Brief ID</span>
            <span className="dashboard-planner-brief__id">#{brief.id}</span>
            {brief.status ? (
              <span className={STATUS_BADGE[statusKey] ?? 'dashboard-badge'}>{brief.status}</span>
            ) : null}
          </div>
          <p className="dashboard-planner-brief__field">
            <strong>Product Name:</strong> {brief.product_name || '-'}
          </p>
          <p className="dashboard-planner-brief__field">
            <strong>Brand Name:</strong> {brief.brand_name || '-'}
          </p>
          <p className="dashboard-planner-brief__field">
            <strong>Brief Name:</strong> {brief.brief_name || '-'}
          </p>
          <p className="dashboard-planner-brief__field">
            <strong>Submission:</strong> {brief.submission_date || '-'}
          </p>
        </div>

        <div className="dashboard-planner-brief__aside">
          <span className="dashboard-planner-brief__timer">{brief.left_time || 'No deadline'}</span>
          <span className="dashboard-planner-brief__budget">{budget}</span>
          <button
            type="button"
            className="icon-button"
            title="Upload plan"
            style={{ padding: 0 }}
            onClick={() => navigate(`/brief/plan-submission/${brief.id}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-content">
      {cardError ? (
        <div className="dashboard-error-state">{cardError}</div>
      ) : (
        <div className="dashboard-stat-grid">
          <DashboardMetricCard
            title="Active Briefs"
            value={cardData?.active_briefs ?? 0}
            icon={<RiFileList3Line />}
            embedded={embedded}
            loading={cardLoading}
          />
          <DashboardMetricCard
            title="Completed Brief"
            value={cardData?.closed_briefs ?? 0}
            icon={<RiCheckboxCircleLine />}
            embedded={embedded}
            loading={cardLoading}
          />
          <DashboardMetricCard
            title="Avg Planning Time"
            value={cardData ? `${cardData.average_planning_time_days} days` : '--'}
            icon={<RiTimerLine />}
            embedded={embedded}
            loading={cardLoading}
          />
          <DashboardMetricCard
            title="Overdue Items"
            value={0}
            icon={<RiErrorWarningLine />}
            embedded={embedded}
            loading={cardLoading}
          />
        </div>
      )}

      <DashboardChartsSection variant="planner" filters={filters} />

      <div className="dashboard-section-block">
        <div className="flex items-center justify-between mb-3">
          <h3 className="dashboard-section-block__title mb-0">My Assigned Briefs</h3>
          <button type="button" className="a-tag-button" onClick={() => navigate('/brief/log')}>
            View All
          </button>
        </div>

        <div className="dashboard-planner-briefs">
          {briefsLoading ? (
            <div className="dashboard-empty-state">Loading briefs...</div>
          ) : briefsError ? (
            <div className="dashboard-error-state">{briefsError}</div>
          ) : assignedBriefs.length === 0 ? (
            <div className="dashboard-empty-state">No assigned briefs found.</div>
          ) : (
            assignedBriefs.map(renderBriefCard)
          )}
        </div>
      </div>
    </div>
  );
};

export default PlannerDashboard;
