import type { PlannerHistoryItem } from '../../services/PlanHistory';

export interface SubmittedPlansListProps {
  plans: PlannerHistoryItem[];
  loading?: boolean;
}
