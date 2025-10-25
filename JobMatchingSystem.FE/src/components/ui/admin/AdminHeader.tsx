import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react"; // Bạn có thể thay Briefcase bằng icon web của bạn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import từ file sidebar của bạn

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      {/* --- Phần bên trái --- */}
      <div className="flex items-center gap-4">
        {/* Nút này sẽ tự động:
          - Mở/đóng Sheet trên mobile
          - Thu gọn/mở rộng sidebar trên desktop
          Nhờ vào 'SidebarProvider' mà chúng ta sẽ dùng ở layout 
        */}
        <SidebarTrigger />

        {/* Icon và Tên Web */}
        <Link to="/admin" className="flex items-center gap-2">
          <Briefcase className="size-6" />
          <span className="text-lg font-semibold">JobMatching</span>
        </Link>

        {/* Các link điều hướng chính - ẩn trên mobile */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Trang chủ
          </Link>
          <Link
            to="/about"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            About
          </Link>
          <Link
            to="/blog"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Blog
          </Link>
        </nav>
      </div>

      {/* --- Phần bên phải --- */}
      <div className="flex items-center gap-4">
        {/* Nút Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-8 rounded-full">
              <Avatar className="size-8">
                {/* Thay src bằng ảnh avatar của admin */}
                <AvatarImage src="/img/placeholder-user.jpg" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@jobmatching.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
