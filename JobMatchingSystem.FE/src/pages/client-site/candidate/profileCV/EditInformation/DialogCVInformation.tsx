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
import { CalendarIcon, X, User as UserIcon, ChevronDown, Camera, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";
import { User } from "@/models/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { VIETMAP_API_KEY } from "@/../env";

// Types
interface LocationSuggestion {
  ref_id: string;
  address: string;
  name: string;
  display: string;
  boundaries?: number[];
  categories?: string[];
}

// Zod schema definition
const formSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  email: z.string().email("Email không hợp lệ").optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (value) => {
        // Nếu không có giá trị thì cho phép (optional)
        if (!value || value.trim() === "") return true;
        // Chỉ cho phép số
        return /^\d+$/.test(value);
      },
      {
        message: "Số điện thoại chỉ được chứa số, không được chứa chữ cái hoặc ký tự đặc biệt",
      }
    )
    .refine(
      (value) => {
        // Nếu không có giá trị thì cho phép (optional)
        if (!value || value.trim() === "") return true;
        // Độ dài hợp lệ cho số điện thoại Việt Nam (10-11 số)
        return value.length >= 10 && value.length <= 11;
      },
      {
        message: "Số điện thoại phải có từ 10 đến 11 chữ số",
      }
    ),
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

  // Location autocomplete states
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocationSuggestions, setLoadingLocationSuggestions] = useState(false);
  const debouncedLocationInput = useDebounce(locationInput, 500);
  const locationInputRef = useRef<HTMLInputElement>(null);

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
      setLocationInput(userProfileToEdit.address || "");
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

  // Fetch location suggestions from Vietmap API
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (!debouncedLocationInput || debouncedLocationInput.trim().length < 2) {
        setLocationSuggestions([]);
        return;
      }

      setLoadingLocationSuggestions(true);
      try {
        const response = await fetch(
          `https://maps.vietmap.vn/api/autocomplete/v3?` +
          `apikey=${VIETMAP_API_KEY}` +
          `&text=${encodeURIComponent(debouncedLocationInput)}` +
          `&focus=16.047079,108.206230`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setLocationSuggestions(data.slice(0, 5));
          } else {
            setLocationSuggestions([]);
          }
        } else {
          console.error("Error fetching location suggestions from Vietmap");
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setLocationSuggestions([]);
      } finally {
        setLoadingLocationSuggestions(false);
      }
    };

    fetchLocationSuggestions();
  }, [debouncedLocationInput]);

  // Close location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        const suggestionDropdown = document.querySelector('.location-suggestions-dropdown');
        if (suggestionDropdown && !suggestionDropdown.contains(event.target as Node)) {
          setShowLocationSuggestions(false);
        }
      }
    };

    if (showLocationSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLocationSuggestions]);

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
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Có lỗi xảy ra khi cập nhật";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errorMessages?: string[] } } };
        errorMessage = axiosError.response?.data?.errorMessages?.[0] || errorMessage;
      }
      toast.error(errorMessage);
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
              {/* FullName & Gender */}
              <div>
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

              {/* Address */}
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">
                  Địa chỉ
                </Label>
                <div className="relative mt-1">
                  <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          ref={(e) => {
                            field.ref(e);
                            // @ts-ignore
                            locationInputRef.current = e;
                          }}
                          type="text"
                          value={locationInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLocationInput(value);
                            field.onChange(value);
                            if (value.trim().length >= 2) {
                              setShowLocationSuggestions(true);
                            } else {
                              setShowLocationSuggestions(false);
                            }
                          }}
                          onFocus={() => {
                            if (locationInput.trim().length >= 2 && locationSuggestions.length > 0) {
                              setShowLocationSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow clicking on a suggestion
                            setTimeout(() => {
                              setShowLocationSuggestions(false);
                            }, 200);
                          }}
                          placeholder="VD: Đường Lê Duẩn, Quận 1, TP.HCM..."
                          className={cn("pl-10", errors.address && "border-red-500")}
                          disabled={actionLoading}
                        />
                        {loadingLocationSuggestions && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                        )}
                      </div>
                    )}
                  />

                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="location-suggestions-dropdown absolute z-[50] w-full mt-1 bg-white border rounded-lg shadow-lg max-h-44 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.ref_id || index}
                          onClick={() => {
                            const address = suggestion.display || suggestion.address;
                            setLocationInput(address);
                            form.setValue("address", address);
                            setShowLocationSuggestions(false);
                            setLocationSuggestions([]);
                          }}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-start gap-2"
                        >
                          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0 text-left">
                            {suggestion.name && suggestion.name !== suggestion.address && (
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.name}
                              </p>
                            )}
                            <p className={`text-sm text-gray-600 ${suggestion.name ? 'text-xs' : ''}`}>
                              {suggestion.display || suggestion.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showLocationSuggestions && 
                   locationInput.trim().length >= 2 && 
                   !loadingLocationSuggestions && 
                   locationSuggestions.length === 0 && (
                    <div className="location-suggestions-dropdown absolute z-[50] w-full mt-1 bg-white border rounded-lg shadow-lg">
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        Không tìm thấy địa chỉ phù hợp
                      </div>
                    </div>
                  )}
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Tìm kiếm địa chỉ theo Vietmap - Nhập tối thiểu 2 ký tự
                </p>
              </div>

              {/* PhoneNumber & Birthday */}
              <div>
                <Label className="text-sm font-medium">
                  Số điện thoại
                </Label>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      className={`w-full mt-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
                      disabled={actionLoading}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

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

              {/* Email */}
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

