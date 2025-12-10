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
    .max(100, { message: 'Email không được vượt quá 100 ký tự' })
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
  onLoginSuccess?: () => void;
}

export function LoginDialog({
  isOpen,
  onOpenChange,
  onOpenRegister,
  onOpenForgotPassword,
  onLoginSuccess
}: LoginDialogProps) {
  const dispatch = useAppDispatch();
  const { loading: isLoading } = useSelector((state: RootState) => state.authState);

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
      onLoginSuccess?.(); // Call success callback if provided
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
              Đăng nhập
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
               Mật khẩu
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
                  Ghi nhớ đăng nhập
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
                Quên mật khẩu?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </div>

        <div className="px-6 pb-6 pt-3">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Bạn chưa có tài khoản?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  onOpenChange(false);
                  onOpenRegister?.();
                }}
              >
                Đăng ký ngay
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
