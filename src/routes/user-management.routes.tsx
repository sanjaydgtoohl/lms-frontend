import { Route, Outlet } from 'react-router-dom';
import {
  AllPermissions,
  CreatePermission,
  EditPermission,
  ViewPermission,
  AllRoles,
  CreateRole,
  EditRole,
  ViewRole,
  AllUsers,
  CreateUser,
  EditUser,
  ViewUser,
} from '../pages/UserManagement';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const userManagementRoutes = (
  <Route path={ROUTE_SEGMENTS.USER_MANAGEMENT} element={<Outlet />}>
    <Route index element={permissionElement(<AllPermissions />)} />
    <Route path="permission" element={permissionElement(<AllPermissions />)} />
    <Route path="permission/create" element={permissionElement(<CreatePermission />)} />
    <Route path="permission/edit/:id" element={permissionElement(<EditPermission />)} />
    <Route path="permission/:id" element={permissionElement(<ViewPermission />)} />
    <Route path="role" element={permissionElement(<AllRoles />)} />
    <Route path="role/create" element={permissionElement(<CreateRole />)} />
    <Route path="role/edit/:id" element={permissionElement(<EditRole />)} />
    <Route path="role/:id" element={permissionElement(<ViewRole />)} />
    <Route path="user" element={permissionElement(<AllUsers />)} />
    <Route path="user/create" element={permissionElement(<CreateUser />)} />
    <Route path="user/edit/:id" element={permissionElement(<EditUser />)} />
    <Route path="user/:id" element={permissionElement(<ViewUser />)} />
  </Route>
);
