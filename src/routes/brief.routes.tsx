import { Route, Outlet } from 'react-router-dom';
import BriefPipeline from '../pages/Brief/BriefPipeline';
import { BriefLog, PlanHistory, PlanSubmission, EditSubmittedPlan } from '../pages';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const briefRoutes = (
  <Route path={ROUTE_SEGMENTS.BRIEF} element={<Outlet />}>
    <Route path={ROUTE_SEGMENTS.BRIEF_PIPELINE} element={permissionElement(<BriefPipeline />)} />
    <Route path="create" element={permissionElement(<BriefPipeline />)} />
    <Route path="log" element={permissionElement(<BriefLog />)} />
    <Route path="plan-history/:id" element={permissionElement(<PlanHistory />)} />
    <Route path="plan-submission/:id" element={permissionElement(<PlanSubmission />)} />
    <Route path="edit-submitted-plan/:id" element={permissionElement(<EditSubmittedPlan />)} />
    <Route path=":id" element={permissionElement(<BriefPipeline />)} />
    <Route path=":id/edit" element={permissionElement(<BriefPipeline />)} />
  </Route>
);
