import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"; // Import từ file sidebar.tsx
import { AdminHeader } from "@/components/ui/admin/AdminHeader";
import { AdminSidebarMenu } from "@/components/ui/admin/AdminSidebarMenu";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import scroll-area

export function AdminLayout() {
  // Bạn có thể lấy trạng thái sidebar (mở/đóng) từ cookie
  // hoặc cài đặt mặc định tại đây.
  // defaultOpen={true} nghĩa là sidebar mặc định mở rộng trên desktop.
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-svh w-full overflow-hidden">
        {/* Đây là Sidebar (từ file sidebar.tsx).
          Nó tự động là 'Sheet' (menu trượt) trên mobile.
          Và là sidebar cố định (có thể thu gọn) trên desktop.
        */}
        <Sidebar>
          <SidebarHeader>
            {/* Bạn có thể thêm logo/tên ở đây nếu muốn nó CHỈ ở trong sidebar */}
            {/* <h2 className="text-lg font-semibold">Admin Panel</h2> */}
          </SidebarHeader>

          {/* Bọc SidebarContent bằng ScrollArea để menu có thể cuộn 
            nếu có quá nhiều mục 
          */}
          <ScrollArea className="flex-1">
            <SidebarContent className="p-2">
              <AdminSidebarMenu />
            </SidebarContent>
          </ScrollArea>

          <SidebarFooter>
            {/* Có thể thêm thông tin người dùng hoặc nút logout ở đây */}
          </SidebarFooter>
        </Sidebar>

        {/* Đây là khu vực bên phải, chứa Header và Content
         */}
        <div className="flex flex-1 flex-col">
          {/* 1. Header ngang của chúng ta */}
          <AdminHeader />

          {/* 2. Content chính
            SidebarInset là component <main> từ file sidebar.tsx
            Chúng ta bọc nó bằng ScrollArea để nội dung trang có thể cuộn.
          */}
          <ScrollArea className="flex-1">
            <SidebarInset className="p-4 md:p-6">
              {/* Đây là nơi các trang con của bạn sẽ được render */}
              <Outlet />
            </SidebarInset>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
