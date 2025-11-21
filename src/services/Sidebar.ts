import { LayoutGrid, Globe, Settings, Search, Radio } from "lucide-react";
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

export interface NavigationItem {
  name: string;
  path?: string;
  icon: any;
  children?: NavigationItem[];
}

export const sidebarItems: NavigationItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
  {
    name: "Master Data",
    icon: File02Icon,
    children: [
      { name: "Brand Master", path: "/master/brand", icon: BrandMasterIcon },
      { name: "Agency Master", path: "/master/agency", icon: AgencyMasterIcon },
      { name: "Department Master", path: "/master/department", icon: DepartmentMasterIcon },
      { name: "Designation Master", path: "/master/designation", icon: DesignationMasterIcon },
      { name: "Industry Master", path: "/master/industry", icon: Radio },
      { name: "Lead Source", path: "/master/source", icon: Search },
    ],
  },
  {
    name: "Lead Management",
    icon: LeadManagementIcon,
    children: [
      { name: "All Leads", path: "/lead-management/all-leads", icon: LeadManagementIcon },
      { name: "Brief Status", path: "/lead-management/brief-status", icon: Brief2Icon },
      { name: "Pending", path: "/lead-management/pending", icon: LeadManagementIcon },
      { name: "Interested", path: "/lead-management/interested", icon: LeadManagementIcon },
      { name: "Meeting Scheduled", path: "/lead-management/meeting-scheduled", icon: LeadManagementIcon },
      { name: "Meeting Done", path: "/lead-management/meeting-done", icon: LeadManagementIcon },
    ],
  },
  {
    name: "Brief",
    icon: Brief2Icon,
    children: [
      { name: "Brief Pipeline", path: "/brief/Brief_Pipeline", icon: Brief2Icon },
      { name: "Brief Request", path: "/brief/create", icon: Brief2Icon },
    ],
  },
  {
    name: "Miss Campaign",
    icon: Globe,
    path: "/miss-campaign/view",
  },
  { name: "Campaign Management", path: "/campaign-management", icon: CampaignManagementIcon },
  { name: "Finance", path: "/finance", icon: FinanceIcon },
  {
    name: "User Management",
    icon: UserManagementIcon,
    children: [
      { name: "Permission", path: "/user-management/permission", icon: UserManagementIcon },
      { name: "Role", path: "/user-management/role", icon: UserManagementIcon },
      { name: "User", path: "/user-management/user", icon: UserManagementIcon },
    ],
  },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default sidebarItems;
