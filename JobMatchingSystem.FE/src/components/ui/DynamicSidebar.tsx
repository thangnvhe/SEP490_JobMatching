import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  User,
  Search,
  FileText,
  Bookmark,
  MessageSquare,
  Calendar,
  Settings,
  Bell,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
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
              <span>Job Postings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/candidates")}
            tooltip="Candidates"
          >
            <Link to="/recruiter/candidates">
              <Users />
              <span>Candidates</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/interviews")}
            tooltip="Interviews"
          >
            <Link to="/recruiter/interviews">
              <Calendar />
              <span>Interviews</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/analytics")}
            tooltip="Analytics"
          >
            <Link to="/recruiter/analytics">
              <BarChart3 />
              <span>Analytics</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel className="mt-4">Communication</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/messages")}
            tooltip="Messages"
          >
            <Link to="/recruiter/messages">
              <MessageSquare />
              <span>Messages</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/reports")}
            tooltip="Reports"
          >
            <Link to="/recruiter/reports">
              <FileText />
              <span>Reports</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/company")}
            tooltip="Company Profile"
          >
            <Link to="/recruiter/company">
              <Building2 />
              <span>Company</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/recruiter/settings")}
            tooltip="Settings"
          >
            <Link to="/recruiter/settings">
              <Settings />
              <span>Settings</span>
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
            isActive={useIsActivePath("/candidate/job-search")}
            tooltip="Job Search"
          >
            <Link to="/candidate/job-search">
              <Search />
              <span>Job Search</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/applications")}
            tooltip="My Applications"
          >
            <Link to="/candidate/applications">
              <FileText />
              <span>Applications</span>
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
              <span>Saved Jobs</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/interviews")}
            tooltip="Interviews"
          >
            <Link to="/candidate/interviews">
              <Calendar />
              <span>Interviews</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/analytics")}
            tooltip="Analytics"
          >
            <Link to="/candidate/analytics">
              <BarChart3 />
              <span>Analytics</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroupLabel className="mt-4">Profile & Communication</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/profile")}
            tooltip="My Profile"
          >
            <Link to="/candidate/profile">
              <User />
              <span>My Profile</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/messages")}
            tooltip="Messages"
          >
            <Link to="/candidate/messages">
              <MessageSquare />
              <span>Messages</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/notifications")}
            tooltip="Notifications"
          >
            <Link to="/candidate/notifications">
              <Bell />
              <span>Notifications</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/settings")}
            tooltip="Settings"
          >
            <Link to="/candidate/settings">
              <Settings />
              <span>Settings</span>
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