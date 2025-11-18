import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { ClientHeader } from "@/components/layout/Client/client-header";
import { ClientFooter } from "@/components/layout/Client/client-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DynamicSidebar } from "@/components/ui/DynamicSidebar";
import { AdminSidebar } from "@/components/ui/admin/AdminSidebar";

export function ClientLayout() {
  const location = useLocation();
  const authState = useSelector((state: RootState) => state.authState);
  
  // Get user role from Redux store
  const userRole = authState.role?.toLowerCase() || 'guest';
  
  // Các màn muốn bật sidebar cho client
  const SIDEBAR_ENABLED_PATHS = [
    "/profile",
    "/admin",
  ];
  const showSidebar = SIDEBAR_ENABLED_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  // Determine which sidebar to use based on role
  const getSidebarComponent = () => {
    if (userRole === 'admin') {
      return <AdminSidebar className="top-16" />;
    }
    return <DynamicSidebar className="top-16" />;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ClientHeader />
      {showSidebar ? (
        <SidebarProvider defaultOpen={true} className="flex-1">
          <div className="flex h-full w-full overflow-hidden">
            {getSidebarComponent()}
            <SidebarInset className="flex-1 overflow-y-auto">
              <Outlet />
            </SidebarInset>
          </div>
        </SidebarProvider>
      ) : (
        <main className="flex-1">
          <Outlet />
        </main>
      )}
      {!showSidebar && <ClientFooter />}
    </div>
  );
}
