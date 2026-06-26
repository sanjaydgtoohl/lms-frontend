import React from 'react';

type DashboardMetricCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  embedded?: boolean;
  loading?: boolean;
  footer?: React.ReactNode;
  className?: string;
};

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  value,
  icon,
  embedded = false,
  loading = false,
  footer,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`dashboard-metric-card dashboard-metric-card--skeleton ${embedded ? 'is-embedded' : ''} ${className}`}>
        <div className="dashboard-metric-card__icon-skeleton" />
        <div className="dashboard-metric-card__content">
          <div className="dashboard-metric-card__line dashboard-metric-card__line--short" />
          <div className="dashboard-metric-card__line dashboard-metric-card__line--value" />
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-metric-card ${embedded ? 'is-embedded' : ''} ${className}`}>
      {icon ? <div className="dashboard-metric-card__icon">{icon}</div> : null}
      <div className="dashboard-metric-card__content">
        <p className="dashboard-metric-card__title">{title}</p>
        <div className="dashboard-metric-card__value-row">
          <h3 className="dashboard-metric-card__value">{value}</h3>
          {footer}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCard;
