import React from 'react';
import PermissionRoute from '../components/ui/PermissionRoute';

export const permissionElement = (children: React.ReactNode) => (
  <PermissionRoute>{children}</PermissionRoute>
);
