import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save } from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import services và types
import { JobServices } from "@/services/job.service";
import { type JobDetailResponse } from "@/models/job";

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề công việc là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().min(1, "Mô tả công việc là bắt buộc"),
  requirements: z.string().min(1, "Yêu cầu công việc là bắt buộc"),
  benefits: z.string().optional(),
  location: z.string().min(1, "Địa điểm làm việc là bắt buộc"),
  salaryMin: z.number().min(0, "Lương tối thiểu phải lớn hơn 0").optional().nullable(),
  salaryMax: z.number().min(0, "Lương tối đa phải lớn hơn 0").optional().nullable(),
  experienceYear: z.number().min(0, "Số năm kinh nghiệm không được âm").max(50, "Số năm kinh nghiệm không được quá 50"),
  jobType: z.string().min(1, "Loại công việc là bắt buộc"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface EditJobDialogProps {
  job: JobDetailResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditJobDialog({ job, isOpen, onClose, onSave }: EditJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      benefits: "",
      location: "",
      salaryMin: null,
      salaryMax: null,
      experienceYear: 0,
      jobType: "0",
    }
  });

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      const formData = {
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        location: job.location || "",
        salaryMin: job.salaryMin || null,
        salaryMax: job.salaryMax || null,
        experienceYear: job.experienceYear || 0,
        jobType: job.jobType !== undefined ? job.jobType.toString() : "0",
      };
      
      console.log("Resetting form with data:", formData);
      console.log("Original job data:", job);
      
      reset(formData);
      
      // Force set jobType để đảm bảo Select hiện thị đúng
      setValue("jobType", formData.jobType);
    }
  }, [job, reset, setValue]);

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsLoading(true);

      // Validate salary range
      if (data.salaryMin && data.salaryMax && data.salaryMin >= data.salaryMax) {
        alert("Lương tối thiểu phải nhỏ hơn lương tối đa");
        return;
      }

      // Prepare update request
      const updateRequest = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits || undefined,
        location: data.location,
        salaryMin: data.salaryMin || undefined,
        salaryMax: data.salaryMax || undefined,
        experienceYear: data.experienceYear,
        jobType: data.jobType,
      };

      console.log("Updating job with data:", updateRequest);

      // Call API
      const response = await JobServices.updateJob(job.jobId.toString(), updateRequest);
      
      if (response.isSuccess) {
        onSave(); // Refresh parent component data
        onClose(); // Close dialog
        alert("Cập nhật tin tuyển dụng thành công!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật tin tuyển dụng");
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message?.includes("CantUpdate")) {
        alert("Không thể cập nhật tin tuyển dụng đã có ứng viên ứng tuyển");
      } else if (error.message?.includes("NotFoundRecruiter")) {
        alert("Bạn không có quyền chỉnh sửa tin tuyển dụng này");
      } else {
        alert("Có lỗi xảy ra khi cập nhật tin tuyển dụng. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Chỉnh sửa tin tuyển dụng
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto" style={{ height: 'calc(85vh - 140px)' }}>
            <div className="space-y-6">
              
              {/* Thông tin cơ bản */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề công việc *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Nhập tiêu đề công việc..."
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm làm việc *</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Nhập địa điểm làm việc..."
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Loại công việc *</Label>
                    <Select
                      value={watch("jobType") || "0"}
                      onValueChange={(value) => {
                        console.log("Job type changing to:", value);
                        setValue("jobType", value);
                      }}
                    >
                      <SelectTrigger className={errors.jobType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn loại công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Toàn thời gian</SelectItem>
                        <SelectItem value="1">Bán thời gian</SelectItem>
                        <SelectItem value="2">Làm từ xa</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.jobType && (
                      <p className="text-sm text-red-500">{errors.jobType.message}</p>
                    )}
                    {/* Debug info - remove after testing */}
                    <p className="text-xs text-gray-500">
                      Current jobType value: {watch("jobType")} | Original job.jobType: {job.jobType}
                    </p>
                  </div>

                  {/* Experience Year */}
                  <div className="space-y-2">
                    <Label htmlFor="experienceYear">Số năm kinh nghiệm yêu cầu</Label>
                    <Input
                      id="experienceYear"
                      type="number"
                      min="0"
                      max="50"
                      {...register("experienceYear", { valueAsNumber: true })}
                      placeholder="Nhập số năm kinh nghiệm..."
                      className={errors.experienceYear ? "border-red-500" : ""}
                    />
                    {errors.experienceYear && (
                      <p className="text-sm text-red-500">{errors.experienceYear.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mức lương */}
              <Card>
                <CardHeader>
                  <CardTitle>Mức lương</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Lương tối thiểu (VND)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        {...register("salaryMin", { valueAsNumber: true })}
                        placeholder="Nhập lương tối thiểu..."
                        className={errors.salaryMin ? "border-red-500" : ""}
                      />
                      {errors.salaryMin && (
                        <p className="text-sm text-red-500">{errors.salaryMin.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Lương tối đa (VND)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        {...register("salaryMax", { valueAsNumber: true })}
                        placeholder="Nhập lương tối đa..."
                        className={errors.salaryMax ? "border-red-500" : ""}
                      />
                      {errors.salaryMax && (
                        <p className="text-sm text-red-500">{errors.salaryMax.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Để trống nếu lương thỏa thuận
                  </p>
                </CardContent>
              </Card>

              {/* Mô tả chi tiết */}
              <Card>
                <CardHeader>
                  <CardTitle>Mô tả chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả công việc *</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      {...register("description")}
                      placeholder="Mô tả chi tiết về công việc..."
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Yêu cầu công việc *</Label>
                    <Textarea
                      id="requirements"
                      rows={4}
                      {...register("requirements")}
                      placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                      className={errors.requirements ? "border-red-500" : ""}
                    />
                    {errors.requirements && (
                      <p className="text-sm text-red-500">{errors.requirements.message}</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Quyền lợi</Label>
                    <Textarea
                      id="benefits"
                      rows={3}
                      {...register("benefits")}
                      placeholder="Các quyền lợi và phúc lợi..."
                      className={errors.benefits ? "border-red-500" : ""}
                    />
                    {errors.benefits && (
                      <p className="text-sm text-red-500">{errors.benefits.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="mr-2 w-4 h-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 w-4 h-4" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}