import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
// UI Components
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Icons
import { Plus, Save, Loader2, Package } from "lucide-react";

// Services
import { ServicePlanServices } from "@/services/service-plan.service";

// Types
import { ServicePlan } from "@/models/service-plan";

// ===================== ZOD SCHEMA =====================

const servicePlanSchema = z.object({
  name: z
    .string()
    .min(1, "Tên gói dịch vụ không được để trống")
    .max(100, "Tên gói dịch vụ không được quá 100 ký tự"),
  description: z
    .string()
    .min(1, "Mô tả không được để trống")
    .max(500, "Mô tả không được quá 500 ký tự"),
  price: z
    .number({ invalid_type_error: "Giá phải là số" })
    .min(0, "Giá không được âm"),
  jobPostAdditional: z
    .number()
    .min(0, "Số bài đăng thêm không được âm")
    .optional(),
  highlightJobDays: z
    .number()
    .min(0, "Số ngày nổi bật không được âm")
    .optional(),
  highlightJobDaysCount: z
    .number()
    .min(0, "Số lần nổi bật không được âm")
    .optional(),
  extensionJobDays: z
    .number()
    .min(0, "Số ngày gia hạn không được âm")
    .optional(),
  extensionJobDaysCount: z
    .number()
    .min(0, "Số lần gia hạn không được âm")
    .optional(),
  cvSaveAdditional: z
    .number()
    .min(0, "Số CV lưu thêm không được âm")
    .optional(),
});

type ServicePlanFormData = z.infer<typeof servicePlanSchema>;

// ===================== TYPES =====================

interface CreateEditServicePlanDialogProps {
  servicePlan?: ServicePlan | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
}

// ===================== MAIN COMPONENT =====================

export default function CreateEditServicePlanDialog({
  servicePlan,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  mode = "create",
}: CreateEditServicePlanDialogProps) {
  // State management
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;
  const setIsOpen = isControlled
    ? (open: boolean) => controlledOnOpenChange?.(open)
    : setInternalOpen;

  const isEditMode = mode === "edit";

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ServicePlanFormData>({
    resolver: zodResolver(servicePlanSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      jobPostAdditional: 0,
      highlightJobDays: 0,
      highlightJobDaysCount: 0,
      extensionJobDays: 0,
      extensionJobDaysCount: 0,
      cvSaveAdditional: 0,
    },
  });

  // Reset form when dialog opens or servicePlan changes
  useEffect(() => {
    if (isOpen) {
      console.log("servicePlan", servicePlan);
      if (servicePlan && isEditMode) {
        reset({
          name: servicePlan.name || "",
          description: servicePlan.description || "",
          price: servicePlan.price || 0,
          jobPostAdditional: servicePlan.jobPostAdditional || 0,
          highlightJobDays: servicePlan.highlightJobDays || 0,
          highlightJobDaysCount: servicePlan.highlightJobDaysCount || 0,
          extensionJobDays: servicePlan.extensionJobDays || 0,
          extensionJobDaysCount: servicePlan.extensionJobDaysCount || 0,
          cvSaveAdditional: servicePlan.cvSaveAdditional || 0,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: 0,
          jobPostAdditional: 0,
          highlightJobDays: 0,
          highlightJobDaysCount: 0,
          extensionJobDays: 0,
          extensionJobDaysCount: 0,
          cvSaveAdditional: 0,
        });
      }
    }
  }, [isOpen, servicePlan, isEditMode, reset]);

  // Handle form submit
  const onSubmit = async (data: ServicePlanFormData) => {
    try {
      setLoading(true);

      const payload: Omit<ServicePlan, "id"> = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: data.price,
        jobPostAdditional: data.jobPostAdditional || undefined,
        highlightJobDays: data.highlightJobDays || undefined,
        highlightJobDaysCount: data.highlightJobDaysCount || undefined,
        extensionJobDays: data.extensionJobDays || undefined,
        extensionJobDaysCount: data.extensionJobDaysCount || undefined,
        cvSaveAdditional: data.cvSaveAdditional || undefined,
      };

      if (isEditMode && servicePlan) {
        await ServicePlanServices.update(servicePlan.id.toString(), payload);
        toast.success("Cập nhật gói dịch vụ thành công");
      } else {
        await ServicePlanServices.create(payload);
        toast.success("Tạo gói dịch vụ thành công");
      }

      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        `Có lỗi xảy ra khi ${isEditMode ? "cập nhật" : "tạo"} gói dịch vụ`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open && loading) return;
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button size="default" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm mới</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            {isEditMode ? "Chỉnh sửa gói dịch vụ" : "Tạo gói dịch vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin gói dịch vụ trong hệ thống."
              : "Thêm gói dịch vụ mới vào hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-900"
              >
                Tên gói dịch vụ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Nhập tên gói dịch vụ"
                className="mt-1"
                maxLength={100}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-900"
              >
                Mô tả <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Nhập mô tả chi tiết về gói dịch vụ"
                className="mt-1 min-h-[100px]"
                maxLength={500}
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-900"
              >
                Giá (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="price"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    {...field}
                    id="price"
                    type="text"
                    placeholder="Nhập giá gói dịch vụ"
                    className="mt-1"
                    disabled={loading}
                    value={value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      const numberValue = rawValue ? parseInt(rawValue, 10) : 0;
                      onChange(numberValue);
                    }}
                  />
                )}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Tính năng gói dịch vụ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="jobPostAdditional"
                  className="text-sm font-medium text-gray-900"
                >
                  Số bài đăng thêm
                </Label>
                <Input
                  id="jobPostAdditional"
                  type="number"
                  {...register("jobPostAdditional", { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.jobPostAdditional && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.jobPostAdditional.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="cvSaveAdditional"
                  className="text-sm font-medium text-gray-900"
                >
                  Số CV lưu thêm
                </Label>
                <Input
                  id="cvSaveAdditional"
                  type="number"
                  {...register("cvSaveAdditional", { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.cvSaveAdditional && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.cvSaveAdditional.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="highlightJobDays"
                  className="text-sm font-medium text-gray-900"
                >
                  Số ngày nổi bật
                </Label>
                <Input
                  id="highlightJobDays"
                  type="number"
                  {...register("highlightJobDays", { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.highlightJobDays && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.highlightJobDays.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="highlightJobDaysCount"
                  className="text-sm font-medium text-gray-900"
                >
                  Số lần nổi bật
                </Label>
                <Input
                  id="highlightJobDaysCount"
                  type="number"
                  {...register("highlightJobDaysCount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.highlightJobDaysCount && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.highlightJobDaysCount.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="extensionJobDays"
                  className="text-sm font-medium text-gray-900"
                >
                  Số ngày gia hạn
                </Label>
                <Input
                  id="extensionJobDays"
                  type="number"
                  {...register("extensionJobDays", { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.extensionJobDays && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.extensionJobDays.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="extensionJobDaysCount"
                  className="text-sm font-medium text-gray-900"
                >
                  Số lần gia hạn
                </Label>
                <Input
                  id="extensionJobDaysCount"
                  type="number"
                  {...register("extensionJobDaysCount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  className="mt-1"
                  min={0}
                  disabled={loading}
                />
                {errors.extensionJobDaysCount && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.extensionJobDaysCount.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Cập nhật" : "Tạo mới"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
