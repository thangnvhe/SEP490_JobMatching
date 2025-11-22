import React, { useState } from "react";
import { toast } from "sonner";

// UI Components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import { UserPlus, Save, Loader2 } from "lucide-react";

// Types
import type { CreateHiringManagerRequest, HiringManager } from "@/models/hiring-manager";

// ===================== TYPES =====================

interface CreateMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onCreateSuccess: (newMember: HiringManager) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  password: string;
  confirmPassword: string;
}

// ===================== UTILITY FUNCTIONS =====================

const validateForm = (formData: FormData): string[] => {
  const errors: string[] = [];

  if (!formData.firstName.trim()) {
    errors.push("Họ không được để trống");
  }

  if (!formData.lastName.trim()) {
    errors.push("Tên không được để trống");
  }

  if (!formData.email.trim()) {
    errors.push("Email không được để trống");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Email không hợp lệ");
  }

  if (!formData.phoneNumber.trim()) {
    errors.push("Số điện thoại không được để trống");
  } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
    errors.push("Số điện thoại không hợp lệ");
  }

  if (!formData.position.trim()) {
    errors.push("Chức vụ không được để trống");
  }

  if (!formData.department.trim()) {
    errors.push("Phòng ban không được để trống");
  }

  if (!formData.password.trim()) {
    errors.push("Mật khẩu không được để trống");
  } else if (formData.password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  if (formData.password !== formData.confirmPassword) {
    errors.push("Xác nhận mật khẩu không khớp");
  }

  return errors;
};

const positions = [
  "Senior HR Manager",
  "HR Manager", 
  "Recruitment Specialist",
  "HR Business Partner",
  "Talent Acquisition Manager",
  "Junior HR Specialist",
  "HR Coordinator",
  "Recruiter"
];

const departments = [
  "Nhân sự",
  "Tuyển dụng",
  "Phát triển nhân tài",
  "Quan hệ lao động"
];

// ===================== MAIN COMPONENT =====================

export const CreateMemberDialog: React.FC<CreateMemberDialogProps> = ({
  isOpen,
  onOpenChange,
  companyId,
  onCreateSuccess,
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    position: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);

      // Simulate API call (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock member data
      const newMember: HiringManager = {
        id: Date.now(), // Mock ID
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        position: formData.position,
        department: formData.department,
        isActive: true,
        createdAt: new Date().toISOString(),
        companyId: companyId,
      };

      onCreateSuccess(newMember);
      toast.success("Tạo thành viên thành công!");
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        position: "",
        department: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error: any) {
      console.error("Error creating member:", error);
      toast.error("Có lỗi xảy ra khi tạo thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        position: "",
        department: "",
        password: "",
        confirmPassword: "",
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Tạo thành viên mới
          </DialogTitle>
          <DialogDescription>
            Thêm thành viên mới vào công ty với quyền Hiring Manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">
                  Họ và tên đệm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Nhập họ và tên đệm"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Nhập tên"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@company.com"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-900">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="0901234567"
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin công việc
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position" className="text-sm font-medium text-gray-900">
                  Chức vụ <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => handleInputChange('position', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium text-gray-900">
                  Phòng ban <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin tài khoản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo thành viên
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};