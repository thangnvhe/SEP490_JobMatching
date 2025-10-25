import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { CandidateSidebar } from "@/components/ui/candidate/CandidateSidebar";

export function CandidateLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-svh w-full overflow-hidden">
        <CandidateSidebar />
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