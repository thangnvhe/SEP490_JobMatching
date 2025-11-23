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

// Icons
import { UserPlus, Save, Loader2 } from "lucide-react";

// Types
import type { CreateHiringManagerRequest } from "@/models/user";
import { UserServices } from "@/services/user.service";

// ===================== TYPES =====================

interface CreateMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onCreateSuccess: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

// ===================== UTILITY FUNCTIONS =====================

const validateForm = (formData: FormData): string[] => {
  const errors: string[] = [];

  if (!formData.fullName.trim()) {
    errors.push("Họ và tên không được để trống");
  } else if (formData.fullName.length > 100) {
    errors.push("Họ và tên không được vượt quá 100 ký tự");
  }

  if (!formData.email.trim()) {
    errors.push("Email không được để trống");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Email không hợp lệ");
  } else if (formData.email.length > 100) {
    errors.push("Email không được vượt quá 100 ký tự");
  }

  if (!formData.phoneNumber.trim()) {
    errors.push("Số điện thoại không được để trống");
  } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
    errors.push("Số điện thoại không hợp lệ");
  } else if (formData.phoneNumber.length > 15) {
    errors.push("Số điện thoại không được vượt quá 15 ký tự");
  }

  return errors;
};

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
    fullName: "",
    email: "",
    phoneNumber: "",
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

      // Tạo payload cho API
      const apiPayload: CreateHiringManagerRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(),
        companyId: companyId,
      };

      // Gọi API tạo hiring manager
      const response = await UserServices.createHiringManager(apiPayload);
      
      if (!response.isSuccess) {
        // Nếu API trả về message lỗi cụ thể
        const errorMessage = response.errorMessages?.[0] || "Có lỗi xảy ra khi tạo thành viên";
        throw new Error(errorMessage);
      }

      // Gọi callback success (parent sẽ reload data từ API)
      onCreateSuccess();
      
      // Show success message with temporary password info
      toast.success("Tạo thành viên thành công! Mật khẩu tạm thời đã được gửi qua email.", {
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
      });

    } catch (error: any) {
      console.error("Error creating member:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo thành viên");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
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
            Hệ thống sẽ tự động tạo mật khẩu tạm thời và gửi qua email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin cá nhân
            </h3>
            
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                className="mt-1"
                maxLength={100}
                required
              />
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
                  maxLength={100}
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
                  maxLength={15}
                  required
                />
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Thông tin bảo mật
                  </h4>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Hệ thống sẽ tự động tạo mật khẩu tạm thời và gửi qua email cho thành viên mới.</p>
                    <p className="mt-1">Thành viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.</p>
                  </div>
                </div>
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