import { Outlet, useLocation } from "react-router-dom";
import { ClientHeader } from "@/components/layout/Client/client-header";
import { ClientFooter } from "@/components/layout/Client/client-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DynamicSidebar } from "@/components/ui/DynamicSidebar";

export function ClientLayout() {
  const location = useLocation();
  // Các màn muốn bật sidebar cho client
  const SIDEBAR_ENABLED_PATHS = [
    "/profile",
  ];
  const showSidebar = SIDEBAR_ENABLED_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="flex min-h-screen flex-col">
      <ClientHeader />
      {showSidebar ? (
        <SidebarProvider defaultOpen={true} className="flex-1">
          <div className="flex h-full w-full overflow-hidden">
            <DynamicSidebar className="top-16" />
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
