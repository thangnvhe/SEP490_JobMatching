import { Outlet } from "react-router-dom";
import { ClientHeader } from "@/components/layout/Client/client-header";
import { ClientFooter } from "@/components/layout/Client/client-footer";

export function ClientLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ClientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}
