import { Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import SalesDashboard from '../pages/Dashboard/SalesDashboard';
import PlannerDashboard from '../pages/Dashboard/PlannerDashboard';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const dashboardRoutes = (
  <>
    <Route path={ROUTE_SEGMENTS.DASHBOARD} element={permissionElement(<Dashboard />)} />
    <Route path={ROUTE_SEGMENTS.DASHBOARD_SALES} element={permissionElement(<SalesDashboard />)} />
    <Route path={ROUTE_SEGMENTS.DASHBOARD_PLANNER} element={permissionElement(<PlannerDashboard />)} />
  </>
);
