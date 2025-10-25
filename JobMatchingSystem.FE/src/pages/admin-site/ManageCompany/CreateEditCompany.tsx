// Đặt file này tại: src/pages/Admin-Side/ManageCompany/CreateEditCompany.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Building, Globe, Phone, Mail } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

// ------------------------------------------------------------------
// PHẦN 1: TYPES VÀ DỮ LIỆU
// ------------------------------------------------------------------

type CompanyStatus = "active" | "inactive" | "pending";

type CompanyFormData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  industry: string;
  size: string;
  status: CompanyStatus;
};

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH
// ------------------------------------------------------------------

export function CreateEditCompanyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // State cho form
  const [formData, setFormData] = React.useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    description: "",
    industry: "",
    size: "",
    status: "active",
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // Load dữ liệu nếu là edit
  React.useEffect(() => {
    if (isEdit && id) {
      // TODO: Load dữ liệu từ API
      // Ví dụ: loadCompanyData(id).then(setFormData);
      console.log("Loading company data for ID:", id);
    }
  }, [isEdit, id]);

  // Xử lý thay đổi input
  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Gọi API để tạo/cập nhật company
      if (isEdit) {
        console.log("Updating company:", formData);
        // await updateCompany(id, formData);
      } else {
        console.log("Creating company:", formData);
        // await createCompany(formData);
      }

      // Chuyển về trang danh sách
      navigate("/admin/manage-company");
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Có lỗi xảy ra khi lưu công ty");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    navigate("/admin/manage-company");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/manage-company")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Chỉnh sửa công ty" : "Tạo công ty mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin công ty"
              : "Điền thông tin để tạo công ty mới"}
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
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên công ty *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên công ty..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="size-4" />
                  Email liên hệ *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Nhập email liên hệ..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="size-4" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="size-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ công ty..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin bổ sung */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Lĩnh vực hoạt động</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    handleInputChange("industry", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">
                      Công nghệ thông tin
                    </SelectItem>
                    <SelectItem value="finance">
                      Tài chính - Ngân hàng
                    </SelectItem>
                    <SelectItem value="education">
                      Giáo dục - Đào tạo
                    </SelectItem>
                    <SelectItem value="healthcare">Y tế - Sức khỏe</SelectItem>
                    <SelectItem value="manufacturing">Sản xuất</SelectItem>
                    <SelectItem value="retail">Bán lẻ - Thương mại</SelectItem>
                    <SelectItem value="real-estate">Bất động sản</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Quy mô công ty</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => handleInputChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quy mô" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">
                      Startup (1-10 nhân viên)
                    </SelectItem>
                    <SelectItem value="small">
                      Công ty nhỏ (11-50 nhân viên)
                    </SelectItem>
                    <SelectItem value="medium">
                      Công ty vừa (51-200 nhân viên)
                    </SelectItem>
                    <SelectItem value="large">
                      Công ty lớn (201-1000 nhân viên)
                    </SelectItem>
                    <SelectItem value="enterprise">
                      Tập đoàn (1000+ nhân viên)
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-600"
                        >
                          Hoạt động
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Không hoạt động</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Chờ duyệt
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả công ty</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả về công ty, lịch sử, văn hóa..."
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
              ? "Cập nhật công ty"
              : "Tạo công ty"}
          </Button>
        </div>
      </form>
    </div>
  );
}
