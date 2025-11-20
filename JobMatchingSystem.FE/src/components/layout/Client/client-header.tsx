import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mountain, User, LogOut } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";
import { RegisterDialog } from "@/pages/client-site/auth/RegisterDialog";
import { ForgotPasswordDialog } from "@/pages/client-site/auth/ForgotPasswordDialog";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import type { RootState } from "@/store";
import { logoutAsync } from "@/store/slices/authSlice";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClientHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading: isLoading } = useSelector((state: RootState) => state.authState);
  
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Đăng xuất thành công!");
      // Chuyển về homepage sau khi logout thành công
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-6 hidden md:flex">
          <Link to="/" className="mr-8 flex items-center space-x-2">
            <Mountain className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Superio</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary focus:text-primary outline-none px-3 py-2 rounded-md hover:bg-accent"
            >
              Trang Chủ
            </Link>
            <Link 
              to="/jobs" 
              className="text-sm font-medium transition-colors hover:text-primary focus:text-primary outline-none px-3 py-2 rounded-md hover:bg-accent"
            >
              Tìm Kiếm Công Việc
            </Link>
            <Link 
              to="/companies" 
              className="text-sm font-medium transition-colors hover:text-primary focus:text-primary outline-none px-3 py-2 rounded-md hover:bg-accent"
            >
              Danh Sách Công Ty
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/contact-recruiter" 
                className="text-sm font-medium transition-colors hover:text-primary focus:text-primary outline-none px-3 py-2 rounded-md hover:bg-accent"
              >
                Nhà tuyển dụng
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here if needed */}
          </div>
          <nav className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoading ? "Đang đăng xuất..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => setLoginOpen(true)}
              >
                Login / Register
              </Button>
            )}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <Link to="/" className="mb-6 flex items-center space-x-2">
              <Mountain className="h-6 w-6" />
              <span className="font-bold">Superio</span>
            </Link>
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Trang Chủ
              </Link>
              <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">
                Tìm Kiếm Công Việc
              </Link>
              <Link to="/companies" className="text-sm font-medium transition-colors hover:text-primary">
                Danh Sách Công Ty
              </Link>
              {!isAuthenticated && (
                <Link to="/contact-recruiter" className="text-sm font-medium transition-colors hover:text-primary">
                  Nhà tuyển dụng
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-fit text-sm"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng xuất..." : "Logout"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-fit text-sm"
                  onClick={() => setLoginOpen(true)}
                >
                  Login / Register
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <LoginDialog
          isOpen={loginOpen}
          onOpenChange={setLoginOpen}
          onOpenRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
          onOpenForgotPassword={() => {
            setLoginOpen(false);
            setForgotPasswordOpen(true);
          }}
        />
        <RegisterDialog
          isOpen={registerOpen}
          onOpenChange={setRegisterOpen}
          onOpenLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
        />
        <ForgotPasswordDialog
          isOpen={forgotPasswordOpen}
          onOpenChange={setForgotPasswordOpen}
          onOpenLogin={() => {
            setForgotPasswordOpen(false);
            setLoginOpen(true);
          }}
        />
      </div>
    </header>
  );
}


