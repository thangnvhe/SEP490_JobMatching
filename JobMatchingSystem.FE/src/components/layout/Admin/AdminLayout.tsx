import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { AdminSidebar } from "@/components/ui/admin/AdminSidebar";

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-svh w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
