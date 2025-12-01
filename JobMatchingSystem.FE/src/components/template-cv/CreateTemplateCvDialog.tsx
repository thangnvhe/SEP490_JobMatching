import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TemplateCvServices } from "@/services/template-cv.service";
import { Plus, Upload, FileText, Image as ImageIcon, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CreateTemplateCvDialogProps {
  onSuccess?: () => void;
}

export default function CreateTemplateCvDialog({ onSuccess }: CreateTemplateCvDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    file: null as File | null,
    imageFile: null as File | null,
  });

  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ name: '', file: null, imageFile: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin và chọn file",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validHtmlTypes = ['text/html', 'application/octet-stream'];
    const fileName = formData.file.name.toLowerCase();
    
    if (!fileName.endsWith('.html') && !fileName.endsWith('.htm') && !validHtmlTypes.includes(formData.file.type)) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file HTML (.html hoặc .htm)",
        variant: "destructive",
      });
      return;
    }

    // Validate image file if provided
    if (formData.imageFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validImageTypes.includes(formData.imageFile.type)) {
        toast({
          title: "Lỗi",
          description: "Ảnh xem trước phải là file JPG, PNG hoặc GIF",
          variant: "destructive",
        });
        return;
      }
      
      // Check image size (max 5MB)
      if (formData.imageFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('file', formData.file);
      if (formData.imageFile) {
        formDataToSend.append('imageFile', formData.imageFile);
      }

      await TemplateCvServices.create(formDataToSend);
      toast({
        title: "Thành công",
        description: "Tạo template CV thành công",
      });
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi tạo template CV",
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="default" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm Template</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            Tạo Template CV mới
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Tên Template *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên template CV"
              required
              disabled={loading}
              maxLength={100}
              className="focus:border-blue-500 focus:ring-blue-200"
            />
          </div>

          {/* HTML File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="h-4 w-4 text-green-600" />
              File Template (HTML) *
            </Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Input
                    id="file"
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    required
                    disabled={loading}
                    className="border-0 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                </div>
                {formData.file && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{formData.file.name}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Chỉ chấp nhận file .html
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Image File Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageFile" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-600" />
              Ảnh xem trước (Tùy chọn)
            </Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Input
                    id="imageFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
                    disabled={loading}
                    className="border-0 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 file:cursor-pointer"
                  />
                </div>
                {formData.imageFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{formData.imageFile.name}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Chỉ chấp nhận file ảnh (JPG, PNG, GIF) - Tối đa 5MB
                </p>
              </CardContent>
            </Card>
          </div>

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
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Tạo Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}