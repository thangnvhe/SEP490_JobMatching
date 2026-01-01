import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RootState } from '@/store';
import { UserServices } from '@/services/user.service';
import { CVServices } from '@/services/cv.service';
import { User } from '@/models/user';
import { CV, CVValidate } from '@/models/cv';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Star, Trash2, Eye, File, Calendar, CheckCircle, X, AlertCircle, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';


export default function CVManagement() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvName, setCvName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CVValidate | null>(null);
  const [userProfile, setUserProfile] = useState<User>();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get authentication state from Redux
  const authState = useSelector((state: RootState) => state.authState);

  // Get user ID from auth state or user profile
  const userId = userProfile?.id || authState.nameid;

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await UserServices.getUserProfile();

      if (response.isSuccess) {
        setUserProfile(response.result);
      } else {
        toast.error(`Lỗi khi tải thông tin người dùng: ${response.errorMessages?.join(', ') || 'Không xác định'}`);
      }
    } catch {
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchCVs = React.useCallback(async () => {

    try {
      setIsLoading(true);
      const response = await CVServices.getMyCVs();

      if (response.isSuccess) {
        setCvs(response.result || []);
      } else {
        // Only show error if it's not a "not found" scenario
        const isNotFoundError = response.errorMessages?.some(msg =>
          msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no cv')
        );

        if (!isNotFoundError && response.errorMessages?.length) {
          console.error('Error fetching CVs:', response.errorMessages);
          toast.error(`Lỗi: ${response.errorMessages.join(', ')}`);
        }
        setCvs([]);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
      setCvs([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Fetch user profile first
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Fetch CVs when user profile is loaded and userId is available
    if (!isLoadingProfile && userId) {
      fetchCVs();
    }
  }, [isLoadingProfile, userId, fetchCVs]);

  const validateCV = async (file: File) => {
    try {
      setIsValidating(true);
      setValidationResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await CVServices.validate(formData);

      if (response.isSuccess) {
        setValidationResult(response.result);
      } else {
        console.error('Validation failed:', response.errorMessages);
        toast.error(`Lỗi validate CV: ${response.errorMessages?.join(', ')}`);
      }
    } catch (error) {
      console.error('Error validating CV:', error);
      toast.error('Không thể kết nối tới dịch vụ kiểm tra CV. Bạn vẫn có thể upload file.');
    } finally {
      setIsValidating(false);
    }
  };

  const processFile = useCallback((file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Lỗi: Chỉ chấp nhận file PDF, DOCX hoặc DOC");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Lỗi: File không được vượt quá 10MB");
      return;
    }

    setSelectedFile(file);
    if (!cvName) {
      const nameWithoutExt = file.name.replace(/\.(pdf|docx|doc)$/i, '');
      setCvName(nameWithoutExt);
    }

    validateCV(file);
  }, [cvName]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleUpload = async () => {
    if (!selectedFile || !cvName.trim()) {
      toast.error("Lỗi: Vui lòng chọn file và nhập tên CV");
      return;
    }

    if (!userId) {
      toast.error("Lỗi: Không thể xác định người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    // Kiểm tra validation result - chỉ cho upload nếu AI xác nhận đây là CV
    if (validationResult?.is_cv === false) {
      toast.error("Lỗi: File này không được AI xác nhận là CV hợp lệ. Vui lòng chọn file CV khác.");
      return;
    }

    // Cảnh báo nếu chưa có validation result
    if (!validationResult) {
      const confirmUpload = confirm("Chưa thể xác thực file này bằng AI. Bạn có chắc chắn muốn upload không?");
      if (!confirmUpload) {
        return;
      }
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', cvName.trim());
      formData.append('userId', userId.toString());

      // CVServices.create expects an object of type Omit<CV, 'id'> but we need to send FormData for file upload.
      // Cast FormData to the expected type to satisfy the type checker while preserving runtime behavior.
      const response = await CVServices.create(formData as unknown as Omit<CV, 'id'>);

      if (response.isSuccess) {
        const msg = typeof response.result === 'string' ? response.result : 'CV đã được upload thành công';
        toast.success(`Thành công: ${msg}`);

        // Reset form
        setSelectedFile(null);
        setCvName('');
        setValidationResult(null);
        setIsUploadDialogOpen(false);

        // Refresh CV list
        fetchCVs();
      } else {
        const errorMsg = response.errorMessages?.join(', ') || 'Không thể upload CV';
        console.error('Upload error:', response.errorMessages);
        toast.error(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error("Lỗi: Không thể upload CV. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (cvId: number) => {
    try {
      const response = await CVServices.setPrimary(cvId.toString());

      if (response.isSuccess) {
        const msg = typeof response.result === 'string' ? response.result : 'Đã đặt làm CV chính';
        toast.success(`Thành công: ${msg}`);
        fetchCVs();
      } else {
        const errorMsg = response.errorMessages?.join(', ') || 'Không thể đặt làm CV chính';
        console.error('Set primary error:', response.errorMessages);
        toast.error(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error setting primary CV:', error);
      toast.error("Lỗi: Không thể đặt làm CV chính. Vui lòng thử lại.");
    }
  };

  const handleDeleteClick = (cvId: number) => {
    setCvToDelete(cvId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cvToDelete) return;

    try {
      const response = await CVServices.delete(cvToDelete.toString());

      if (response.isSuccess) {
        toast.success("Thành công: CV đã được xóa");
        fetchCVs();
      } else {
        const errorMsg = response.errorMessages?.join(', ') || 'Không thể xóa CV';
        toast.error(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error("Lỗi: Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setDeleteDialogOpen(false);
      setCvToDelete(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDownload = (cv: CV) => {
    const link = document.createElement('a');
    link.href = `${cv.fileUrl}`;
    link.download = cv.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (cv: CV) => {
    window.open(`${cv.fileUrl}`, '_blank');
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Skeleton */}
          <div className="px-4 md:px-6">
            <div className="space-y-1 mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-96 max-w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-3 lg:px-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CV List Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="group relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="h-14 w-14 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoadingProfile || isLoading) {
    return <LoadingSkeleton />;
  }

  // Show error if user is not authenticated or no user ID
  if (!authState.isAuthenticated || !userId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mx-auto w-fit">
              <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Không thể truy cập</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vui lòng đăng nhập để xem danh sách CV của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-6 min-h-screen bg-gray-50/30">
      {/* Header với Title/Subtitle bên trái và Button bên phải */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý CV</h1>
          <p className="text-muted-foreground">Quản lý và tải lên CV của bạn để ứng tuyển vào các vị trí công việc</p>
        </div>
        
        <Button 
          size="default"
          onClick={() => setIsUploadDialogOpen(true)}
          className="shrink-0"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload CV Mới
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* CV Stats - Modern Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-white hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                  <FileText className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                </div>
                <span className="text-2xl font-bold">{cvs.length}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium leading-none tracking-tight">Tổng số CV</h3>
                <p className="text-sm text-muted-foreground">
                  Đã tải lên hệ thống
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-current" />
                </div>
                <span className="text-2xl font-bold">{cvs.filter(cv => cv.isPrimary).length}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium leading-none tracking-tight">CV Chính</h3>
                <p className="text-sm text-muted-foreground">
                  Đang được sử dụng
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                  <File className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                </div>
                <span className="text-2xl font-bold">{cvs.filter(cv => !cv.isPrimary).length}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium leading-none tracking-tight">CV Phụ</h3>
                <p className="text-sm text-muted-foreground">
                  Lưu trữ dự phòng
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CV List - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {cvs.length === 0 ? (
            <Card className="col-span-full border-dashed border-2 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-white p-4 shadow-sm mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chưa có CV nào</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Upload CV ngay để nhà tuyển dụng có thể tìm thấy bạn và bắt đầu ứng tuyển.
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  Upload CV đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            cvs.map((cv) => (
              <Card 
                key={cv.id}
                className={`group relative flex flex-col overflow-hidden border transition-all hover:shadow-lg hover:border-blue-200 ${
                  cv.isPrimary ? 'border-amber-200 bg-amber-50/30' : 'bg-white'
                }`}
              >
                {/* Primary Indicator Strip */}
                {cv.isPrimary && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 z-10" />
                )}

                <div className="p-4 flex flex-1 items-start gap-4">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-lg bg-white border shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {cv.fileName.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="h-6 w-6 text-red-500" />
                    ) : (
                      <FileText className="h-6 w-6 text-blue-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate" title={cv.name}>
                        {cv.name}
                      </h3>
                      {cv.isPrimary && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>CV Chính</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate" title={cv.fileName}>
                      {cv.fileName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Vừa xong
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="uppercase">{cv.fileName.split('.').pop()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Luôn nằm ngang */}
                <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2 border-t bg-gray-50/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handlePreview(cv)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem trước</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleDownload(cv)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Tải xuống</span>
                      </DropdownMenuItem>
                      {!cv.isPrimary && (
                        <DropdownMenuItem onClick={() => handleSetPrimary(cv.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          <span>Đặt làm CV chính</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(cv.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Xóa CV</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Dialog Upload CV */}
        <Dialog 
          open={isUploadDialogOpen} 
          onOpenChange={(open) => {
            setIsUploadDialogOpen(open);
            if (!open) {
              setSelectedFile(null);
              setCvName('');
              setValidationResult(null);
              setIsDragging(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      Upload CV mới
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Chọn file PDF, DOCX hoặc DOC để upload CV của bạn. File phải nhỏ hơn 10MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cvName" className="text-sm font-semibold">Tên CV</Label>
                      <Input
                        id="cvName"
                        value={cvName}
                        onChange={(e) => setCvName(e.target.value)}
                        placeholder="Ví dụ: CV Backend Developer"
                        className="h-11"
                      />
                    </div>
                    
                    {/* Drag & Drop Zone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Chọn file CV</Label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
                          ${isDragging 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                          }
                        `}
                      >
                        <input
                          id="cvFile"
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                            isDragging 
                              ? 'bg-blue-100 dark:bg-blue-900/30' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Upload className={`h-8 w-8 transition-colors ${
                              isDragging 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {isDragging ? 'Thả file vào đây' : 'Kéo thả file vào đây hoặc click để chọn'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PDF, DOCX, DOC (tối đa 10MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected File Display */}
                    {selectedFile && (
                      <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 shrink-0">
                              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                <span className="truncate">{selectedFile.name}</span>
                              </div>
                              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              setSelectedFile(null);
                              setValidationResult(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Validation Loading */}
                    {isValidating && (
                      <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Đang kiểm tra CV bằng AI...
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                              Vui lòng đợi trong giây lát
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validation Result */}
                    {validationResult && (
                      <div className={`rounded-lg border-2 p-4 animate-in fade-in slide-in-from-top-2 ${
                        validationResult.is_cv
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      }`}>
                        <div className="flex items-start gap-3">
                          {validationResult.is_cv ? (
                            <>
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                                  ✅ Đây là CV hợp lệ
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  {validationResult.reason}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                                  ⚠️ File này không phải CV hợp lệ
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  {validationResult.reason}
                                </p>
                                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-md border-l-4 border-red-500">
                                  <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                                    📋 Hướng dẫn: Vui lòng chọn file CV chứa thông tin cá nhân (tên, email, kinh nghiệm, học vấn...) để tiếp tục upload.
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        setSelectedFile(null);
                        setCvName('');
                        setValidationResult(null);
                      }}
                      disabled={isUploading}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={
                        !selectedFile ||
                        !cvName.trim() ||
                        isUploading ||
                        isValidating ||
                        (validationResult?.is_cv === false)
                      }
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Đang upload...
                        </>
                      ) : isValidating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Đang kiểm tra...
                        </>
                      ) : (validationResult?.is_cv === false) ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          File không hợp lệ
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">Xác nhận xóa CV</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Bạn có chắc chắn muốn xóa CV này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa CV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}