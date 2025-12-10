"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CVCertificateServices } from "@/services/cv-certificate.service";
import type { CVCertificate } from "@/models/cv-certificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, X, BadgeCheck, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";

// Zod schema definition
const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên chứng chỉ"),
  organization: z.string().min(1, "Vui lòng nhập tổ chức"),
  certificateAt: z.date({ required_error: "Vui lòng nhập thời gian" }),
  link: z.string().url("Vui lòng nhập đúng định dạng link").optional().or(z.literal("")),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DialogCVCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  certificateToEdit?: CVCertificate | null;
}

export function DialogCVCertificate({
  open,
  onOpenChange,
  onSuccess,
  certificateToEdit,
}: DialogCVCertificateProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [certificateAtOpen, setCertificateAtOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organization: "",
      link: "",
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
      if (certificateToEdit) {
        reset({
          name: certificateToEdit.name,
          organization: certificateToEdit.organization,
          link: certificateToEdit.link || "",
          description: certificateToEdit.description || "",
          certificateAt: new Date(certificateToEdit.certificateAt),
        });
      } else {
        reset({
          name: "",
          organization: "",
          link: "",
          description: "",
          certificateAt: undefined,
        });
      }
    }
  }, [open, certificateToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setActionLoading(true);

      // Format data for API
      const submitData = {
        ...data,
        certificateAt: format(data.certificateAt, "yyyy-MM-dd"), // Convert Date to string
        link: data.link || "",
        description: data.description || "",
      };

      if (certificateToEdit?.id) {
        await CVCertificateServices.update(certificateToEdit.id.toString(), submitData);
        toast.success("Cập nhật chứng chỉ thành công");
      } else {
        await CVCertificateServices.create(submitData);
        toast.success("Thêm chứng chỉ thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(certificateToEdit ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới");
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
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {certificateToEdit ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {certificateToEdit 
                  ? "Cập nhật thông tin chứng chỉ của bạn" 
                  : "Nhập thông tin chứng chỉ bạn đã đạt được"}
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
            {/* Name field */}
            <div>
              <Label className="text-sm font-medium">
                Tên chứng chỉ <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name")}
                placeholder="Ví dụ: Chứng chỉ AWS..."
                className={`w-full mt-1 ${errors.name ? "border-red-500" : ""}`}
                disabled={actionLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization field */}
              <div>
                <Label className="text-sm font-medium">
                  Tổ chức <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("organization")}
                  placeholder="Tên tổ chức cấp"
                  className={`w-full mt-1 ${
                    errors.organization ? "border-red-500" : ""
                  }`}
                  disabled={actionLoading}
                />
                {errors.organization && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.organization.message}
                  </p>
                )}
              </div>

              {/* Date field */}
              <div>
                <Label className="text-sm font-medium">
                  Thời gian <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="certificateAt"
                  render={({ field }) => (
                    <Popover open={certificateAtOpen} onOpenChange={setCertificateAtOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal mt-1",
                            !field.value && "text-muted-foreground",
                            errors.certificateAt && "border-red-500"
                          )}
                          disabled={actionLoading}
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn thời gian</span>
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
                            setCertificateAtOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.certificateAt && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.certificateAt.message}
                  </p>
                )}
              </div>
            </div>

             {/* Link field */}
             <div>
              <Label className="text-sm font-medium">
                Đường dẫn chứng chỉ
              </Label>
              <Input
                {...register("link")}
                placeholder="https://..."
                className={`w-full mt-1 ${errors.link ? "border-red-500" : ""}`}
                disabled={actionLoading}
              />
              {errors.link && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.link.message}
                </p>
              )}
            </div>

            {/* Description field */}
            <div>
              <Label className="text-sm font-medium">Mô tả</Label>
              <Textarea
                {...register("description")}
                placeholder="Mô tả chi tiết về chứng chỉ..."
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
            {actionLoading ? "Đang lưu..." : "Lưu chứng chỉ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

