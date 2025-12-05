"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CVProfileService } from "@/services/cv-profile.service";
import { PositionService } from "@/services/position.service";
import type { CVProfile } from "@/models/cv-profile";
import type { Position } from "@/models/position";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { X, UserCircle } from "lucide-react";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";

// Zod schema definition
const formSchema = z.object({
  positionId: z.number({ required_error: "Vui lòng chọn vị trí ứng tuyển" }).min(1, "Vui lòng chọn vị trí ứng tuyển"),
  aboutMe: z.string().min(1, "Vui lòng nhập giới thiệu bản thân").max(2000, "Giới thiệu không được vượt quá 2000 ký tự"),
});

type FormData = z.infer<typeof formSchema>;

interface DialogCVProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  profileToEdit?: CVProfile | null;
}

export function DialogCVProfile({
  open,
  onOpenChange,
  onSuccess,
  profileToEdit,
}: DialogCVProfileProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positionId: 0,
      aboutMe: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = form;

  // Disable body scroll when dialog is open
  useDisableBodyScroll(open);

  // Fetch positions khi dialog mở
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setPositionsLoading(true);
        const response = await PositionService.getAll();
        setPositions(response.result || []);
      } catch (error) {
        console.error("Failed to fetch positions", error);
        toast.error("Không thể tải danh sách vị trí");
      } finally {
        setPositionsLoading(false);
      }
    };

    if (open) {
      fetchPositions();
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (profileToEdit) {
        reset({
          positionId: profileToEdit.positionId || 0,
          aboutMe: profileToEdit.aboutMe || "",
        });
      } else {
        reset({
          positionId: 0,
          aboutMe: "",
        });
      }
    }
  }, [open, profileToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setActionLoading(true);

      const submitData: CVProfile = {
        positionId: data.positionId,
        aboutMe: data.aboutMe,
        positionName: positions.find(p => p.positionId === data.positionId)?.name || "",
      };

      if (profileToEdit?.id) {
        await CVProfileService.update(profileToEdit.id.toString(), submitData);
        toast.success("Cập nhật hồ sơ thành công");
      } else {
        await CVProfileService.create(submitData);
        toast.success("Tạo hồ sơ thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(profileToEdit ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi tạo mới");
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
            <UserCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {profileToEdit ? "Cập nhật hồ sơ CV" : "Tạo hồ sơ CV"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {profileToEdit
                  ? "Cập nhật vị trí ứng tuyển và giới thiệu bản thân"
                  : "Nhập vị trí ứng tuyển và giới thiệu bản thân"}
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
          <div className="grid gap-6">
            {/* Position Select field */}
            <div>
              <Label className="text-sm font-medium">
                Vị trí ứng tuyển <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="positionId"
                render={({ field }) => (
                  <Select
                    value={field.value ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    disabled={actionLoading || positionsLoading}
                  >
                    <SelectTrigger
                      className={`w-full mt-1 ${errors.positionId ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder={positionsLoading ? "Đang tải..." : "Chọn vị trí ứng tuyển"} />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem
                          key={position.positionId}
                          value={position.positionId.toString()}
                        >
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.positionId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.positionId.message}
                </p>
              )}
            </div>

            {/* About Me field */}
            <div>
              <Label className="text-sm font-medium">
                Giới thiệu bản thân <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="aboutMe"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Hãy giới thiệu về bản thân, kỹ năng, kinh nghiệm và mục tiêu nghề nghiệp của bạn..."
                    className={`w-full mt-1 resize-none min-h-[200px] ${errors.aboutMe ? "border-red-500" : ""}`}
                    disabled={actionLoading}
                  />
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.aboutMe ? (
                  <p className="text-sm text-red-500">
                    {errors.aboutMe.message}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Mô tả ngắn gọn về bản thân (3-4 câu) nhấn mạnh thế mạnh của bạn
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  {watch("aboutMe")?.length || 0}/2000 ký tự
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
            {actionLoading ? "Đang lưu..." : profileToEdit ? "Cập nhật" : "Tạo hồ sơ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

