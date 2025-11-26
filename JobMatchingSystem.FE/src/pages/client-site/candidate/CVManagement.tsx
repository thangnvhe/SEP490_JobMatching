import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RootState } from '@/store';
import { UserServices } from '@/services/user.service';
import { CVServices } from '@/services/cv.service';
import { User } from '@/models/user';
import { CV, CVValidate } from '@/models/cv';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Star, Trash2, Eye, File, Calendar, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../../env.ts';


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
          alert(`Lỗi: ${response.errorMessages.join(', ')}`);
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
        alert(`Lỗi validate CV: ${response.errorMessages?.join(', ')}`);
      }
    } catch (error) {
      console.error('Error validating CV:', error);
      alert('Không thể kết nối tới dịch vụ kiểm tra CV. Bạn vẫn có thể upload file.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Lỗi: Chỉ chấp nhận file PDF");
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Lỗi: File không được vượt quá 5MB");
        return;
      }

      setSelectedFile(file);
      if (!cvName) {
        setCvName(file.name.replace('.pdf', ''));
      }

      // Validate CV with AI
      validateCV(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !cvName.trim()) {
      alert("Lỗi: Vui lòng chọn file và nhập tên CV");
      return;
    }

    if (!userId) {
      alert("Lỗi: Không thể xác định người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    // Kiểm tra validation result - chỉ cho upload nếu AI xác nhận đây là CV
    if (validationResult?.is_cv === false) {
      alert("Lỗi: File này không được AI xác nhận là CV hợp lệ. Vui lòng chọn file CV khác.");
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
        alert(`Thành công: ${msg}`);

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
        alert(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert("Lỗi: Không thể upload CV. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (cvId: number) => {
    try {
      const response = await CVServices.setPrimary(cvId.toString());

      if (response.isSuccess) {
        const msg = typeof response.result === 'string' ? response.result : 'Đã đặt làm CV chính';
        alert(`Thành công: ${msg}`);
        fetchCVs();
      } else {
        const errorMsg = response.errorMessages?.join(', ') || 'Không thể đặt làm CV chính';
        console.error('Set primary error:', response.errorMessages);
        alert(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error setting primary CV:', error);
      alert("Lỗi: Không thể đặt làm CV chính. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (cvId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CV này?')) {
      return;
    }

    try {
      const response = await CVServices.delete(cvId.toString());

      if (response.isSuccess) {
        alert("Thành công: CV đã được xóa");
        fetchCVs();
      } else {
        const errorMsg = response.errorMessages?.join(', ') || 'Không thể xóa CV';
        alert(`Lỗi: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert("Lỗi: Không thể kết nối đến server. Vui lòng thử lại.");
    }
  };

  const handleDownload = (cv: CV) => {
    const link = document.createElement('a');
    link.href = `https://localhost:7044/${cv.fileUrl}`;
    link.download = cv.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (cv: CV) => {
    window.open(`${API_BASE_URL}${cv.fileUrl}`, '_blank');
  };

  if (isLoadingProfile || isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <FileText className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isLoadingProfile ? "Đang tải thông tin người dùng" : "Đang tải danh sách CV"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Vui lòng đợi trong giây lát...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
            <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
            <div className="relative flex items-center justify-between px-4 py-8 lg:px-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Quản lý CV
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      Quản lý và tải lên CV của bạn để ứng tuyển vào các vị trí công việc.
                    </p>
                  </div>
                </div>
              </div>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload CV Mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Upload CV mới
                    </DialogTitle>
                    <DialogDescription>
                      Chọn file PDF để upload CV của bạn. File phải nhỏ hơn 5MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cvName" className="text-sm font-medium">Tên CV</Label>
                      <Input
                        id="cvName"
                        value={cvName}
                        onChange={(e) => setCvName(e.target.value)}
                        placeholder="Ví dụ: CV Backend Developer"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvFile" className="text-sm font-medium">Chọn file CV (PDF)</Label>
                      <div className="relative">
                        <Input
                          id="cvFile"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="rounded-lg border bg-green-50 p-3">
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">File đã chọn:</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}

                    {/* CV Validation Result */}
                    {isValidating && (
                      <div className="rounded-lg border bg-blue-50 p-3">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          <span className="font-medium">Đang kiểm tra CV bằng AI...</span>
                        </div>
                      </div>
                    )}

                    {validationResult && (
                      <div className={`rounded-lg border p-3 ${validationResult.is_cv
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 text-sm">
                          {validationResult.is_cv ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">✅ Đây là CV hợp lệ</span>
                            </>
                          ) : (
                            <>
                              <div className="h-4 w-4 rounded-full bg-red-600 flex items-center justify-center">
                                <span className="text-white text-xs">!</span>
                              </div>
                              <span className="font-medium text-red-800">⚠️ File này không phải CV hợp lệ</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1">
                          {validationResult.reason}
                        </p>
                        {!validationResult.is_cv && (
                          <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-500">
                            <p className="text-xs text-red-800 font-medium">
                              📋 Hướng dẫn: Vui lòng chọn file CV chứa thông tin cá nhân (tên, email, kinh nghiệm, học vấn...) để tiếp tục upload.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
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
                      className={`${(validationResult?.is_cv === false)
                        ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
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
                          <span className="text-xs">❌ File không hợp lệ</span>
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
          </div>

          {/* CV Stats */}
          <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-3 lg:px-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Tổng số CV</CardTitle>
                <div className="rounded-full bg-white/20 p-2">
                  <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cvs.length}</div>
                <p className="text-xs text-blue-100 mt-1">
                  CV trong hệ thống
                </p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">CV chính</CardTitle>
                <div className="rounded-full bg-white/20 p-2">
                  <Star className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {cvs.filter(cv => cv.isPrimary).length}
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  CV được ưu tiên
                </p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-100">CV phụ</CardTitle>
                <div className="rounded-full bg-white/20 p-2">
                  <File className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {cvs.filter(cv => !cv.isPrimary).length}
                </div>
                <p className="text-xs text-violet-100 mt-1">
                  CV dự phòng
                </p>
              </CardContent>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            </Card>
          </div>

          {/* CV List */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4">
              {cvs.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-6">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chưa có CV nào</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                      Bạn chưa upload CV nào. Hãy upload CV đầu tiên để bắt đầu ứng tuyển và tăng cơ hội tìm được việc làm phù hợp!
                    </p>
                    <Button
                      onClick={() => setIsUploadDialogOpen(true)}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload CV đầu tiên
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                cvs.map((cv) => (
                  <Card key={cv.id} className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                            <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                {cv.name}
                              </CardTitle>
                              {cv.isPrimary && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                                  <Star className="h-3 w-3 mr-1" />
                                  CV Chính
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {cv.fileName}
                            </CardDescription>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>Tải lên gần đây</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(cv)}
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem trước
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(cv)}
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-900/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Tải xuống
                        </Button>

                        {!cv.isPrimary && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetPrimary(cv.id)}
                            className="hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Đặt làm CV chính
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(cv.id)}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-900/20 ml-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}