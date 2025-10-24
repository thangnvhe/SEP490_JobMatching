import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  Users,
  Briefcase,
  Flag,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Import từ file sidebar của bạn

// Helper hook nhỏ để kiểm tra active link
function useIsActivePath(path: string) {
  const location = useLocation();
  return location.pathname === path;
}

export function AdminSidebarMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={useIsActivePath("/admin/dashboard")}
          // 'tooltip' sẽ tự động hiển thị khi sidebar thu gọn
          tooltip="Dashboard"
        >
          <Link to="/admin">
            <LayoutDashboard />
            {/* Văn bản này sẽ tự động ẩn khi sidebar thu gọn */}
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

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
  );
}
