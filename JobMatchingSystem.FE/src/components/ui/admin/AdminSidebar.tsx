import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Flag,
  BarChart3,
  Folder,
  User,

} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { NavUser } from "@/components/nav-user";
import React from "react";

function useIsActivePath(path: string) {
  const location = useLocation();
  return location.pathname.startsWith(path);
}

function AdminNav() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/dashboard")}
            tooltip="Dashboard"
          >
            <Link to="/admin/dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/analytics")}
            tooltip="Analytics"
          >
            <Link to="/admin/analytics">
              <BarChart3 />
              <span>Analytics</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/projects")}
            tooltip="Projects"
          >
            <Link to="/admin/projects">
              <Folder />
              <span>Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/team")}
            tooltip="Team"
          >
            <Link to="/admin/team">
              <User />
              <span>Team</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel className="mt-4">Documents</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-company")}
            tooltip="Manage Company"
          >
            <Link to="/admin/manage-company">
              <Building />
              <span>Manage Company</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-user")}
            tooltip="Manage User"
          >
            <Link to="/admin/manage-user">
              <Users />
              <span>Manage User</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-job")}
            tooltip="Manage Job"
          >
            <Link to="/admin/manage-job">
              <Briefcase />
              <span>Manage Job</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-report")}
            tooltip="Manage Report"
          >
            <Link to="/admin/manage-report">
              <Flag />
              <span>Manage Report</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

const dummyUser = {
  name: "Admin",
  email: "admin@example.com",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Admin Page</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarContent className="p-0">
          <AdminNav />
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter>
        <NavUser user={dummyUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
