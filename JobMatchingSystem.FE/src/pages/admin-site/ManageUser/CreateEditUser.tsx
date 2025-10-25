// Đặt file này tại: src/pages/Admin-Side/ManageUser/CreateEditUser.tsx
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, User, UserRoundCog } from "lucide-react";

// Import các UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type UserRole = "candidate" | "recruiter";
type UserStatus = "active" | "deactivated";

type UserFormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
  companyName: string; // Chỉ cho recruiter
};

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH
// ------------------------------------------------------------------

export function CreateEditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // State cho form
  const [formData, setFormData] = React.useState<UserFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "candidate",
    status: "active",
    companyName: "",
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // Load dữ liệu nếu là edit
  React.useEffect(() => {
    if (isEdit && id) {
      // TODO: Load dữ liệu từ API
      // Ví dụ: loadUserData(id).then(setFormData);
      console.log("Loading user data for ID:", id);
    }
  }, [isEdit, id]);

  // Xử lý thay đổi input
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Gọi API để tạo/cập nhật user
      if (isEdit) {
        console.log("Updating user:", formData);
        // await updateUser(id, formData);
      } else {
        console.log("Creating user:", formData);
        // await createUser(formData);
      }

      // Chuyển về trang danh sách
      navigate("/admin/manage-user");
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Có lỗi xảy ra khi lưu người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    navigate("/admin/manage-user");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/manage-user")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin người dùng"
              : "Điền thông tin để tạo người dùng mới"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Nhập email..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Vai trò và trạng thái */}
          <Card>
            <CardHeader>
              <CardTitle>Vai trò và trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate">
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        Candidate
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter">
                      <div className="flex items-center gap-2">
                        <UserRoundCog className="size-4" />
                        Recruiter
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hiển thị thông tin công ty nếu là recruiter */}
              {formData.role === "recruiter" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Tên công ty *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    placeholder="Nhập tên công ty..."
                    required={formData.role === "recruiter"}
                  />
                </div>
              )}

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
                          Active
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="deactivated">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Deactivated</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview vai trò */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Xem trước:</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      formData.role === "recruiter" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {formData.role === "recruiter" ? (
                      <UserRoundCog className="mr-1.5 size-3.5" />
                    ) : (
                      <User className="mr-1.5 size-3.5" />
                    )}
                    {formData.role}
                  </Badge>
                  <Badge
                    variant={
                      formData.status === "active" ? "default" : "destructive"
                    }
                    className={
                      formData.status === "active"
                        ? "bg-green-600 hover:bg-green-600"
                        : ""
                    }
                  >
                    {formData.status === "active" ? "Active" : "Deactivated"}
                  </Badge>
                </div>
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
              ? "Cập nhật người dùng"
              : "Tạo người dùng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
