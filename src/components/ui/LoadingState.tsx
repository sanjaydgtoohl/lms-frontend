import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading…',
  className = 'flex items-center justify-center py-12 text-gray-500',
}) => (
  <div className={className} role="status" aria-live="polite">
    <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary,#007b83)] mr-3" />
    {message}
  </div>
);

export default LoadingState;
