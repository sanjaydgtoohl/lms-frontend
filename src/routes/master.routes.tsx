import { Route } from 'react-router-dom';
import LeadSource from '../pages/LeadSource';
import AgencyMaster from '../pages/AgencyMaster';
import AgencyContactPersons from '../pages/AgencyContactPersons';
import BrandMaster from '../pages/BrandMaster';
import BrandContactPersons from '../pages/BrandContactPersons';
import IndustryMaster from '../pages/IndustryMaster';
import DesignationMaster from '../pages/DesignationMaster';
import DepartmentMaster from '../pages/DepartmentMaster';
import { ROUTE_SEGMENTS } from '../constants/routes';
import { permissionElement } from './PermissionElement';

export const masterRoutes = (
  <>
    <Route path={ROUTE_SEGMENTS.MASTER_BRAND} element={permissionElement(<BrandMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_BRAND_CREATE} element={permissionElement(<BrandMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_BRAND_DETAIL} element={permissionElement(<BrandMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_BRAND_EDIT} element={permissionElement(<BrandMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_BRAND_CONTACTS} element={permissionElement(<BrandContactPersons />)} />

    <Route path={ROUTE_SEGMENTS.MASTER_AGENCY} element={permissionElement(<AgencyMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_AGENCY_CREATE} element={permissionElement(<AgencyMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_AGENCY_DETAIL} element={permissionElement(<AgencyMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_AGENCY_EDIT} element={permissionElement(<AgencyMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_AGENCY_CONTACTS} element={permissionElement(<AgencyContactPersons />)} />

    <Route path={ROUTE_SEGMENTS.MASTER_INDUSTRY} element={permissionElement(<IndustryMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_INDUSTRY_CREATE} element={permissionElement(<IndustryMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_INDUSTRY_DETAIL} element={permissionElement(<IndustryMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_INDUSTRY_EDIT} element={permissionElement(<IndustryMaster />)} />

    <Route path={ROUTE_SEGMENTS.MASTER_DESIGNATION} element={permissionElement(<DesignationMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DESIGNATION_CREATE} element={permissionElement(<DesignationMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DESIGNATION_DETAIL} element={permissionElement(<DesignationMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DESIGNATION_EDIT} element={permissionElement(<DesignationMaster />)} />

    <Route path={ROUTE_SEGMENTS.MASTER_DEPARTMENT} element={permissionElement(<DepartmentMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DEPARTMENT_CREATE} element={permissionElement(<DepartmentMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DEPARTMENT_DETAIL} element={permissionElement(<DepartmentMaster />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_DEPARTMENT_EDIT} element={permissionElement(<DepartmentMaster />)} />

    <Route path={ROUTE_SEGMENTS.MASTER_SOURCE} element={permissionElement(<LeadSource />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_SOURCE_CREATE} element={permissionElement(<LeadSource />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_SOURCE_DETAIL} element={permissionElement(<LeadSource />)} />
    <Route path={ROUTE_SEGMENTS.MASTER_SOURCE_EDIT} element={permissionElement(<LeadSource />)} />
  </>
);
