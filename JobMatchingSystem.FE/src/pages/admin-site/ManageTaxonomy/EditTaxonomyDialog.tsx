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
import { Taxonomy } from "@/models/taxonomy";
import { TaxonomyService } from "@/services/taxonomy.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const editTaxonomySchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên kỹ năng")
    .min(2, "Tên kỹ năng phải có ít nhất 2 ký tự")
    .max(100, "Tên kỹ năng không được vượt quá 100 ký tự"),
});

type EditTaxonomyFormData = z.infer<typeof editTaxonomySchema>;

interface EditTaxonomyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taxonomy: Taxonomy | null;
  onUpdateSuccess: () => void;
}

export const EditTaxonomyDialog: React.FC<EditTaxonomyDialogProps> = ({
  isOpen,
  onOpenChange,
  taxonomy,
  onUpdateSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaxonomyFormData>({
    resolver: zodResolver(editTaxonomySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (taxonomy && isOpen) {
      reset({
        name: taxonomy.name || "",
      });
    }
  }, [taxonomy, isOpen, reset]);

  const onSubmit = async (data: EditTaxonomyFormData) => {
    if (!taxonomy) return;

    setLoading(true);
    try {
      await TaxonomyService.update(taxonomy.id.toString(), {
        name: data.name.trim(),
      });
      toast.success("Cập nhật kỹ năng thành công");
      onUpdateSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Cập nhật kỹ năng thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!taxonomy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa kỹ năng</DialogTitle>
          <DialogDescription>
            Cập nhật tên kỹ năng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên kỹ năng *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên kỹ năng"
              className={cn(errors.name && "border-red-500")}
              autoFocus
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
