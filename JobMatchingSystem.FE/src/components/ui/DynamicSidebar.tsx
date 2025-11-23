import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  LayoutDashboard,
  Briefcase,
  User,
  FileText,
  Bookmark,
  Settings,
  Building2,
  Package,
  UserPlus,
  GitBranch,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import React from "react";

function useIsActivePath(path: string) {
  const location = useLocation();
  return location.pathname.startsWith(path);
}

// Recruiter Navigation
function RecruiterNav() {
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
                isActive={useIsActivePath("/recruiter")}
                tooltip="Dashboard"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter">
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
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Quản lý tuyển dụng
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/jobs")}
                tooltip="Manage Jobs"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/jobs">
                  <Briefcase className="size-4" />
                  <span className="font-medium text-sm">Danh sách tin tuyển dụng</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/recruitment-process")}
                tooltip="Recruitment Process"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/recruitment-process">
                  <GitBranch className="size-4" />
                  <span className="font-medium text-sm">Tin tuyển dụng</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/saved-cvs")}
                tooltip="Saved CVs"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/saved-cvs">
                  <FileText className="size-4" />
                  <span className="font-medium text-sm">Danh sách CVs đã lưu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Công ty & Dịch vụ
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/company")}
                tooltip="Company"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/company">
                  <Building2 className="size-4" />
                  <span className="font-medium text-sm">Công ty</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/company/members")}
                tooltip="Company Members"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/company/members">
                  <UserPlus className="size-4" />
                  <span className="font-medium text-sm">Thành viên công ty</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/service-packages")}
                tooltip="Service Packages"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/service-packages">
                  <Package className="size-4" />
                  <span className="font-medium text-sm">Gói dịch vụ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Cá nhân
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/profile")}
                tooltip="Profile"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/profile">
                  <User className="size-4" />
                  <span className="font-medium text-sm">Hồ sơ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

// Candidate Navigation
function CandidateNav() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Tổng quan
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/candidate")}
                tooltip="Dashboard"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/candidate">
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
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Hồ sơ & CV
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/candidate/cv-management")}
                tooltip="My CV"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/candidate/cv-management">
                  <FileText className="size-4" />
                  <span className="font-medium text-sm">CV của tôi</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/candidate/it-profile")}
                tooltip="IT Profile"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/candidate/it-profile">
                  <User className="size-4" />
                  <span className="font-medium text-sm">Hồ sơ IT</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Việc làm
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/candidate/my-jobs")}
                tooltip="My Jobs"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/candidate/my-jobs">
                  <Briefcase className="size-4" />
                  <span className="font-medium text-sm">Việc làm của tôi</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/candidate/saved-jobs")}
                tooltip="Saved Jobs"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/candidate/saved-jobs">
                  <Bookmark className="size-4" />
                  <span className="font-medium text-sm">Công việc đã lưu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Cá nhân
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/profile")}
                tooltip="Profile"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/profile-cv">
                  <Settings className="size-4" />
                  <span className="font-medium text-sm">Hồ sơ cá nhân</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

// HiringManager Navigation
function HiringManagerNav() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Tổng quan
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/dashboard")}
                tooltip="Dashboard"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/dashboard">
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
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Quản lý
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/process-management")}
                tooltip="Process Management"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/process-management">
                  <GitBranch className="size-4" />
                  <span className="font-medium text-sm">Quản lý quy trình</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/recruiter/company")}
                tooltip="Company"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/recruiter/company">
                  <Building2 className="size-4" />
                  <span className="font-medium text-sm">Công ty</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator className="my-2" />

      <SidebarGroup>
        <SidebarGroupLabel className=" text-xs font-semibold text-sidebar-foreground/60">
          Cá nhân
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={useIsActivePath("/profile")}
                tooltip="Profile"
                size="default"
                className="h-9 px-3"
              >
                <Link to="/profile">
                  <User className="size-4" />
                  <span className="font-medium text-sm">Hồ sơ cá nhân</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

export function DynamicSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authState = useSelector((state: RootState) => state.authState);
  const userRole = authState.role?.toLowerCase() || 'guest';
  
  // Determine navigation component based on role
  const getNavigationComponent = () => {
    switch (userRole) {
      case 'recruiter':
        return <RecruiterNav />;
      case 'candidate':
        return <CandidateNav />;
      case 'hiringmanager':
        return <HiringManagerNav />;
      default:
        // Fallback to 404 page for unknown roles
        return (
          <div className="p-4 text-center text-red-600">
            <h2 className="text-lg font-semibold">404 - Page Not Found</h2>
            <p className="mt-2">The page you are looking for does not exist.</p>
          </div>
        );
    }
  };

  // Determine sidebar title based on role
  // const getSidebarTitle = () => {
  //   switch (userRole) {
  //     case 'admin':
  //       return 'Admin Panel';
  //     case 'recruiter':
  //       return 'Recruiter Dashboard';
  //     case 'candidate':
  //       return 'Candidate Portal';
  //     default:
  //       return 'Dashboard';
  //   }
  // };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'recruiter':
        return 'Nhà tuyển dụng';
      case 'candidate':
        return 'Ứng viên';
      case 'hiringmanager':
        return 'Quản lý tuyển dụng';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Sidebar {...props} className="border-r">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-sidebar-foreground leading-tight">
              {getRoleDisplayName()}
            </h2>
            <p className="text-[10px] text-sidebar-foreground/60 leading-tight">
              Hệ thống tuyển dụng
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 flex-1 overflow-hidden">
        {getNavigationComponent()}
      </SidebarContent>

    </Sidebar>
  );
}