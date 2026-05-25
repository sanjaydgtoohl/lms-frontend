import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { initializeAuth } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { ROUTES } from '../constants';

export const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-dvh flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      <p className="text-sm text-gray-500">Loading session...</p>
    </div>
  </div>
);

export const AuthSessionHandler: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const handleForceLogout = () => {
      navigate(ROUTES.LOGIN, { replace: true });
    };

    window.addEventListener('auth:force-logout', handleForceLogout);

    const tokenCheckInterval = setInterval(() => {
      authService.checkAndHandleMissingToken();
    }, 30000);

    return () => {
      window.removeEventListener('auth:force-logout', handleForceLogout);
      clearInterval(tokenCheckInterval);
    };
  }, [navigate]);

  return null;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
