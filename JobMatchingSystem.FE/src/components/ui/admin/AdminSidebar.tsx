import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Flag,
  Settings,
  Package,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import React from "react";
import RoleGuard from "@/guards/RoleGuard";

function useIsActivePath(path: string) {
  const location = useLocation();
  return location.pathname.startsWith(path);
}

function AdminNav() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60">
          Tổng quan
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/dashboard")}
                tooltip="Dashboard"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/dashboard">
                  <LayoutDashboard className="size-4" />
                  <span className="font-medium text-sm">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60">
          Quản lý hệ thống
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-user")}
                tooltip="Manage Users"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-user">
                  <Users className="size-4" />
                  <span className="font-medium text-sm">Quản lý người dùng</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-company")}
                tooltip="Manage Companies"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-company">
                  <Building className="size-4" />
                  <span className="font-medium text-sm">Quản lý công ty</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-job")}
                tooltip="Manage Jobs"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-job">
                  <Briefcase className="size-4" />
                  <span className="font-medium text-sm">Quản lý công việc</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-report")}
                tooltip="Manage Reports"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-report">
                  <Flag className="size-4" />
                  <span className="font-medium text-sm">Quản lý báo cáo</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60">
          Quản lý nội dung
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-template-cv")}
                tooltip="Manage Template CV"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-template-cv">
                  <FileText className="size-4" />
                  <span className="font-medium text-sm">Quản lý Template CV</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/admin/manage-service-plan")}
                tooltip="Manage Service Plans"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/admin/manage-service-plan">
                  <Package className="size-4" />
                  <span className="font-medium text-sm">Quản lý Gói dịch vụ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <RoleGuard allowedRoles="Candidate">
        <SidebarSeparator className="my-2" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60">
            Cá nhân
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={useIsActivePath("/profile")}
                  tooltip="Personal Profile"
                  size="default"
                  className="h-9 px-3"
                >
                  <Link to="/profile">
                    <Settings className="size-4" />
                    <span className="font-medium text-sm">Hồ sơ cá nhân</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </RoleGuard>
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
    <Sidebar {...props} className="border-r">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-sidebar-foreground leading-tight">
              Admin Page
            </h2>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight">
              Hệ thống tuyển dụng
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 flex-1 overflow-hidden">
        <AdminNav />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={dummyUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
