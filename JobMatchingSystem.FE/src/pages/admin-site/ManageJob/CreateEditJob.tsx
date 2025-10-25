// Đặt file này tại: src/pages/Admin-Side/ManageJob/CreateEditJob.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";

// Import các UI components
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
import { Separator } from "@/components/ui/separator";

// ------------------------------------------------------------------
// PHẦN 1: TYPES VÀ DỮ LIỆU
// ------------------------------------------------------------------

type JobStatus = "pending" | "open" | "closed" | "rejected";

type JobFormData = {
  title: string;
  companyName: string;
  description: string;
  location: string;
  salary: string;
  requirements: string;
  status: JobStatus;
};

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH
// ------------------------------------------------------------------

export function CreateEditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // State cho form
  const [formData, setFormData] = React.useState<JobFormData>({
    title: "",
    companyName: "",
    description: "",
    location: "",
    salary: "",
    requirements: "",
    status: "pending",
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // Load dữ liệu nếu là edit
  React.useEffect(() => {
    if (isEdit && id) {
      // TODO: Load dữ liệu từ API
      // Ví dụ: loadJobData(id).then(setFormData);
      console.log("Loading job data for ID:", id);
    }
  }, [isEdit, id]);

  // Xử lý thay đổi input
  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Gọi API để tạo/cập nhật job
      if (isEdit) {
        console.log("Updating job:", formData);
        // await updateJob(id, formData);
      } else {
        console.log("Creating job:", formData);
        // await createJob(formData);
      }

      // Chuyển về trang danh sách
      navigate("/admin/manage-job");
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Có lỗi xảy ra khi lưu tin tuyển dụng");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    navigate("/admin/manage-job");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/manage-job")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin tin tuyển dụng"
              : "Điền thông tin để tạo tin tuyển dụng mới"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên công việc *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tên công việc..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Tên công ty *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="Nhập tên công ty..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Nhập địa điểm làm việc..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Mức lương</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  placeholder="Ví dụ: 15-25M VND"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="open">Đang mở</SelectItem>
                    <SelectItem value="closed">Đã đóng</SelectItem>
                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mô tả và yêu cầu */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả và yêu cầu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả công việc *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả chi tiết về công việc..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Yêu cầu công việc</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  placeholder="Liệt kê các yêu cầu về kỹ năng, kinh nghiệm..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="mr-2 size-4" />
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 size-4" />
            {isLoading
              ? "Đang lưu..."
              : isEdit
              ? "Cập nhật tin tuyển dụng"
              : "Tạo tin tuyển dụng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
