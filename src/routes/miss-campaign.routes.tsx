import { Route } from 'react-router-dom';
import { MissCampaignView, MissCampaignCreate } from '../pages/MissCampaign';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const missCampaignRoutes = (
  <>
    <Route path={ROUTE_SEGMENTS.PRE_LEAD_VIEW} element={permissionElement(<MissCampaignView />)} />
    <Route path={ROUTE_SEGMENTS.PRE_LEAD_CREATE} element={permissionElement(<MissCampaignCreate />)} />
    <Route path={ROUTE_SEGMENTS.PRE_LEAD_DETAIL} element={permissionElement(<MissCampaignView />)} />
    <Route path={ROUTE_SEGMENTS.PRE_LEAD_EDIT} element={permissionElement(<MissCampaignView />)} />
  </>
);
