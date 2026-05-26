import { Route, Outlet } from 'react-router-dom';
import MeetingPipeline from '../pages/Meeting';
import EditMeeting from '../pages/Meeting/EditMeeting';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const meetingRoutes = (
  <Route path={ROUTE_SEGMENTS.MEETING} element={<Outlet />}>
    <Route index element={permissionElement(<MeetingPipeline />)} />
    <Route path="create" element={permissionElement(<MeetingPipeline />)} />
    <Route path=":id" element={permissionElement(<MeetingPipeline />)} />
    <Route path=":id/edit" element={permissionElement(<EditMeeting />)} />
  </Route>
);
