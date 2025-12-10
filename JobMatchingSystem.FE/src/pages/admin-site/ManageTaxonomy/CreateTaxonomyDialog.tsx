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
import { TaxonomyService } from "@/services/taxonomy.service";
import { Taxonomy } from "@/models/taxonomy";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const createTaxonomySchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên kỹ năng")
    .min(2, "Tên kỹ năng phải có ít nhất 2 ký tự")
    .max(100, "Tên kỹ năng không được vượt quá 100 ký tự"),
});

type CreateTaxonomyFormData = z.infer<typeof createTaxonomySchema>;

interface CreateTaxonomyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: () => void;
  parentTaxonomy?: Taxonomy | null;
}

export const CreateTaxonomyDialog: React.FC<CreateTaxonomyDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateSuccess,
  parentTaxonomy = null,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaxonomyFormData>({
    resolver: zodResolver(createTaxonomySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateTaxonomyFormData) => {
    setLoading(true);
    try {
      await TaxonomyService.create({
        name: data.name.trim(),
        parentId: parentTaxonomy?.id || null,
      });
      toast.success(
        parentTaxonomy
          ? `Thêm kỹ năng con cho "${parentTaxonomy.name}" thành công`
          : "Tạo kỹ năng mới thành công"
      );
      onCreateSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tạo kỹ năng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = parentTaxonomy
    ? `Thêm kỹ năng con cho "${parentTaxonomy.name}"`
    : "Thêm kỹ năng gốc";

  const dialogDescription = parentTaxonomy
    ? `Tạo một kỹ năng con thuộc "${parentTaxonomy.name}"`
    : "Tạo một kỹ năng cấp cao nhất trong hệ thống";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {parentTaxonomy && (
            <div className="space-y-2">
              <Label>Kỹ năng cha</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                {parentTaxonomy.name}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên kỹ năng *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên kỹ năng (VD: JavaScript, Python, React...)"
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
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {parentTaxonomy ? "Thêm kỹ năng con" : "Tạo kỹ năng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
