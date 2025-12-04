import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/models/user";
import { UserServices } from "@/services/user.service";
import { toast } from "sonner";
import { Camera, Loader2, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const editUserSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ và tên")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được vượt quá 100 ký tự")
    .regex(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/,
      "Họ và tên chỉ được chứa chữ cái và dấu cách"
    ),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng"
    )
    .max(255, "Email không được vượt quá 255 ký tự"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const cleaned = val.replace(/\s/g, "");
        // Số điện thoại Việt Nam: 0xxxxxxxxx (10 số) hoặc +84xxxxxxxxx (9 số sau +84)
        return /^(0[0-9]{9}|\+84[0-9]{9})$/.test(cleaned);
      },
      {
        message:
          "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 0 hoặc +84)",
      }
    ),
  address: z
    .string()
    .optional()
    .refine((val) => !val || val.trim() === "" || val.length <= 255, {
      message: "Địa chỉ không được vượt quá 255 ký tự",
    }),
  gender: z.string().optional(),
  birthday: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^\d{4}-\d{2}-\d{2}$/.test(val),
      {
        message: "Ngày sinh không đúng định dạng",
      }
    ),
  score: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^\d+(\.\d{1,2})?$/.test(val),
      {
        message: "Điểm phải là số hợp lệ",
      }
    )
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Điểm phải trong khoảng từ 0 đến 100",
      }
    ),
  isActive: z.string(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdateSuccess: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [birthdayPickerOpen, setBirthdayPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      gender: "",
      birthday: "",
      score: "",
      isActive: "true",
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        gender: user.gender === null ? "" : user.gender ? "true" : "false",
        birthday:
          user.birthday && user.birthday !== "0001-01-01T00:00:00"
            ? user.birthday.split("T")[0]
            : "",
        score: user.score?.toString() || "",
        isActive: user.isActive ? "true" : "false",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [user, isOpen, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("fullName", data.fullName.trim());
      payload.append("email", data.email.trim());
      payload.append("phoneNumber", data.phoneNumber?.trim() || "");
      payload.append("address", data.address?.trim() || "");

      if (data.gender) {
        payload.append("gender", data.gender);
      }

      if (data.birthday) {
        payload.append("birthday", data.birthday);
      }

      if (data.score) {
        payload.append("score", data.score);
      }

      payload.append("isActive", data.isActive);

      if (avatarFile) {
        payload.append("avatarFile", avatarFile);
      }

      await UserServices.update(user.id.toString(), payload);
      toast.success("Cập nhật người dùng thành công");
      onUpdateSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Cập nhật người dùng thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (fullName: string | null | undefined): string => {
    if (!fullName || !fullName.trim()) return "?";
    return fullName.trim().charAt(0).toUpperCase();
  };

  const getAvatarDisplay = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatarUrl) return user.avatarUrl;
    return null;
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
            >
              {getAvatarDisplay() ? (
                <img
                  src={getAvatarDisplay()!}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-primary">
                    {getInitials(user.fullName)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Nhập họ và tên"
                className={cn("w-full", errors.fullName && "border-red-500")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                {...register("email")}
                placeholder="Nhập email"
                className={cn("w-full", errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="Nhập số điện thoại"
                className={cn("w-full", errors.phoneNumber && "border-red-500")}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Nhập địa chỉ"
                className={cn("w-full", errors.address && "border-red-500")}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Nam</SelectItem>
                  <SelectItem value="false">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="birthday">Ngày sinh</Label>
              <Popover
                open={birthdayPickerOpen}
                onOpenChange={setBirthdayPickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-between font-normal",
                      !watch("birthday") && "text-muted-foreground",
                      errors.birthday && "border-red-500"
                    )}
                  >
                    {watch("birthday") ? (
                      format(new Date(watch("birthday")!), "dd/MM/yyyy")
                    ) : (
                      <span>Chọn ngày sinh</span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      watch("birthday")
                        ? new Date(watch("birthday")!)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setValue("birthday", format(date, "yyyy-MM-dd"));
                        setBirthdayPickerOpen(false);
                      } else {
                        setValue("birthday", "");
                      }
                    }}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.birthday && (
                <p className="text-sm text-red-500">
                  {errors.birthday.message}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="score">Điểm đánh giá</Label>
              <Input
                id="score"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("score")}
                placeholder="Nhập điểm (0-100)"
                className={cn("w-full", errors.score && "border-red-500")}
              />
              {errors.score && (
                <p className="text-sm text-red-500">{errors.score.message}</p>
              )}
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={watch("isActive")}
                onValueChange={(value) => setValue("isActive", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
