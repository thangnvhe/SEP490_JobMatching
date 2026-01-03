"use client";

import { useState, useEffect } from "react";
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
import { CalendarIcon, Camera, Loader2, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { User } from "@/models/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Zod schema definition
const formSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  gender: z.boolean({ required_error: "Vui lòng chọn giới tính" }),
  birthday: z
    .date({ required_error: "Vui lòng nhập ngày sinh" })
    .refine(
      (date) => {
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 18);
        return date <= minDate;
      },
      {
        message: "Người dùng phải từ 18 tuổi trở lên",
      }
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function HiringManagerProfile() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [birthdayOpen, setBirthdayOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
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

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await UserServices.getUserProfile();
        if (response.isSuccess && response.result) {
          const user = response.result;
          setUserProfile(user);
          setAvatarPreview(user.avatarUrl || "");
          reset({
            fullName: user.fullName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
            gender: user.gender !== null ? user.gender : true,
            birthday: user.birthday ? new Date(user.birthday) : undefined,
          });
        } else {
          toast.error("Không thể tải thông tin hồ sơ");
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [reset]);

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
        // Reload user profile
        const updatedResponse = await UserServices.getUserProfile();
        if (updatedResponse.isSuccess && updatedResponse.result) {
          const updatedUser = updatedResponse.result;
          setUserProfile(updatedUser);
          setAvatarPreview(updatedUser.avatarUrl || "");
          setAvatarFile(null);
        }
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

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải thông tin hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-emerald-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin hồ sơ của bạn
        </p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-1 ring-gray-100">
                  <AvatarImage src={avatarPreview || ""} className="object-cover" />
                  <AvatarFallback className="bg-emerald-50 text-xl font-bold text-emerald-600">
                    {userProfile?.fullName
                      ? userProfile.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "HM"}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors"
                >
                  <Camera className="h-5 w-5" />
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

                {/* Email (Read only) */}
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    {...register("email")}
                    disabled={true}
                    className="w-full mt-1 bg-gray-100 text-gray-500"
                  />
                </div>

                {/* PhoneNumber */}
                <div>
                  <Label className="text-sm font-medium">Số điện thoại</Label>
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
                            type="button"
                          >
                            <div className="flex items-center">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Chọn ngày sinh</span>
                              )}
                            </div>
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
                            disabled={(date) => {
                              const today = new Date();
                              const minDate = new Date();
                              minDate.setFullYear(today.getFullYear() - 18);
                              return date > minDate || date < new Date("1900-01-01");
                            }}
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
                  <Label className="text-sm font-medium">Địa chỉ</Label>
                  <Input
                    {...register("address")}
                    placeholder="Nhập địa chỉ"
                    className="w-full mt-1"
                    disabled={actionLoading}
                  />
                </div>
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-6 border-t">
            <Button
              type="submit"
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

