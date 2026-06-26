import React from 'react';
import { Check, X } from 'lucide-react';
import Pagination from '../ui/Pagination';
import SimpleListCard from '../ui/SimpleListCard';
import type { Meeting, PendingAssignment } from '../../services/Dashboard';
import {
  deriveAssignmentInitials,
  formatAssignmentName,
  formatDashboardDate,
  paginateItems,
} from '../../utils/dashboardFormat';

const ITEMS_PER_PAGE = 3;

const PRIORITY_STYLES: Record<string, string> = {
  High: 'dashboard-badge dashboard-badge--danger',
  Medium: 'dashboard-badge dashboard-badge--warning',
  Low: 'dashboard-badge dashboard-badge--success',
};

type OverviewPanelsProps = {
  assignments: PendingAssignment[];
  meetings: Meeting[];
  loading: boolean;
  assignmentsPage: number;
  meetingsPage: number;
  priority?: 'all' | 'High' | 'Medium' | 'Low';
  onAssignmentsPageChange: (page: number) => void;
  onMeetingsPageChange: (page: number) => void;
  onPriorityChange: (priority: 'all' | 'High' | 'Medium' | 'Low') => void;
  onCompleteAssignment: (id: number) => void;
  onDismissMeeting: (id: number) => void;
  showAssignments?: boolean;
  showMeetings?: boolean;
};

const OverviewPanels: React.FC<OverviewPanelsProps> = ({
  assignments,
  meetings,
  loading,
  assignmentsPage,
  meetingsPage,
  priority = 'all',
  onAssignmentsPageChange,
  onMeetingsPageChange,
  onPriorityChange,
  onCompleteAssignment,
  onDismissMeeting,
  showAssignments = true,
  showMeetings = true,
}) => {
  const currentAssignments = paginateItems(assignments, assignmentsPage, ITEMS_PER_PAGE);
  const currentMeetings = paginateItems(meetings, meetingsPage, ITEMS_PER_PAGE);

  return (
    <div className={`dashboard-overview-panels ${showAssignments && showMeetings ? '' : 'dashboard-overview-panels--single'}`}>
      {showAssignments ? (
      <SimpleListCard
        title={`Pending Assignments ${loading ? '(Loading...)' : `(${assignments.length})`}`}
        headerRight={
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as 'all' | 'High' | 'Medium' | 'Low')}
            className="dashboard-select"
          >
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        }
        items={currentAssignments}
        renderItem={(assignment) => {
          const extended = assignment as PendingAssignment & {
            brand?: string;
            sub_source?: string;
            created_at?: string;
          };

          return (
            <div className="dashboard-list-item">
              <div className="dashboard-list-item__main">
                <div className="dashboard-avatar">{deriveAssignmentInitials(assignment)}</div>
                <div className="dashboard-list-item__body">
                  <h5 className="dashboard-list-item__title">{formatAssignmentName(assignment.name)}</h5>
                  <div className="dashboard-list-item__meta">
                    {extended.brand ? (
                      <p>
                        <span className="dashboard-list-item__label">Brand:</span> {extended.brand}
                      </p>
                    ) : null}
                    {extended.sub_source ? (
                      <p>
                        <span className="dashboard-list-item__label">Source:</span> {extended.sub_source}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="dashboard-list-item__actions">
                <p className="dashboard-list-item__date">
                  Created: {formatDashboardDate(extended.created_at)}
                </p>
                <div className="dashboard-list-item__controls">
                  <span className={PRIORITY_STYLES[assignment.priority] ?? 'dashboard-badge'}>
                    {assignment.priority}
                  </span>
                  <Check
                    className="dashboard-icon-button dashboard-icon-button--success"
                    onClick={() => onCompleteAssignment(assignment.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') onCompleteAssignment(assignment.id);
                    }}
                    aria-label="Mark complete"
                  />
                </div>
              </div>
            </div>
          );
        }}
        footer={
          assignments.length >= ITEMS_PER_PAGE ? (
            <Pagination
              currentPage={assignmentsPage}
              totalItems={assignments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={onAssignmentsPageChange}
            />
          ) : null
        }
      />

      ) : null}

      {showMeetings ? (
      <SimpleListCard
        title={`Meetings (${meetings.length})`}
        items={currentMeetings}
        renderItem={(meeting) => (
          <div className="dashboard-list-item">
            <div className="dashboard-list-item__body">
              <p className="dashboard-list-item__subtitle">Lead: {meeting.lead.name}</p>
              <p className="dashboard-list-item__title">{meeting.title}</p>
              <p className="dashboard-list-item__subtitle">
                Attendees: {meeting.attendees?.map((attendee) => attendee.name).join(', ') || 'None'}
              </p>
            </div>

            <div className="dashboard-list-item__actions">
              <p className="dashboard-list-item__date">
                Start: {formatDashboardDate(meeting.meetin_start_date)}
                <br />
                End: {formatDashboardDate(meeting.meetin_end_date)}
              </p>
              <div className="dashboard-list-item__controls">
                <span
                  className={`dashboard-badge ${
                    meeting.type === 'face_to_face' ? 'dashboard-badge--info' : 'dashboard-badge--success'
                  }`}
                >
                  {meeting.type}
                </span>
                <X
                  className="dashboard-icon-button"
                  onClick={() => onDismissMeeting(meeting.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onDismissMeeting(meeting.id);
                  }}
                  aria-label="Dismiss meeting"
                />
              </div>
            </div>
          </div>
        )}
        footer={
          meetings.length >= ITEMS_PER_PAGE ? (
            <Pagination
              currentPage={meetingsPage}
              totalItems={meetings.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={onMeetingsPageChange}
            />
          ) : null
        }
      />
      ) : null}
    </div>
  );
};

export default OverviewPanels;
