import { Route } from 'react-router-dom';
import GmailPanel from '../components/Gmail/GmailPanel';
import SendEmail from '../components/Gmail/SendEmail';
import ReceiveEmail from '../components/Gmail/ReceiveEmail';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const gmailRoutes = (
  <>
    <Route path={ROUTE_SEGMENTS.GMAIL} element={permissionElement(<GmailPanel />)} />
    <Route path={ROUTE_SEGMENTS.GMAIL_SEND} element={permissionElement(<SendEmail />)} />
    <Route path={ROUTE_SEGMENTS.GMAIL_RECEIVE} element={permissionElement(<ReceiveEmail />)} />
  </>
);
