"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CVEducationServices } from "@/services/cv-education.service";
import { type CVEducation } from "@/models/cv-education";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, X, GraduationCap, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";

// Zod schema definition
const formSchema = z.object({
  schoolName: z.string().min(1, "Vui lòng nhập tên trường"),
  educationLevelId: z.number({
    required_error: "Vui lòng chọn trình độ học vấn",
  }).min(1).max(6),
  major: z.string().min(1, "Vui lòng nhập chuyên ngành"),
  startDate: z.date({ required_error: "Vui lòng nhập ngày bắt đầu" }),
  endDate: z.date({ required_error: "Vui lòng nhập ngày kết thúc" }),
  description: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
});

type FormData = z.infer<typeof formSchema>;

interface DialogCVEducationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  educationToEdit?: CVEducation | null;
}

const EDUCATION_LEVEL_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Cao đẳng" },
  { value: 2, label: "Đại học" },
  { value: 3, label: "Kỹ sư" },
  { value: 4, label: "Cử nhân" },
  { value: 5, label: "Thạc sĩ" },
  { value: 6, label: "Tiến sĩ" },
];

export function DialogCVEducation({
  open,
  onOpenChange,
  onSuccess,
  educationToEdit,
}: DialogCVEducationProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
      educationLevelId: 2, // Đại học
      major: "",
      description: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = form;

  // Disable body scroll when dialog is open
  useDisableBodyScroll(open);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      isInitialMount.current = true;
      if (educationToEdit) {
        reset({
          schoolName: educationToEdit.schoolName,
          educationLevelId: educationToEdit.educationLevelId || 2,
          major: educationToEdit.major,
          description: educationToEdit.description || "",
          startDate: new Date(educationToEdit.startDate),
          endDate: new Date(educationToEdit.endDate),
        });
      } else {
        reset({
          schoolName: "",
          educationLevelId: 2, // Đại học
          major: "",
          description: "",
          startDate: undefined,
          endDate: undefined,
        });
      }
      setTimeout(() => {
        isInitialMount.current = false;
      }, 100);
    }
  }, [open, educationToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setActionLoading(true);

      // Format data for API
      const submitData = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"), // Convert Date to string
        endDate: format(data.endDate, "yyyy-MM-dd"), // Convert Date to string
        description: data.description || "",
      };

      if (educationToEdit?.id) {
        await CVEducationServices.update(educationToEdit.id.toString(), submitData);
        toast.success("Cập nhật học vấn thành công");
      } else {
        await CVEducationServices.create(submitData);
        toast.success("Thêm học vấn thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(educationToEdit ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới");
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
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {educationToEdit ? "Cập nhật học vấn" : "Thêm học vấn"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {educationToEdit 
                  ? "Cập nhật thông tin học vấn của bạn" 
                  : "Nhập thông tin quá trình học tập của bạn"}
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

        {/* Body - Scrollable */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2"
        >
          <div className="grid gap-4">
            {/* School Name field */}
            <div>
              <Label className="text-sm font-medium">
                Tên trường <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("schoolName")}
                placeholder="Ví dụ: Đại học FPT..."
                className={`w-full mt-1 ${errors.schoolName ? "border-red-500" : ""}`}
                disabled={actionLoading}
              />
              {errors.schoolName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.schoolName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Education Level field */}
               <div>
                <Label className="text-sm font-medium">
                  Trình độ học vấn <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="educationLevelId"
                  render={({ field }) => {
                    const selectValue = field.value !== undefined && field.value !== null 
                      ? field.value.toString() 
                      : "";
                    
                    return (
                      <Select
                        value={selectValue}
                        onValueChange={(value) => {
                          // Bỏ qua nếu đang trong quá trình initial mount
                          if (isInitialMount.current) {
                            return;
                          }
                          
                          // Chỉ update nếu giá trị không rỗng và hợp lệ
                          if (value && value.trim() !== "") {
                            const numValue = Number(value);
                            const isValidValue = EDUCATION_LEVEL_OPTIONS.some(opt => opt.value === numValue);
                            if (isValidValue) {
                              field.onChange(numValue);
                            }
                          }
                        }}
                        disabled={actionLoading}
                      >
                        <SelectTrigger className={`w-full mt-1 ${errors.educationLevelId ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Chọn trình độ học vấn" />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVEL_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.educationLevelId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.educationLevelId.message}
                  </p>
                )}
              </div>

              {/* Major field */}
              <div>
                <Label className="text-sm font-medium">
                  Chuyên ngành <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("major")}
                  placeholder="Ví dụ: Công nghệ thông tin..."
                  className={`w-full mt-1 ${errors.major ? "border-red-500" : ""}`}
                  disabled={actionLoading}
                />
                {errors.major && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.major.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date field */}
              <div>
                <Label className="text-sm font-medium">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                            errors.startDate && "border-red-500"
                          )}
                          disabled={actionLoading}
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
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
                            setStartDateOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* End Date field */}
              <div>
                <Label className="text-sm font-medium">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                            errors.endDate && "border-red-500"
                          )}
                          disabled={actionLoading}
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
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
                          toYear={new Date().getFullYear() + 10}
                          onSelect={(date) => {
                            field.onChange(date);
                            setEndDateOpen(false);
                          }}
                          disabled={(date) =>
                             date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description field */}
            <div>
              <Label className="text-sm font-medium">Mô tả</Label>
              <Textarea
                {...register("description")}
                placeholder="Mô tả chi tiết quá trình học, thành tích..."
                className="w-full mt-1 resize-none min-h-[120px]"
                disabled={actionLoading}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">
                  {watch("description")?.length || 0} ký tự
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer - Submit buttons */}
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
            {actionLoading ? "Đang lưu..." : "Lưu học vấn"}
          </Button>
        </div>
      </div>
    </div>
  );
}

