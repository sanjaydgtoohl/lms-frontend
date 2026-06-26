import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import DashboardMetricCard from './DashboardMetricCard';

type PriorityOption = { id: number; name: string };

type PriorityMetricCardProps = {
  title: string;
  total: number | null;
  priorityCount: number | null;
  options: PriorityOption[];
  selectedId: number | null;
  onSelect: (option: PriorityOption) => void;
  embedded?: boolean;
};

const PriorityMetricCard: React.FC<PriorityMetricCardProps> = ({
  title,
  total,
  priorityCount,
  options,
  selectedId,
  onSelect,
  embedded = false,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const priorityOptions = options ?? [];
  const selected = priorityOptions.find((option) => option.id === selectedId);

  useClickOutside([containerRef], open, () => setOpen(false));

  const value =
    total != null && priorityCount != null
      ? `${total}/${priorityCount}`
      : '--/--';

  return (
    <div ref={containerRef} className="relative">
      <DashboardMetricCard
        title={title}
        value={value}
        embedded={embedded}
        footer={
          priorityOptions.length > 0 ? (
            <button
              type="button"
              className="dashboard-priority-trigger"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
            >
              {selected?.name ?? 'Priority'}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ) : null
        }
      />

      {open && priorityOptions.length > 0 ? (
        <div className="dashboard-priority-menu">
          {priorityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="dashboard-priority-menu__item"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PriorityMetricCard;
