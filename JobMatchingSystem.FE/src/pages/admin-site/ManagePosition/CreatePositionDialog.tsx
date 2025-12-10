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
import { PositionService } from "@/services/position.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const createPositionSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên vị trí")
    .min(2, "Tên vị trí phải có ít nhất 2 ký tự")
    .max(100, "Tên vị trí không được vượt quá 100 ký tự"),
});

type CreatePositionFormData = z.infer<typeof createPositionSchema>;

interface CreatePositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: () => void;
}

export const CreatePositionDialog: React.FC<CreatePositionDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreatePositionFormData) => {
    setLoading(true);
    try {
      await PositionService.create({
        name: data.name.trim(),
      });
      toast.success("Tạo vị trí mới thành công");
      onCreateSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Tạo vị trí thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm vị trí mới</DialogTitle>
          <DialogDescription>
            Tạo một vị trí mới trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên vị trí *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên vị trí (VD: Trưởng phòng IT, Nhân viên Marketing...)"
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
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo vị trí
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
