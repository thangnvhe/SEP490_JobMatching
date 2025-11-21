import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Flag,
  Settings,
  Package,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
            isActive={useIsActivePath("/admin/manage-user")}
            tooltip="Manage Users"
          >
            <Link to="/admin/manage-user">
              <Users />
              <span>Quản lý người dùng</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-company")}
            tooltip="Manage Companies"
          >
            <Link to="/admin/manage-company">
              <Building />
              <span>Quản lý công ty</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-job")}
            tooltip="Manage Jobs"
          >
            <Link to="/admin/manage-job">
              <Briefcase />
              <span>Quản lý công việc</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/manage-report")}
            tooltip="Manage Reports"
          >
            <Link to="/admin/manage-report">
              <Flag />
              <span>Quản lý báo cáo</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/admin/services")}
            tooltip="Services"
          >
            <Link to="/admin/services">
              <Package />
              <span>Dịch vụ</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/profile")}
            tooltip="Personal Profile"
          >
            <Link to="/profile">
              <Settings />
              <span>Hồ sơ cá nhân</span>
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
