import React, { useEffect, useState } from "react";
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
import { Position } from "@/models/position";
import { PositionService } from "@/services/position.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const editPositionSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên vị trí")
    .min(2, "Tên vị trí phải có ít nhất 2 ký tự")
    .max(100, "Tên vị trí không được vượt quá 100 ký tự"),
});

type EditPositionFormData = z.infer<typeof editPositionSchema>;

interface EditPositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position: Position | null;
  onUpdateSuccess: () => void;
}

export const EditPositionDialog: React.FC<EditPositionDialogProps> = ({
  isOpen,
  onOpenChange,
  position,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPositionFormData>({
    resolver: zodResolver(editPositionSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (position && isOpen) {
      reset({
        name: position.name || "",
      });
    }
  }, [position, isOpen, reset]);

  const onSubmit = async (data: EditPositionFormData) => {
    if (!position) return;

    setLoading(true);
    try {
      await PositionService.update(position.positionId.toString(), {
        name: data.name.trim(),
      });
      toast.success("Cập nhật vị trí thành công");
      onUpdateSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Cập nhật vị trí thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vị trí</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin vị trí trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên vị trí *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên vị trí"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

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
