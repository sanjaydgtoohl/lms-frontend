import { apiClient } from '../utils/apiClient';
import { handleApiError } from '../utils/apiErrorHandler';
import {
  type DashboardFilterState,
  withDashboardFilters,
} from '../utils/dashboardFilters';

export type DashboardChartOrganisationRow = {
  organisationId: string;
  organisationName: string;
  totalLeads: number;
  preLeads: number;
  briefs: number;
  briefBudget: number;
};

export type DashboardChartMetrics = {
  rows: DashboardChartOrganisationRow[];
  totals: {
    totalLeads: number;
    preLeads: number;
    briefs: number;
    briefBudget: number;
  };
};

const EMPTY_METRICS: DashboardChartMetrics = {
  rows: [],
  totals: { totalLeads: 0, preLeads: 0, briefs: 0, briefBudget: 0 },
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== '') return String(value);
  }
  return '';
}

function normalizeRow(raw: unknown, index: number): DashboardChartOrganisationRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const organisationName = pickString(record, [
    'organisation_name',
    'organization_name',
    'name',
    'label',
  ]);
  const organisationId = pickString(record, [
    'organisation_id',
    'organization_id',
    'id',
  ]) || String(index + 1);

  if (!organisationName) return null;

  return {
    organisationId,
    organisationName,
    totalLeads: toNumber(record.total_leads ?? record.totalLeads ?? record.leads),
    preLeads: toNumber(record.pre_leads ?? record.preLeads ?? record.miss_campaigns),
    briefs: toNumber(record.briefs ?? record.total_briefs ?? record.brief_count),
    briefBudget: toNumber(record.brief_budget ?? record.briefBudget ?? record.total_budget),
  };
}

function normalizeChartMetrics(data: unknown): DashboardChartMetrics {
  if (!data) return EMPTY_METRICS;

  const payload = data as Record<string, unknown>;
  const rawRows = Array.isArray(data)
    ? data
    : Array.isArray(payload.by_organisation)
      ? payload.by_organisation
      : Array.isArray(payload.by_organization)
        ? payload.by_organization
        : Array.isArray(payload.organisations)
          ? payload.organisations
          : Array.isArray(payload.data)
            ? payload.data
            : [];

  const rows = rawRows
    .map((row, index) => normalizeRow(row, index))
    .filter((row): row is DashboardChartOrganisationRow => row != null);

  const totalsSource = (payload.totals ?? payload.summary ?? payload) as Record<string, unknown>;

  const totals = {
    totalLeads: toNumber(totalsSource.total_leads ?? totalsSource.totalLeads),
    preLeads: toNumber(totalsSource.pre_leads ?? totalsSource.preLeads),
    briefs: toNumber(totalsSource.briefs ?? totalsSource.total_briefs),
    briefBudget: toNumber(totalsSource.brief_budget ?? totalsSource.briefBudget ?? totalsSource.total_budget),
  };

  const hasTotals = Object.values(totals).some((value) => value > 0);
  const computedTotals = hasTotals
    ? totals
    : {
        totalLeads: rows.reduce((sum, row) => sum + row.totalLeads, 0),
        preLeads: rows.reduce((sum, row) => sum + row.preLeads, 0),
        briefs: rows.reduce((sum, row) => sum + row.briefs, 0),
        briefBudget: rows.reduce((sum, row) => sum + row.briefBudget, 0),
      };

  return { rows, totals: computedTotals };
}

export async function getDashboardChartMetrics(
  filters?: DashboardFilterState
): Promise<DashboardChartMetrics> {
  try {
    const res = await apiClient.get<unknown>(
      withDashboardFilters('/dashboard/charts', filters, { includePriority: false })
    );
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch dashboard chart metrics');
    }
    return normalizeChartMetrics(res.data);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export type SalesChartOrganisationRow = {
  organisationId: string;
  organisationName: string;
  totalLeads: number;
  briefs: number;
  briefBudget: number;
};

export type SalesChartMetrics = {
  rows: SalesChartOrganisationRow[];
  totals: {
    totalLeads: number;
    briefs: number;
    briefBudget: number;
  };
  pipeline: {
    newLeads: number;
    followUp: number;
    meetingScheduled: number;
    briefs: number;
  };
};

export type PlannerChartOrganisationRow = {
  organisationId: string;
  organisationName: string;
  briefs: number;
  briefBudget: number;
  assignedPlans: number;
  avgAssignmentDays: number;
};

export type PlannerChartMetrics = {
  rows: PlannerChartOrganisationRow[];
  totals: {
    briefs: number;
    briefBudget: number;
    assignedPlans: number;
    avgAssignmentDays: number;
  };
  briefStatus: {
    activeBriefs: number;
    closedBriefs: number;
    overdueBriefs: number;
  };
};

function normalizeSalesRow(raw: unknown, index: number): SalesChartOrganisationRow | null {
  const base = normalizeRow(raw, index);
  if (!base) return null;
  return {
    organisationId: base.organisationId,
    organisationName: base.organisationName,
    totalLeads: base.totalLeads,
    briefs: base.briefs,
    briefBudget: base.briefBudget,
  };
}

function normalizeSalesMetrics(data: unknown): SalesChartMetrics {
  const payload = (data ?? {}) as Record<string, unknown>;
  const rawRows = Array.isArray(payload.by_organisation) ? payload.by_organisation : [];
  const rows = rawRows
    .map((row, index) => normalizeSalesRow(row, index))
    .filter((row): row is SalesChartOrganisationRow => row != null);

  const totalsSource = (payload.totals ?? {}) as Record<string, unknown>;
  const pipelineSource = (payload.pipeline ?? {}) as Record<string, unknown>;

  return {
    rows,
    totals: {
      totalLeads: toNumber(totalsSource.total_leads ?? totalsSource.totalLeads),
      briefs: toNumber(totalsSource.briefs),
      briefBudget: toNumber(totalsSource.brief_budget ?? totalsSource.briefBudget),
    },
    pipeline: {
      newLeads: toNumber(pipelineSource.new_leads ?? pipelineSource.newLeads),
      followUp: toNumber(pipelineSource.follow_up ?? pipelineSource.followUp),
      meetingScheduled: toNumber(pipelineSource.meeting_scheduled ?? pipelineSource.meetingScheduled),
      briefs: toNumber(pipelineSource.briefs),
    },
  };
}

function normalizePlannerRow(raw: unknown, index: number): PlannerChartOrganisationRow | null {
  const base = normalizeRow(raw, index);
  if (!base) return null;
  const record = raw as Record<string, unknown>;

  return {
    organisationId: base.organisationId,
    organisationName: base.organisationName,
    briefs: base.briefs,
    briefBudget: base.briefBudget,
    assignedPlans: toNumber(record.assigned_plans ?? record.assignedPlans),
    avgAssignmentDays: toNumber(record.avg_assignment_days ?? record.avgAssignmentDays),
  };
}

function normalizePlannerMetrics(data: unknown): PlannerChartMetrics {
  const payload = (data ?? {}) as Record<string, unknown>;
  const rawRows = Array.isArray(payload.by_organisation) ? payload.by_organisation : [];
  const rows = rawRows
    .map((row, index) => normalizePlannerRow(row, index))
    .filter((row): row is PlannerChartOrganisationRow => row != null);

  const totalsSource = (payload.totals ?? {}) as Record<string, unknown>;
  const statusSource = (payload.brief_status ?? payload.briefStatus ?? {}) as Record<string, unknown>;

  return {
    rows,
    totals: {
      briefs: toNumber(totalsSource.briefs),
      briefBudget: toNumber(totalsSource.brief_budget ?? totalsSource.briefBudget),
      assignedPlans: toNumber(totalsSource.assigned_plans ?? totalsSource.assignedPlans),
      avgAssignmentDays: toNumber(totalsSource.avg_assignment_days ?? totalsSource.avgAssignmentDays),
    },
    briefStatus: {
      activeBriefs: toNumber(statusSource.active_briefs ?? statusSource.activeBriefs),
      closedBriefs: toNumber(statusSource.closed_briefs ?? statusSource.closedBriefs),
      overdueBriefs: toNumber(statusSource.overdue_briefs ?? statusSource.overdueBriefs),
    },
  };
}

export async function getSalesChartMetrics(
  filters?: DashboardFilterState
): Promise<SalesChartMetrics> {
  try {
    const res = await apiClient.get<unknown>(
      withDashboardFilters('/dashboard/sales-charts', filters, { includePriority: false })
    );
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch sales chart metrics');
    }
    return normalizeSalesMetrics(res.data);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getPlannerChartMetrics(
  filters?: DashboardFilterState
): Promise<PlannerChartMetrics> {
  try {
    const res = await apiClient.get<unknown>(
      withDashboardFilters('/dashboard/planner-charts', filters, { includePriority: false })
    );
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to fetch planner chart metrics');
    }
    return normalizePlannerMetrics(res.data);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
