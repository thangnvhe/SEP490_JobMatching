import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import type { RootState } from "@/store";
import { clearError, registerAsync } from "@/store/slices/authSlice";
import { toast } from "sonner";

interface RegisterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin?: () => void;
}

export function RegisterDialog({ isOpen, onOpenChange, onOpenLogin }: RegisterDialogProps) {
  const dispatch = useAppDispatch();
  const { loading: isLoading, error } = useSelector((state: RootState) => state.authState);

  // Zod schema chỉ giữ các trường cần thiết
  const registerSchema = z.object({
    fullName: z
      .string()
      .min(1, { message: "Họ tên là bắt buộc" })
      .max(100, { message: "Họ tên tối đa 100 ký tự" }),
    email: z
      .string()
      .min(1, { message: "Email là bắt buộc" })
      .email({ message: "Email sai định dạng username@domain.tld" }),
    password: z
      .string()
      .min(1, { message: "Mật khẩu là bắt buộc" })
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
        message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  }).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  // Reset form khi dialog đóng/mở
  useEffect(() => {
    if (!isOpen) {
      reset();
      dispatch(clearError());
    }
  }, [isOpen, dispatch, reset]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle submit theo pattern LoginDialog
  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerAsync({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      })).unwrap();
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.", {
        duration: 5000,
      });
      // Delay một chút để user có thể thấy toast trước khi dialog đóng
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (_) {
      toast.error("Đăng ký thất bại!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">
              Tạo tài khoản mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Họ và tên"
                {...register("fullName")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.fullName ? "border-red-500" : ""
                }`}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
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
                placeholder="Mật khẩu"
                {...register("password")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                {...register("confirmPassword")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center space-y-4">
    

            <p className="text-sm text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Button
                variant="link"
                className="p-2 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  onOpenChange(false);
                  onOpenLogin?.();
                }}
              >
                Đăng nhập ngay
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
