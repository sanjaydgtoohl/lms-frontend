import { LayoutGrid, Settings } from "lucide-react";
import File02Icon from "../assets/icons/File02Icon";
import AgencyMasterIcon from "../assets/icons/AgencyMasterIcon";
import BrandMasterIcon from "../assets/icons/BrandMasterIcon";
import DepartmentMasterIcon from "../assets/icons/DepartmentMasterIcon";
import DesignationMasterIcon from "../assets/icons/DesignationMasterIcon";
import UserManagementIcon from "../assets/icons/UserManagementIcon";
import LeadManagementIcon from "../assets/icons/LeadManagementIcon";
import CampaignManagementIcon from "../assets/icons/CampaignManagementIcon";
import FinanceIcon from "../assets/icons/FinanceIcon";
import Brief2Icon from "../assets/icons/Brief2Icon";
import MissCampaignIcon from "../assets/icons/MissCampaignIcon";
import HelpIcon from "../assets/icons/HelpIcon";
import SearchIcon from "../assets/icons/SearchIcon";
import LogoutIcon from "../assets/icons/LogoutIcon";


export interface NavigationItem {
  name: string;
  path?: string;
  icon: any;
  children?: NavigationItem[];
}


export const sidebarItems: NavigationItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  { name: "Sales Dashboard", path: "/dashboard/sales", icon: FinanceIcon },
  { name: "Planner Dashboard", path: "/dashboard/planner", icon: LayoutGrid },
  {
    name: "Master Data",
    icon: File02Icon,
    children: [
      {
        name: "Brand Master",
        path: "/master/brand",
        icon: BrandMasterIcon,
        children: [
          { name: "Create", path: "/master/brand/create", icon: undefined },
          { name: "Edit", path: "/master/brand/edit/:id", icon: undefined },
          { name: "View", path: "/master/brand/view/:id", icon: undefined },
          { name: "Delete", path: "/master/brand/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Agency Master",
        path: "/master/agency",
        icon: AgencyMasterIcon,
          children: [
          { name: "Create", path: "/master/agency/create", icon: undefined },
          { name: "Edit", path: "/master/agency/edit/:id", icon: undefined },
          { name: "View", path: "/master/agency/view/:id", icon: undefined },
          { name: "Delete", path: "/master/agency/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Department Master",
        path: "/master/department",
        icon: DepartmentMasterIcon,
          children: [
          { name: "Create", path: "/master/department/create", icon: undefined },
          { name: "Edit", path: "/master/department/edit/:id", icon: undefined },
          { name: "View", path: "/master/department/view/:id", icon: undefined },
          { name: "Delete", path: "/master/department/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Designation Master",
        path: "/master/designation",
        icon: DesignationMasterIcon,
          children: [
          { name: "Create", path: "/master/designation/create", icon: undefined },
          { name: "Edit", path: "/master/designation/edit/:id", icon: undefined },
          { name: "View", path: "/master/designation/view/:id", icon: undefined },
          { name: "Delete", path: "/master/designation/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Industry Master",
        path: "/master/industry",
        icon: SearchIcon,
          children: [
          { name: "Create", path: "/master/industry/create", icon: undefined },
          { name: "Edit", path: "/master/industry/edit/:id", icon: undefined },
          { name: "View", path: "/master/industry/view/:id", icon: undefined },
          { name: "Delete", path: "/master/industry/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Lead Source",
        path: "/master/source",
        icon: SearchIcon,
          children: [
          { name: "Create", path: "/master/source/create", icon: undefined },
          { name: "Edit", path: "/master/source/edit/:id", icon: undefined },
          { name: "View", path: "/master/source/view/:id", icon: undefined },
          { name: "Delete", path: "/master/source/delete/:id", icon: undefined }
        ]
      },
    ],
  },
  {
    name: "Lead Management",
    icon: LeadManagementIcon,
    children: [
      {
        name: "All Leads",
        path: "/lead-management/all-leads",
        icon: LeadManagementIcon,
          children: [
          { name: "Create", path: "/lead-management/all-leads/create", icon: undefined },
          { name: "Edit", path: "/lead-management/all-leads/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/all-leads/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/all-leads/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Brief Status",
        path: "/lead-management/brief-status",
        icon: Brief2Icon,
          children: [
          { name: "Create", path: "/lead-management/brief-status/create", icon: undefined },
          { name: "Edit", path: "/lead-management/brief-status/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/brief-status/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/brief-status/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Pending",
        path: "/lead-management/pending",
        icon: LeadManagementIcon,
          children: [
          { name: "Create", path: "/lead-management/pending/create", icon: undefined },
          { name: "Edit", path: "/lead-management/pending/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/pending/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/pending/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Interested",
        path: "/lead-management/interested",
        icon: LeadManagementIcon,
          children: [
          { name: "Create", path: "/lead-management/interested/create", icon: undefined },
          { name: "Edit", path: "/lead-management/interested/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/interested/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/interested/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Meeting Scheduled",
        path: "/lead-management/meeting-scheduled",
        icon: LeadManagementIcon,
          children: [
          { name: "Create", path: "/lead-management/meeting-scheduled/create", icon: undefined },
          { name: "Edit", path: "/lead-management/meeting-scheduled/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/meeting-scheduled/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/meeting-scheduled/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Meeting Done",
        path: "/lead-management/meeting-done",
        icon: LeadManagementIcon,
          children: [
          { name: "Create", path: "/lead-management/meeting-done/create", icon: undefined },
          { name: "Edit", path: "/lead-management/meeting-done/edit/:id", icon: undefined },
          { name: "View", path: "/lead-management/meeting-done/view/:id", icon: undefined },
          { name: "Delete", path: "/lead-management/meeting-done/delete/:id", icon: undefined }
        ]
      },
    ],
  },
  {
    name: "Brief",
    icon: Brief2Icon,
    children: [
      {
        name: "Brief Pipeline",
        path: "/brief/Brief_Pipeline",
        icon: Brief2Icon,
          children: [
          { name: "Create", path: "/brief/Brief_Pipeline/create", icon: undefined },
          { name: "Edit", path: "/brief/Brief_Pipeline/edit/:id", icon: undefined },
          { name: "View", path: "/brief/Brief_Pipeline/view/:id", icon: undefined },
          { name: "Delete", path: "/brief/Brief_Pipeline/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Brief Request",
        path: "/brief/create",
        icon: Brief2Icon,
          children: [
          { name: "Create", path: "/brief/create/create", icon: undefined },
          { name: "Edit", path: "/brief/create/edit/:id", icon: undefined },
          { name: "View", path: "/brief/create/view/:id", icon: undefined },
          { name: "Delete", path: "/brief/create/delete/:id", icon: undefined }
        ]
      },
    ],
  },
  {
    name: "Miss Campaign",
    icon: MissCampaignIcon,
    path: "/miss-campaign/view",
      children: [
      { name: "Create", path: "/miss-campaign/create", icon: undefined },
      { name: "Edit", path: "/miss-campaign/edit/:id", icon: undefined },
      { name: "View", path: "/miss-campaign/view/:id", icon: undefined },
      { name: "Delete", path: "/miss-campaign/delete/:id", icon: undefined }
    ]
  },
  {
    name: "Campaign Management",
    path: "/campaign-management",
    icon: CampaignManagementIcon,
    children: [
      { name: "Create", path: "/campaign-management/create", icon: undefined },
      { name: "Edit", path: "/campaign-management/edit/:id", icon: undefined },
      { name: "View", path: "/campaign-management/view/:id", icon: undefined },
      { name: "Delete", path: "/campaign-management/delete/:id", icon: undefined }
    ]
  },
  {
    name: "Finance",
    path: "/finance",
    icon: FinanceIcon,
      children: [
      { name: "Create", path: "/finance/create", icon: undefined },
      { name: "Edit", path: "/finance/edit/:id", icon: undefined },
      { name: "View", path: "/finance/view/:id", icon: undefined },
      { name: "Delete", path: "/finance/delete/:id", icon: undefined }
    ]
  },
  {
    name: "User Management",
    icon: UserManagementIcon,
    children: [
      {
        name: "Permission",
        path: "/user-management/permission",
        icon: UserManagementIcon,
          children: [
          { name: "Create", path: "/user-management/permission/create", icon: undefined },
          { name: "Edit", path: "/user-management/permission/edit/:id", icon: undefined },
          { name: "View", path: "/user-management/permission/view/:id", icon: undefined },
          { name: "Delete", path: "/user-management/permission/delete/:id", icon: undefined }
        ]
      },
      {
        name: "Role",
        path: "/user-management/role",
        icon: UserManagementIcon,
          children: [
          { name: "Create", path: "/user-management/role/create", icon: undefined },
          { name: "Edit", path: "/user-management/role/edit/:id", icon: undefined },
          { name: "View", path: "/user-management/role/view/:id", icon: undefined },
          { name: "Delete", path: "/user-management/role/delete/:id", icon: undefined }
        ]
      },
      {
        name: "User",
        path: "/user-management/user",
        icon: UserManagementIcon,
          children: [
          { name: "Create", path: "/user-management/user/create", icon: undefined },
          { name: "Edit", path: "/user-management/user/edit/:id", icon: undefined },
          { name: "View", path: "/user-management/user/view/:id", icon: undefined },
          { name: "Delete", path: "/user-management/user/delete/:id", icon: undefined }
        ]
      },
    ],
  },
  { name: "Help", path: "/help", icon: HelpIcon },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Logout", path: "/logout", icon: LogoutIcon },
];

export default sidebarItems;

// Named export for Sidebar.tsx compatibility
export function fetchSidebar(): Promise<NavigationItem[]> {
  return Promise.resolve(sidebarItems);
}
