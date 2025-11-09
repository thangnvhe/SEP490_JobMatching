import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import type { RootState } from "@/store";
import { loginAsync, clearError } from "@/store/slices/authSlice";
import { toast } from "sonner";

// Zod validation schema với messages tiếng Việt
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email là bắt buộc' })
    .email({ message: 'Email sai định dạng username@domain.tld' }),
  password: z
    .string()
    .min(1, { message: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  rememberMe: z.boolean().optional(),
});

// Type inference từ schema
type LoginFormData = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRegister?: () => void;
  onOpenForgotPassword?: () => void;
}

export function LoginDialog({
  isOpen,
  onOpenChange,
  onOpenRegister,
  onOpenForgotPassword
}: LoginDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  // Reset form khi dialog đóng/mở
  useEffect(() => {
    if (!isOpen) {
      reset();
      dispatch(clearError());
    }
  }, [isOpen, dispatch, reset]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginAsync({
        email: data.email.trim(),
        password: data.password,
        rememberMe: data.rememberMe || false
      })).unwrap();
      toast.success("Đăng nhập thành công!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Đăng nhập thất bại!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold text-center">
              Login to Superio
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Email"
                {...register("email")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  {...register("rememberMe")}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-gray-600 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  onOpenChange(false);
                  onOpenForgotPassword?.();
                }}
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Log In"}
            </Button>
          </form>
        </div>

        <div className="px-6 pb-6 pt-3">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                Log In via Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Log In via Gmail
              </Button>
            </div>

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  onOpenChange(false);
                  onOpenRegister?.();
                }}
              >
                Signup
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
