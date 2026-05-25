import React from 'react';
import LeadList from './LeadList';

const Pending: React.FC = () => {
  return <LeadList title="Pending" filterStatus="Pending" />;
};

export default Pending;
