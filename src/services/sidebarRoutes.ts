// This file contains all sidebar-based routes including CRUD (add, edit, delete, update) for each entity.
// You can import this array wherever you need to check or use all accessible routes.

const sidebarRoutes = [
  // Dashboard
  '/dashboard',
  '/dashboard/sales',
  '/dashboard/planner',

  // Master Data
  '/master/brand',
  '/master/brand/add',
  '/master/brand/edit/:id',
  '/master/brand/delete/:id',
  '/master/brand/update/:id',
  '/master/agency',
  '/master/agency/add',
  '/master/agency/edit/:id',
  '/master/agency/delete/:id',
  '/master/agency/update/:id',
  '/master/department',
  '/master/department/add',
  '/master/department/edit/:id',
  '/master/department/delete/:id',
  '/master/department/update/:id',
  '/master/designation',
  '/master/designation/add',
  '/master/designation/edit/:id',
  '/master/designation/delete/:id',
  '/master/designation/update/:id',
  '/master/industry',
  '/master/industry/add',
  '/master/industry/edit/:id',
  '/master/industry/delete/:id',
  '/master/industry/update/:id',
  '/master/source',
  '/master/source/add',
  '/master/source/edit/:id',
  '/master/source/delete/:id',
  '/master/source/update/:id',

  // Lead Management
  '/lead-management/all-leads',
  '/lead-management/all-leads/add',
  '/lead-management/all-leads/edit/:id',
  '/lead-management/all-leads/delete/:id',
  '/lead-management/all-leads/update/:id',
  '/lead-management/brief-status',
  '/lead-management/pending',
  '/lead-management/interested',
  '/lead-management/meeting-scheduled',
  '/lead-management/meeting-done',

  // Brief
  '/brief/Brief_Pipeline',
  '/brief/create',
  '/brief/log',

  // Miss Campaign
  '/miss-campaign/view',

  // Campaign Management
  '/campaign-management',

  // Gmail / Email panel
  '/gmail',

  // Finance
  '/finance',

  // User Management
  '/user-management/permission',
  '/user-management/permission/add',
  '/user-management/permission/edit/:id',
  '/user-management/permission/delete/:id',
  '/user-management/permission/update/:id',
  '/user-management/role',
  '/user-management/role/add',
  '/user-management/role/edit/:id',
  '/user-management/role/delete/:id',
  '/user-management/role/update/:id',
  '/user-management/user',
  '/user-management/user/add',
  '/user-management/user/edit/:id',
  '/user-management/user/delete/:id',
  '/user-management/user/update/:id',

  // Settings
  '/settings',
];

export default sidebarRoutes;
