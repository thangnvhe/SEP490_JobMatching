import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Edit,
  Camera,
  Briefcase,
  CheckCircle,
} from "lucide-react";

// Services
import { CompanyServices } from "@/services/company.service";

// Types
import type { Company } from "@/models/company";

// Components
import { EditCompanyDialog } from "@/components/dialogs/EditCompanyDialog";

// ===================== MAIN COMPONENT =====================

const CompanyProfile = () => {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);


  // ===================== DATA FETCHING =====================

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CompanyServices.getCompanyMe();
      setCompany(response.result);
    } catch (err) {
      console.error("Error loading company profile:", err);
      setError("Có lỗi xảy ra khi tải thông tin công ty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  // ===================== EVENT HANDLERS =====================

  const handleEditCompany = () => {
    setShowEditDialog(true);
  };

  const handleUpdateSuccess = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setShowEditDialog(false);
    toast.success("Cập nhật thông tin công ty thành công!");
  };

  const handleNavigateToMembers = () => {
    navigate("/recruiter/company/members");
  };

  const handleReload = () => {
    window.location.reload();
  };

  // ===================== RENDER: LOADING STATE =====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 pb-20">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="container mx-auto px-4 -mt-20 relative">
          <div className="flex flex-col gap-6">
            <div className="w-32 h-32 rounded-2xl bg-gray-200 border-4 border-white animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== RENDER: ERROR STATE =====================

  if (error || !company) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không thể tải thông tin
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Thông tin công ty không tồn tại hoặc đã bị xóa."}
          </p>
          <Button
            onClick={handleReload}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ===================== RENDER: MAIN CONTENT =====================

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans">
      {/* Banner Section */}
      <div className="h-48 md:h-60 w-full bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* You could add a cover image feature here in the future */}
        <div className="absolute bottom-4 right-4 z-10">
          {/* Placeholder for Cover Edit Button if needed */}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Info - Overlapping Banner */}
        <div className="relative -mt-20 mb-8 flex flex-col md:flex-row gap-6 items-end">
          {/* Logo Box */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-white shadow-md shrink-0 overflow-hidden flex items-center justify-center relative z-10">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage
                  src={company.logo}
                  alt={company.name}
                  className="object-contain p-2 w-full h-full"
                />
                <AvatarFallback className="rounded-none bg-white">
                  <Building2 className="w-16 h-16 text-gray-300" />
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Camera Icon for Logo Edit Hint */}
            <div className="absolute -bottom-2 -right-2 z-20 bg-blue-600 text-white p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-blue-700 transition-colors" onClick={handleEditCompany}>
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 pb-2 min-w-0 space-y-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight truncate leading-tight mb-2">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-600">

                  {company.website && (
                    <>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {new URL(company.website).hostname}
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  onClick={handleEditCompany}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tin tuyển dụng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleNavigateToMembers}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Thành viên</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Đã tuyển</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden h-full">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Giới thiệu chung
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-stone max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {company.description ? (
                    company.description
                  ) : (
                    <div className="text-center py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Edit className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có mô tả về công ty</p>
                      <p className="text-gray-400 text-sm mb-4">Hãy thêm mô tả để ứng viên hiểu rõ hơn về bạn</p>
                      <Button variant="outline" onClick={handleEditCompany} size="sm">Thêm mô tả</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white sticky top-6">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle className="text-base font-semibold text-gray-900">Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Address */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Địa chỉ</p>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {company.address || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Website */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Website</p>
                    <p className="text-sm text-gray-900 truncate">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {new URL(company.website).hostname}
                        </a>
                      ) : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Email */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm text-gray-900 truncate">
                      {company.email || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Phone */}
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Điện thoại</p>
                    <p className="text-sm text-gray-900">
                      {company.phoneContact || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Button variant="outline" className="w-full" onClick={handleNavigateToMembers}>
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    Quản lý thành viên
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        company={company}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default CompanyProfile;
