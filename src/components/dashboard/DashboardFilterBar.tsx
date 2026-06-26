import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Building2, SlidersHorizontal } from 'lucide-react';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import DashboardDateRangePicker from './DashboardDateRangePicker';
import { listOrganisationsForSelect } from '../../api/users';
import type { DashboardFilterState } from '../../utils/dashboardFilters';
import {
  getProcessOrganisationId,
  getUserOrganisationIds,
  isSuperAdminUser,
} from '../../utils/dashboardUserScope';
import type { RootState } from '../../redux/store';

type DashboardFilterBarProps = {
  value: DashboardFilterState;
  onChange: (next: DashboardFilterState) => void;
  onApply: () => void;
  onDateApply: (next: Pick<DashboardFilterState, 'preset' | 'dateFrom' | 'dateTo'>) => void;
  hasPendingChanges?: boolean;
};

const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  value,
  onChange,
  onApply,
  onDateApply,
  hasPendingChanges = false,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [organisationOptions, setOrganisationOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingOrganisations, setLoadingOrganisations] = useState(true);

  const userOrgCount = getUserOrganisationIds(user).length;
  const processOrgId = getProcessOrganisationId(user);
  const isMultiOrgUser = userOrgCount > 1 && !isSuperAdminUser(user);

  const organisationLabel = isMultiOrgUser ? 'Process Organisation' : 'Organisation';

  const organisationPlaceholder = useMemo(() => {
    if (loadingOrganisations) return 'Loading organisations...';
    if (isSuperAdminUser(user)) return 'All organisations';
    if (organisationOptions.length === 0) return 'No organisations assigned';
    if (isMultiOrgUser && processOrgId) {
      const processOrg = organisationOptions.find((option) => option.value === processOrgId);
      return processOrg ? `Default: ${processOrg.label}` : 'Select organisation(s)';
    }
    return organisationOptions.length === 1 ? organisationOptions[0].label : 'Select organisation(s)';
  }, [loadingOrganisations, user, organisationOptions, isMultiOrgUser, processOrgId]);

  useEffect(() => {
    let mounted = true;

    listOrganisationsForSelect()
      .then((options) => {
        if (!mounted) return;
        setOrganisationOptions(
          options.map((option) => ({
            value: String(option.value),
            label: option.label,
          }))
        );
      })
      .catch(() => {
        if (mounted) setOrganisationOptions([]);
      })
      .finally(() => {
        if (mounted) setLoadingOrganisations(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="dashboard-filter-bar">
      <div className="dashboard-filter-bar__header">
        <div className="dashboard-filter-bar__title">
          <SlidersHorizontal className="dashboard-filter-bar__title-icon" aria-hidden />
          <span>Filters</span>
        </div>
        {hasPendingChanges ? (
          <span className="dashboard-filter-bar__status">Unapplied changes</span>
        ) : null}
      </div>

      <div className="dashboard-filter-bar__fields">
        <div className="dashboard-filter-field dashboard-filter-field--org">
          <span className="dashboard-filter-field__label">{organisationLabel}</span>
          <div className="dashboard-filter-field__control">
            <Building2 className="dashboard-filter-field__icon" aria-hidden />
            <MultiSelectDropdown
              name="organisation_ids"
              placeholder={organisationPlaceholder}
              options={organisationOptions}
              value={value.organisationIds}
              onChange={(organisationIds) => onChange({ ...value, organisationIds })}
              disabled={loadingOrganisations || organisationOptions.length === 0}
              className="w-full"
              inputClassName="dashboard-filter-input pl-9"
            />
          </div>
        </div>

        <div className="dashboard-filter-field dashboard-filter-field--date">
          <span className="dashboard-filter-field__label">Date Range</span>
          <div className="dashboard-filter-field__control">
            <DashboardDateRangePicker value={value} onApply={onDateApply} />
          </div>
        </div>

        <div className="dashboard-filter-field dashboard-filter-field--action">
          <span className="dashboard-filter-field__label dashboard-filter-field__label--spacer" aria-hidden>
            &nbsp;
          </span>
          <button
            type="button"
            className="dashboard-filter-apply"
            onClick={onApply}
            disabled={!hasPendingChanges}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilterBar;
