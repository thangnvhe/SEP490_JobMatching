import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Bookmark,
  MessageSquare,
  Calendar,
  Settings,
  BarChart3,
  Bell,
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

function CandidateNav() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={useIsActivePath("/candidate/dashboard")}
            tooltip="Dashboard"
          >
            <Link to="/candidate/dashboard">
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

const dummyUser = {
  name: "John Candidate",
  email: "john@example.com",
  avatar: "https://i.pravatar.cc/150?u=candidate",
};

export function CandidateSidebar({
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
                <span className="text-base font-semibold">Candidate Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <ScrollArea className="flex-1">
        <SidebarContent className="p-0">
          <CandidateNav />
        </SidebarContent>
      </ScrollArea>

      <SidebarFooter>
        <NavUser user={dummyUser} />
      </SidebarFooter>
    </Sidebar>
  );
}