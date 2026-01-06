import React, { useEffect, useState } from 'react';
import { getTimeUntilNextRefresh } from '../../utils/auth';

const formatMs = (ms: number) => {
  if (ms <= 0) return 'now';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const TokenRefreshIndicator: React.FC = () => {
  const [timeMs, setTimeMs] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const ms = (window as any).getTimeUntilNextRefresh ? (window as any).getTimeUntilNextRefresh() : getTimeUntilNextRefresh();
      setTimeMs(ms);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (timeMs === null) return null;
  if (timeMs === -1) return <div className="text-xs text-red-500">Token expired</div>;

  const next = new Date(Date.now() + timeMs);
  return (
    <div className="hidden sm:flex items-center text-sm text-gray-600 px-3 py-1 rounded-md bg-gray-50 border border-gray-100">
      <div className="mr-2 text-xs text-gray-500">Next refresh</div>
      <div className="font-medium mr-3">{next.toLocaleTimeString()}</div>
      <div className="text-xs text-gray-500">({formatMs(timeMs)})</div>
    </div>
  );
};

export default TokenRefreshIndicator;
