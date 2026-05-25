import { Route } from 'react-router-dom';
import LoginCard from '../pages/Auth/LoginCard';
import { ROUTES } from '../constants';
import { PublicRoute } from './guards';

export const publicRoutes = (
  <Route
    path={ROUTES.LOGIN}
    element={
      <PublicRoute>
        <LoginCard />
      </PublicRoute>
    }
  />
);
