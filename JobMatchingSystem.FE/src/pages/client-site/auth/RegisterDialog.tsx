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
  const { loading: isLoading, error } = useSelector((state: RootState) => state.auth);

  // Zod schema theo pattern LoginDialog với message tiếng Việt
  const registerSchema = z.object({
    firstName: z
      .string()
      .min(1, { message: "Họ là bắt buộc" }),
    lastName: z
      .string()
      .min(1, { message: "Tên là bắt buộc" }),
    username: z
      .string()
      .min(3, { message: "Username phải có ít nhất 3 ký tự" })
      .max(30, { message: "Username tối đa 30 ký tự" })
      .regex(/^[A-Za-z][A-Za-z0-9._]*$/, {
        message: "Username bắt đầu bằng chữ và chỉ gồm chữ, số, ., _",
      }),
    email: z
      .string()
      .min(1, { message: "Email là bắt buộc" })
      .email({ message: "Email sai định dạng username@domain.tld" }),
    password: z
      .string()
      .min(1, { message: "Mật khẩu là bắt buộc" })
      .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
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
      firstName: "",
      lastName: "",
      username: "",
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
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      })).unwrap();
      toast.success("Đăng ký thành công!");
      onOpenChange(false);
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
              Create Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  {...register("firstName")}
                  className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  {...register("lastName")}
                  className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                {...register("username")}
                className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.username ? "border-red-500" : ""
                }`}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
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
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
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
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
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
              {isLoading ? "Đang đăng ký..." : "Create Account"}
            </Button>
          </form>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center space-y-4">
    

            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  onOpenChange(false);
                  onOpenLogin?.();
                }}
              >
                Log In
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
