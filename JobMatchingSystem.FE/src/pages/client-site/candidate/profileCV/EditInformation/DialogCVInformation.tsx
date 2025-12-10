"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserServices } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, X, User as UserIcon, ChevronDown, Camera } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";
import { User } from "@/models/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Zod schema definition
const formSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  gender: z.boolean({ required_error: "Vui lòng chọn giới tính" }),
  birthday: z.date({ required_error: "Vui lòng nhập ngày sinh" }),
});

type FormData = z.infer<typeof formSchema>;

interface DialogCVInformationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userProfileToEdit: User | null;
}

export function DialogCVInformation({
  open,
  onOpenChange,
  onSuccess,
  userProfileToEdit,
}: DialogCVInformationProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  // const [userProfile, setUserProfile] = useState<User | null>(null); // Removed local state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      gender: true,
      birthday: undefined,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = form;

  // Disable body scroll when dialog is open
  useDisableBodyScroll(open);

  // Reset form when dialog opens using passed userProfileToEdit
  useEffect(() => {
    if (open && userProfileToEdit) {
      setAvatarPreview(userProfileToEdit.avatarUrl || "");
      setAvatarFile(null);
      reset({
        fullName: userProfileToEdit.fullName || "",
        email: userProfileToEdit.email || "",
        phoneNumber: userProfileToEdit.phoneNumber || "",
        address: userProfileToEdit.address || "",
        gender: userProfileToEdit.gender !== null ? userProfileToEdit.gender : true, // Default to Male if null
        birthday: userProfileToEdit.birthday ? new Date(userProfileToEdit.birthday) : undefined,
      });
    }
  }, [open, reset, userProfileToEdit]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append("FullName", data.fullName);
      formData.append("PhoneNumber", data.phoneNumber || "");
      formData.append("Address", data.address || "");
      formData.append("Gender", String(data.gender));
      formData.append("Birthday", format(data.birthday, "yyyy-MM-dd"));
      if (avatarFile) {
        formData.append("AvatarFile", avatarFile);
      } else {
        const emptyFile = new File([""], "", { type: "application/octet-stream" });
        formData.append("AvatarFile", emptyFile);
      }
      const response = await UserServices.editUserProfile(formData);
      if (response.isSuccess) {
        toast.success("Cập nhật hồ sơ thành công");
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Cập nhật hồ sơ thất bại: " + (response.errorMessages?.[0] || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setActionLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
      <div
        className="absolute inset-0"
        onClick={() => !actionLoading && onOpenChange(false)}
      />
      <div
        ref={modalContentRef}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-lg animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Chỉnh sửa thông tin cá nhân
              </h2>
              <p className="text-sm text-muted-foreground">
                Cập nhật thông tin hồ sơ của bạn
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            disabled={actionLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2"
        >
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative group">
              <Avatar className="h-40 w-40 border-4 border-white shadow-lg ring-1 ring-gray-100">
                <AvatarImage src={avatarPreview || ""} className="object-cover" />
                <AvatarFallback className="bg-emerald-50 text-2xl font-bold text-emerald-600">
                  {userProfileToEdit?.fullName
                    ? userProfileToEdit.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                    : "VN"}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={actionLoading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Nhấn vào biểu tượng máy ảnh để thay đổi ảnh đại diện
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FullName */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("fullName")}
                  placeholder="Nhập họ và tên"
                  className={`w-full mt-1 ${errors.fullName ? "border-red-500" : ""}`}
                  disabled={actionLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email (Read only typically, but let's display) */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  {...register("email")}
                  disabled={true}
                  className="w-full mt-1 bg-gray-100 text-gray-500"
                />
              </div>

              {/* PhoneNumber */}
              <div>
                <Label className="text-sm font-medium">
                  Số điện thoại
                </Label>
                <Input
                  {...register("phoneNumber")}
                  placeholder="Nhập số điện thoại"
                  className="w-full mt-1"
                  disabled={actionLoading}
                />
              </div>

              {/* Gender */}
              <div>
                <Label className="text-sm font-medium">
                  Giới tính <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={field.value ? "true" : "false"}
                      onValueChange={(value) => field.onChange(value === "true")}
                      disabled={actionLoading}
                    >
                      <SelectTrigger className={`w-full mt-1 ${errors.gender ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Nam</SelectItem>
                        <SelectItem value="false">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Birthday */}
              <div>
                <Label className="text-sm font-medium">
                  Ngày sinh <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="birthday"
                  render={({ field }) => (
                    <Popover open={birthdayOpen} onOpenChange={setBirthdayOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                            errors.birthday && "border-red-500"
                          )}
                          disabled={actionLoading}
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày sinh</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          onSelect={(date) => {
                            field.onChange(date);
                            setBirthdayOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.birthday && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.birthday.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">
                  Địa chỉ
                </Label>
                <Input
                  {...register("address")}
                  placeholder="Nhập địa chỉ"
                  className="w-full mt-1"
                  disabled={actionLoading}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-gray-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={actionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {actionLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

