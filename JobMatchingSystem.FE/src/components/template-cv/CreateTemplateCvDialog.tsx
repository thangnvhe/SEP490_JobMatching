import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateCvServices } from "@/services/template-cv.service";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Validation schema
const createTemplateCvSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập tên template")
    .min(2, "Tên template phải có ít nhất 2 ký tự")
    .max(100, "Tên template không được vượt quá 100 ký tự"),
});

type CreateTemplateCvFormData = z.infer<typeof createTemplateCvSchema>;

interface CreateTemplateCvDialogProps {
  onSuccess?: () => void;
}

export default function CreateTemplateCvDialog({
  onSuccess,
}: CreateTemplateCvDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateCvFormData>({
    resolver: zodResolver(createTemplateCvSchema),
    defaultValues: {
      name: "",
    },
  });

  const resetForm = () => {
    reset({ name: "" });
    setHtmlFile(null);
    setImageFile(null);
    if (htmlFileInputRef.current) htmlFileInputRef.current.value = "";
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".html") && !fileName.endsWith(".htm")) {
        toast.error("Vui lòng chọn file HTML (.html hoặc .htm)");
        e.target.value = "";
        return;
      }
      setHtmlFile(file);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        toast.error("Ảnh xem trước phải là file JPG, PNG hoặc GIF");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        e.target.value = "";
        return;
      }
      setImageFile(file);
    }
  };

  const removeHtmlFile = () => {
    setHtmlFile(null);
    if (htmlFileInputRef.current) htmlFileInputRef.current.value = "";
  };

  const removeImageFile = () => {
    setImageFile(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  const onSubmit = async (data: CreateTemplateCvFormData) => {
    if (!htmlFile) {
      toast.error("Vui lòng chọn file HTML template");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("file", htmlFile);
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      await TemplateCvServices.create(formData);
      toast.success("Tạo template CV thành công");
      handleOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo template CV"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Template CV mới</DialogTitle>
          <DialogDescription>
            Thêm template CV mới vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Template Name */}
          <div className="space-y-2 w-full">
            <Label htmlFor="name">Tên Template *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên template CV"
              disabled={loading}
              maxLength={100}
              className={cn("w-full", errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* HTML File Upload */}
          <div className="space-y-2 w-full">
            <Label htmlFor="htmlFile">File Template (HTML) *</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 transition-colors",
                "hover:border-blue-400",
                !htmlFile ? "border-gray-300" : "border-blue-500 bg-blue-50"
              )}
            >
              <input
                ref={htmlFileInputRef}
                id="htmlFile"
                type="file"
                accept=".html,.htm"
                onChange={handleHtmlFileChange}
                disabled={loading}
                className="hidden"
              />
              {!htmlFile ? (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                  onClick={() => htmlFileInputRef.current?.click()}
                >
                  <FileText className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Click để chọn file HTML
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Chỉ chấp nhận file .html hoặc .htm
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {htmlFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeHtmlFile}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Image File Upload */}
          <div className="space-y-2 w-full">
            <Label htmlFor="imageFile">Ảnh xem trước (Tùy chọn)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 transition-colors",
                "hover:border-blue-400",
                !imageFile ? "border-gray-300" : "border-purple-500 bg-purple-50"
              )}
            >
              <input
                ref={imageFileInputRef}
                id="imageFile"
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleImageFileChange}
                disabled={loading}
                className="hidden"
              />
              {!imageFile ? (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Click để chọn ảnh xem trước
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF - Tối đa 5MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {imageFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImageFile}
                    disabled={loading}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
              {loading ? "Đang tạo..." : "Tạo Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
