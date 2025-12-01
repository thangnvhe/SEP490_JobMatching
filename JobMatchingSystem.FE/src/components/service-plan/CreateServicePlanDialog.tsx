import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ServicePlanServices } from "@/services/service-plan.service";
import { Plus, CheckCircle, X, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CreateServicePlanRequest } from "@/models/service-plan";

interface CreateServicePlanDialogProps {
  onSuccess?: () => void;
}

export default function CreateServicePlanDialog({ onSuccess }: CreateServicePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateServicePlanRequest>({
    name: '',
    description: '',
    price: 0,
    jobPostAdditional: undefined,
    highlightJobDays: undefined,
    highlightJobDaysCount: undefined,
    extensionJobDays: undefined,
    extensionJobDaysCount: undefined,
    cvSaveAdditional: undefined,
  });

  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      jobPostAdditional: undefined,
      highlightJobDays: undefined,
      highlightJobDaysCount: undefined,
      extensionJobDays: undefined,
      extensionJobDaysCount: undefined,
      cvSaveAdditional: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await ServicePlanServices.create({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      toast({
        title: "Thành công",
        description: "Tạo gói dịch vụ thành công",
      });
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi tạo gói dịch vụ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const handleNumberChange = (field: keyof CreateServicePlanRequest, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="default" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Gói Dịch vụ</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            Tạo Gói Dịch vụ mới
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Tên gói *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên gói dịch vụ"
                    required
                    disabled={loading}
                    maxLength={100}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                    Giá (VNĐ) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => handleNumberChange('price', e.target.value)}
                    placeholder="Nhập giá gói"
                    required
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Mô tả *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả gói dịch vụ"
                  required
                  disabled={loading}
                  maxLength={500}
                  rows={3}
                  className="focus:border-blue-500 focus:ring-blue-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tính năng gói</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobPostAdditional" className="text-sm font-semibold text-gray-700">
                    Số bài đăng thêm
                  </Label>
                  <Input
                    id="jobPostAdditional"
                    type="number"
                    min="0"
                    value={formData.jobPostAdditional || ''}
                    onChange={(e) => handleNumberChange('jobPostAdditional', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvSaveAdditional" className="text-sm font-semibold text-gray-700">
                    Số CV lưu thêm
                  </Label>
                  <Input
                    id="cvSaveAdditional"
                    type="number"
                    min="0"
                    value={formData.cvSaveAdditional || ''}
                    onChange={(e) => handleNumberChange('cvSaveAdditional', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlightJobDays" className="text-sm font-semibold text-gray-700">
                    Số ngày nổi bật
                  </Label>
                  <Input
                    id="highlightJobDays"
                    type="number"
                    min="0"
                    value={formData.highlightJobDays || ''}
                    onChange={(e) => handleNumberChange('highlightJobDays', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlightJobDaysCount" className="text-sm font-semibold text-gray-700">
                    Số lần nổi bật
                  </Label>
                  <Input
                    id="highlightJobDaysCount"
                    type="number"
                    min="0"
                    value={formData.highlightJobDaysCount || ''}
                    onChange={(e) => handleNumberChange('highlightJobDaysCount', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extensionJobDays" className="text-sm font-semibold text-gray-700">
                    Số ngày gia hạn
                  </Label>
                  <Input
                    id="extensionJobDays"
                    type="number"
                    min="0"
                    value={formData.extensionJobDays || ''}
                    onChange={(e) => handleNumberChange('extensionJobDays', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extensionJobDaysCount" className="text-sm font-semibold text-gray-700">
                    Số lần gia hạn
                  </Label>
                  <Input
                    id="extensionJobDaysCount"
                    type="number"
                    min="0"
                    value={formData.extensionJobDaysCount || ''}
                    onChange={(e) => handleNumberChange('extensionJobDaysCount', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                    className="focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="hover:bg-gray-50 transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 min-w-[120px]"
            >
              {loading ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Tạo Gói
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}