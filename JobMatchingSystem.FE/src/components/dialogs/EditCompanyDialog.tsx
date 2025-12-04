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
import { cn } from "@/lib/utils";

// Icons
import { Upload, Building2, Save, Loader2, ImagePlus } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
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

  // Common function to process file
  const processFile = (file: File) => {
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

  // Handle file selection via input
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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


        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Logo Upload Section */}
          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Logo công ty
            </Label>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative group cursor-pointer flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out",
                isDragging 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300",
                (logoPreview || company.logo) && "border-solid border-gray-200 bg-white p-2"
              )}
            >
              {logoPreview || company.logo ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group-hover:opacity-90 transition-opacity">
                  <img
                    src={logoPreview || getLogoUrl(company.logo)}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-700 shadow-lg transform hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    isDragging ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm"
                  )}>
                    {isDragging ? (
                      <Upload className="w-6 h-6 animate-bounce" />
                    ) : (
                      <ImagePlus className="w-6 h-6" />
                    )}
                  </div>
                  <p className="mb-1 text-sm text-gray-700 font-medium">
                    <span className="font-semibold text-blue-600">Nhấn để tải lên</span> hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG hoặc GIF (tối đa 5MB)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Kích thước khuyến nghị: 400x400px
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="col-span-1">
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

          <div className="col-span-1">
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

          {/* Contact Information */}
          <div className="col-span-1">
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

          <div className="col-span-1">
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

          <div className="col-span-2">
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

          <div className="col-span-2">
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

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-end space-x-3 pt-2 border-t">
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