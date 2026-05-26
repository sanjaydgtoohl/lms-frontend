/**
 * @file MeetingScheduled.tsx
 * @description Meeting-scheduled leads pipeline view.
 * @author Sanjay Jangid <sanjay.jangid@dgtoohl.com>
 * @date 2026-05-25
 */

import React from 'react';
import LeadList from './LeadList';

const MeetingScheduled: React.FC = () => {
  return <LeadList title=" Meeting Scheduled" filterStatus="Meeting Scheduled" />;
};

export default MeetingScheduled;
