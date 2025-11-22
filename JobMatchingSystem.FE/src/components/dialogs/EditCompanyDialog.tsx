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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// Icons
import { Upload, X, Building2, Save, Loader2 } from "lucide-react";

// Services
import { CompanyServices } from "@/services/company.service";

// Types
import type { Company } from "@/models/company";

// ===================== TYPES =====================

interface EditCompanyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  onUpdateSuccess: (updatedCompany: Company) => void;
}

interface CompanyFormData {
  name: string;
  description: string;
  address: string;
  phoneContact: string;
  email: string;
  website: string;
  logo?: File;
}

// ===================== UTILITY FUNCTIONS =====================

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined;
  
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  return `https://localhost:7044${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

const validateForm = (formData: CompanyFormData): string[] => {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push("Tên công ty không được để trống");
  }

  if (formData.phoneContact && !/^[0-9+\-\s()]+$/.test(formData.phoneContact)) {
    errors.push("Số điện thoại không hợp lệ");
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Email không hợp lệ");
  }

  if (formData.website && !formData.website.startsWith('http')) {
    formData.website = `https://${formData.website}`;
  }

  return errors;
};

// ===================== MAIN COMPONENT =====================

export const EditCompanyDialog: React.FC<EditCompanyDialogProps> = ({
  isOpen,
  onOpenChange,
  company,
  onUpdateSuccess,
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CompanyFormData>({
    name: company.name || "",
    description: company.description || "",
    address: company.address || "",
    phoneContact: company.phoneContact || "",
    email: company.email || "",
    website: company.website || "",
  });

  // Handle input changes
  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    setFormData(prev => ({ ...prev, logo: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: undefined }));
    setLogoPreview(null);
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

      // Prepare form data for API
      const updateData = new FormData();
      updateData.append('name', formData.name.trim());
      updateData.append('description', formData.description.trim());
      updateData.append('address', formData.address.trim());
      updateData.append('phoneContact', formData.phoneContact.trim());
      updateData.append('email', formData.email.trim());
      updateData.append('website', formData.website.trim());

      if (formData.logo) {
        updateData.append('logo', formData.logo);
      }

      // Call API to update company
      const response = await CompanyServices.updateCompany(company.id.toString(), updateData);

      if (response.isSuccess && response.result) {
        onUpdateSuccess(response.result);
        toast.success("Cập nhật thông tin công ty thành công!");
      } else {
        throw new Error(response.errorMessages?.[0] || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin công ty");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: company.name || "",
        description: company.description || "",
        address: company.address || "",
        phoneContact: company.phoneContact || "",
        email: company.email || "",
        website: company.website || "",
      });
      setLogoPreview(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Chỉnh sửa thông tin công ty
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin công ty của bạn để thu hút nhiều ứng viên hơn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Section */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Logo công ty
              </Label>
              
              <div className="flex items-center space-x-4">
                {/* Current/Preview Logo */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : company.logo ? (
                    <img
                      src={getLogoUrl(company.logo)}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="flex space-x-2">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-dashed"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Chọn logo
                        </span>
                      </Button>
                    </Label>
                    
                    {(logoPreview || company.logo) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    )}
                  </div>
                  
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG tối đa 5MB. Kích thước khuyến nghị: 400x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="company-name" className="text-sm font-medium text-gray-900">
                Tên công ty <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên công ty"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="company-description" className="text-sm font-medium text-gray-900">
                Mô tả công ty
              </Label>
              <Textarea
                id="company-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Giới thiệu về công ty, văn hóa, giá trị cốt lõi..."
                className="mt-1 min-h-[100px]"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="company-address" className="text-sm font-medium text-gray-900">
                Địa chỉ công ty
              </Label>
              <Textarea
                id="company-address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ đầy đủ của công ty"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-phone" className="text-sm font-medium text-gray-900">
                Số điện thoại liên hệ
              </Label>
              <Input
                id="company-phone"
                type="tel"
                value={formData.phoneContact}
                onChange={(e) => handleInputChange('phoneContact', e.target.value)}
                placeholder="0123 456 789"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="company-email" className="text-sm font-medium text-gray-900">
                Email liên hệ
              </Label>
              <Input
                id="company-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@company.com"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company-website" className="text-sm font-medium text-gray-900">
              Website công ty
            </Label>
            <Input
              id="company-website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://company.com"
              className="mt-1"
            />
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
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};