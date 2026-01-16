import React from 'react';
import LeadList from './LeadList';

// Render a single table containing both 'Brief Received' and 'Brief Pending' leads.
const BriefStatus: React.FC = () => {
  return <LeadList title="Brief" filterStatus="Brief" />;
};

export default BriefStatus;
