import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SystemConfigService } from "@/services/system-config.service";
import { CreateSystemConfigDto } from "@/models/system-config";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateSystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog để tạo mới System Config
 * Theo nguyên tắc SRP: chỉ xử lý việc tạo mới config
 */
export function CreateSystemConfigDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSystemConfigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSystemConfigDto>({
    type: "",
    name: "",
    value: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = "Loại cấu hình là bắt buộc";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên cấu hình là bắt buộc";
    }

    if (!formData.value.trim()) {
      newErrors.value = "Giá trị là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await SystemConfigService.createConfig(formData);

      if (response.isSuccess) {
        toast.success("Tạo cấu hình hệ thống thành công");
        onSuccess();
        handleClose();
      } else {
        toast.error(response.errorMessages?.[0] || "Có lỗi xảy ra");
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { errorMessages?: string[] } } })
        .response?.data?.errorMessages?.[0] || "Lỗi khi tạo cấu hình";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: "",
      name: "",
      value: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  // Định nghĩa các type và name hợp lệ
  const configTypes = [
    { value: "job", label: "Job - Hạn mức công việc" },
    { value: "report_company", label: "Report Company - Hình phạt công ty" },
    { value: "report_reporter", label: "Report Reporter - Hình phạt người report" },
    { value: "education_level", label: "Education Level - Cấp độ học vấn" },
    { value: "save_cv", label: "Save CV - Lưu CV" },
  ];

  // Danh sách name hợp lệ cho từng type
  const configNamesByType: Record<string, Array<{ value: string; label: string; description: string; defaultValue: string }>> = {
    job: [
      { value: "JobQuota", label: "JobQuota", description: "Hạn mức số lượng job", defaultValue: "5" },
      { value: "SaveCV", label: "SaveCV", description: "Số lượng CV được lưu", defaultValue: "100" },
    ],
    report_company: [
      { value: "Fraudulent", label: "Fraudulent", description: "Hình phạt khi bị report là lừa đảo", defaultValue: "15" },
      { value: "Spam", label: "Spam", description: "Hình phạt khi bị report là spam", defaultValue: "5" },
      { value: "Inappropriate", label: "Inappropriate", description: "Hình phạt nội dung không phù hợp", defaultValue: "8" },
      { value: "Other", label: "Other", description: "Hình phạt cho các loại report khác", defaultValue: "6" },
    ],
    report_reporter: [
      { value: "Fraudulent", label: "Fraudulent", description: "Hình phạt khi report sai loại lừa đảo", defaultValue: "8" },
      { value: "Spam", label: "Spam", description: "Hình phạt khi report sai loại spam", defaultValue: "3" },
      { value: "Inappropriate", label: "Inappropriate", description: "Hình phạt report sai loại không phù hợp", defaultValue: "5" },
      { value: "Other", label: "Other", description: "Hình phạt cho các loại report sai khác", defaultValue: "4" },
    ],
    education_level: [
      { value: "Cao đẳng", label: "Cao đẳng", description: "Cấp độ 1", defaultValue: "1" },
      { value: "Đại học", label: "Đại học", description: "Cấp độ 2", defaultValue: "2" },
      { value: "Kỹ sư", label: "Kỹ sư", description: "Cấp độ 2", defaultValue: "2" },
      { value: "Cử nhân", label: "Cử nhân", description: "Cấp độ 2", defaultValue: "2" },
      { value: "Thạc sĩ", label: "Thạc sĩ", description: "Cấp độ 3", defaultValue: "3" },
      { value: "Tiến sĩ", label: "Tiến sĩ", description: "Cấp độ 4", defaultValue: "4" },
    ],
    save_cv: [
      { value: "SaveCVCount", label: "SaveCVCount", description: "Số lượng CV được phép lưu", defaultValue: "3" },
    ],
  };

  // Lấy danh sách name cho type hiện tại
  const availableNames = formData.type ? configNamesByType[formData.type] || [] : [];

  // Lấy thông tin của name được chọn
  const selectedNameInfo = availableNames.find(n => n.value === formData.name);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo cấu hình hệ thống mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo cấu hình hệ thống mới
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">
              Loại cấu hình <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData((prev) => ({ 
                  ...prev, 
                  type: value,
                  name: "", // Reset name khi đổi type
                  value: "" // Reset value
                }));
                setErrors({});
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại cấu hình" />
              </SelectTrigger>
              <SelectContent>
                {configTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Tên cấu hình <span className="text-red-500">*</span>
            </Label>
            {formData.type ? (
              <Select
                value={formData.name}
                onValueChange={(value) => {
                  const nameInfo = availableNames.find(n => n.value === value);
                  setFormData((prev) => ({ 
                    ...prev, 
                    name: value,
                    value: nameInfo?.defaultValue || "" // Tự động điền giá trị mặc định
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tên cấu hình" />
                </SelectTrigger>
                <SelectContent>
                  {availableNames.map((name) => (
                    <SelectItem key={name.value} value={name.value} className="group">
                      <span className="font-medium">{name.label}</span>
                      <span className="text-muted-foreground group-focus:text-accent-foreground!"> - {name.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="name"
                disabled
                placeholder="Vui lòng chọn loại cấu hình trước"
                className="bg-gray-100 w-full"
              />
            )}
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            {selectedNameInfo && (
              <p className="text-xs text-muted-foreground">
                ℹ️ {selectedNameInfo.description} (Giá trị mặc định: {selectedNameInfo.defaultValue})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Giá trị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, value: e.target.value }))
              }
              placeholder="Nhập giá trị"
              disabled={!formData.name}
              className="w-full"
            />
            {errors.value && (
              <p className="text-sm text-red-500">{errors.value}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
