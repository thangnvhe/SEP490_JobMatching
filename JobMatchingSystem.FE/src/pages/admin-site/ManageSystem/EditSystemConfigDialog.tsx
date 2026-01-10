import { useEffect, useState } from "react";
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
import { SystemConfig, UpdateSystemConfigDto } from "@/models/system-config";
import { toast } from "sonner";

interface EditSystemConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  config: SystemConfig | null;
}

/**
 * Dialog để chỉnh sửa System Config
 * Theo nguyên tắc SRP: chỉ xử lý việc cập nhật value của config
 */
export function EditSystemConfigDialog({
  open,
  onOpenChange,
  onSuccess,
  config,
}: EditSystemConfigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // Định nghĩa mô tả cho các config
  const configDescriptions: Record<string, Record<string, string>> = {
    job: {
      JobQuota: "Hạn mức số lượng job",
      SaveCV: "Số lượng CV được lưu",
    },
    report_company: {
      Fraudulent: "Hình phạt khi bị report là lừa đảo",
      Spam: "Hình phạt khi bị report là spam",
      Inappropriate: "Hình phạt nội dung không phù hợp",
      Other: "Hình phạt cho các loại report khác",
    },
    report_reporter: {
      Fraudulent: "Hình phạt khi report sai loại lừa đảo",
      Spam: "Hình phạt khi report sai loại spam",
      Inappropriate: "Hình phạt report sai loại không phù hợp",
      Other: "Hình phạt cho các loại report sai khác",
    },
    education_level: {
      "Cao đẳng": "Cấp độ 1",
      "Đại học": "Cấp độ 2",
      "Kỹ sư": "Cấp độ 2",
      "Cử nhân": "Cấp độ 2",
      "Thạc sĩ": "Cấp độ 3",
      "Tiến sĩ": "Cấp độ 4",
    },
    save_cv: {
      SaveCVCount: "Số lượng CV được phép lưu",
    },
  };

  const getDescription = () => {
    if (!config) return "";
    return configDescriptions[config.type]?.[config.name] || "";
  };

  useEffect(() => {
    if (config) {
      setValue(config.value);
    }
  }, [config]);

  // Validate value
  const validateValue = (): boolean => {
    if (!value.trim()) {
      setError("Giá trị là bắt buộc");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!config || !validateValue()) {
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdateSystemConfigDto = { value };
      const response = await SystemConfigService.updateConfig(config.id, updateData);

      if (response.isSuccess) {
        toast.success("Cập nhật cấu hình thành công");
        onSuccess();
        handleClose();
      } else {
        toast.error(response.errorMessages?.[0] || "Có lỗi xảy ra");
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { errorMessages?: string[] } } })
        .response?.data?.errorMessages?.[0] || "Lỗi khi cập nhật cấu hình";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValue("");
    setError("");
    onOpenChange(false);
  };

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa cấu hình hệ thống</DialogTitle>
          <DialogDescription>
            Cập nhật giá trị cho cấu hình "{config.name}"
            {getDescription() && (
              <span className="block mt-1 text-xs">
                ℹ️ {getDescription()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Loại cấu hình</Label>
            <Input value={config.type} disabled className="bg-gray-100 w-full" />
          </div>

          <div className="space-y-2">
            <Label>Tên cấu hình</Label>
            <Input value={config.name} disabled className="bg-gray-100 w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Giá trị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nhập giá trị mới"
              className="w-full"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Giá trị hiện tại: {config.value}
            </p>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
