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
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavUser } from "@/components/nav-user";
import React from "react";

function useIsActivePath(path: string) {
  const location = useLocation();
  return location.pathname.startsWith(path);
}

// Recruiter Navigation
function RecruiterNav() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter")}
            tooltip="Dashboard"
          >
            <Link to="/recruiter">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/jobs")}
            tooltip="Manage Jobs"
          >
            <Link to="/recruiter/jobs">
              <Briefcase />
              <span>Tin tuyển dụng</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/saved-cvs")}
            tooltip="Saved CVs"
          >
            <Link to="/recruiter/saved-cvs">
              <FileText />
              <span>Danh sách CVs đã lưu</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/service-packages")}
            tooltip="Service Packages"
          >
            <Link to="/recruiter/service-packages">
              <Package />
              <span>Gói dịch vụ</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/company")}
            tooltip="Company"
          >
            <Link to="/recruiter/company">
              <Building2 />
              <span>Công ty</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/company/members")}
            tooltip="Company Members"
          >
            <Link to="/recruiter/company/members">
              <UserPlus />
              <span>Thành viên công ty</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/profile")}
            tooltip="Profile"
          >
            <Link to="/profile">
              <User />
              <span>Hồ sơ</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

// Candidate Navigation
function CandidateNav() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate")}
            tooltip="Dashboard"
          >
            <Link to="/candidate">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/cv-management")}
            tooltip="My CV"
          >
            <Link to="/candidate/cv-management">
              <FileText />
              <span>CV của tôi</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/it-profile")}
            tooltip="IT Profile"
          >
            <Link to="/candidate/it-profile">
              <User />
              <span>Hồ sơ IT</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/my-jobs")}
            tooltip="My Jobs"
          >
            <Link to="/candidate/my-jobs">
              <Briefcase />
              <span>Việc làm của tôi</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/saved-jobs")}
            tooltip="Saved Jobs"
          >
            <Link to="/candidate/saved-jobs">
              <Bookmark />
              <span>Công việc đã lưu</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/profile")}
            tooltip="Profile"
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

// HiringManager Navigation
function HiringManagerNav() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/dashboard")}
            tooltip="Dashboard"
          >
            <Link to="/recruiter/dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/process-management")}
            tooltip="Process Management"
          >
            <Link to="/recruiter/process-management">
              <GitBranch />
              <span>Quản lý quy trình</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/company")}
            tooltip="Company"
          >
            <Link to="/recruiter/company">
              <Building2 />
              <span>Công ty</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/profile")}
            tooltip="Profile"
          >
            <Link to="/profile">
              <User />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
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

  // Get user info for NavUser component
  const getUserInfo = () => {
    if (authState.isAuthenticated && authState.name) {
      return {
        name: authState.name,
        email: authState.name || 'user@example.com', // fallback if email not in token
        avatar: `https://i.pravatar.cc/150?u=${authState.name}`,
      };
    }
    
    // Fallback user info
    return {
      name: 'User',
      email: 'user@example.com',
      avatar: 'https://i.pravatar.cc/150?u=default',
    };
  };

  return (
    <Sidebar {...props}>


      <ScrollArea className="flex-1">
        <SidebarContent className="p-0">
          {getNavigationComponent()}
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter>
        <NavUser user={getUserInfo()} />
      </SidebarFooter>
    </Sidebar>
  );
}