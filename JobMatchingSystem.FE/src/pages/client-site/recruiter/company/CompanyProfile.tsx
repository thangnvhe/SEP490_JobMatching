import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { RootState } from "@/store";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  XCircle,
  AlertTriangle,
} from "lucide-react";

// Services
import { UserServices } from "@/services/user.service";
import { CompanyServices } from "@/services/company.service";

// Types
import type { Company } from "@/models/company";

// Components
import { EditCompanyDialog } from "@/components/dialogs/EditCompanyDialog";

// ===================== UTILITY FUNCTIONS =====================

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined;
  
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  return `https://localhost:7044${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

const getCompanyStatusBadge = (status: number | string) => {
  // Convert to number if string
  const statusNum = typeof status === 'string' ? parseInt(status) : status;
  
  switch (statusNum) {
    case 0:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Đang chờ duyệt
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Đã duyệt
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Bị từ chối
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          Không xác định
        </Badge>
      );
  }
};

// ===================== COMPONENTS =====================

interface CompanyHeaderProps {
  company: Company;
  onEdit: () => void;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company, onEdit }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Company Info */}
          <div className="flex-1">
            <div className="flex items-start space-x-6 mb-6">
              {/* Company Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                  {company.logo ? (
                    <img
                      src={getLogoUrl(company.logo)}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {company.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Company Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {company.name}
                  </h1>
                  {getCompanyStatusBadge(company.status || 0)}
                </div>

                <div className="space-y-2 text-gray-600">
                  {company.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{company.address}</span>
                    </div>
                  )}
                  
                  {company.phoneContact && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{company.phoneContact}</span>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{company.email}</span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Description */}
            {company.description && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Giới thiệu công ty</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {company.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Section - Edit Button */}
          <div className="lg:w-48 flex-shrink-0">
            <Button
              onClick={onEdit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
              size="lg"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa thông tin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CompanyStatsProps {
  company: Company;
}

const CompanyStats: React.FC<CompanyStatsProps> = ({ company: _company }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tin tuyển dụng</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate('/recruiter/company/members')}
      >
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Thành viên</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã tuyển</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface CompanyInfoDetailProps {
  company: Company;
}

const CompanyInfoDetail: React.FC<CompanyInfoDetailProps> = ({ company }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 text-blue-600 mr-2" />
            Thông tin công ty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Tên công ty</label>
            <p className="text-gray-900 font-medium">{company.name}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
            <p className="text-gray-900">{company.address || "Chưa cập nhật"}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-gray-500">Trạng thái</label>
            <div className="mt-1">
              {getCompanyStatusBadge(company.status || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Phone className="w-5 h-5 text-green-600 mr-2" />
            Thông tin liên hệ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
            <p className="text-gray-900">{company.phoneContact || "Chưa cập nhật"}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-gray-500">Email liên hệ</label>
            <p className="text-gray-900">{company.email || "Chưa cập nhật"}</p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-gray-500">Website</label>
            {company.website ? (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline block"
              >
                {company.website}
              </a>
            ) : (
              <p className="text-gray-900">Chưa cập nhật</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================

const CompanyProfile: React.FC = () => {
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  
  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Load company profile data
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!authState.isAuthenticated) {
        setError("Vui lòng đăng nhập để xem thông tin công ty");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Get current user info to get companyId
        const userResponse = await UserServices.getUserProfile();
        
        if (!userResponse.isSuccess || !userResponse.result) {
          setError("Không thể tải thông tin người dùng");
          setLoading(false);
          return;
        }

        const userData = userResponse.result;

        // Check if user has companyId
        if (!userData.companyId) {
          setError("Tài khoản chưa được liên kết với công ty nào");
          setLoading(false);
          return;
        }

        // 2. Get company details using companyId
        const companyResponse = await CompanyServices.getCompanyById(userData.companyId.toString());
        
        if (!companyResponse.isSuccess || !companyResponse.result) {
          setError("Không thể tải thông tin công ty");
          setLoading(false);
          return;
        }

        setCompany(companyResponse.result);
        setLoading(false);

      } catch (error) {
        console.error("Error loading company profile:", error);
        setError("Có lỗi xảy ra khi tải thông tin công ty");
        setLoading(false);
      }
    };

    loadCompanyProfile();
  }, [authState.isAuthenticated]);

  // Handle edit company
  const handleEditCompany = () => {
    setShowEditDialog(true);
  };

  // Handle update company success
  const handleUpdateSuccess = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setShowEditDialog(false);
    toast.success("Cập nhật thông tin công ty thành công!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="animate-pulse">
                <div className="flex space-x-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="animate-pulse space-y-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không thể tải thông tin công ty
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Thông tin công ty không tồn tại hoặc đã bị xóa."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hồ sơ công ty</h1>
              <p className="text-gray-600 mt-2">
                Quản lý và cập nhật thông tin công ty của bạn
              </p>
            </div>
          </div>

          {/* Company Header */}
          <CompanyHeader 
            company={company} 
            onEdit={handleEditCompany}
          />

          {/* Company Stats */}
          <CompanyStats company={company} />

          {/* Company Details */}
          <CompanyInfoDetail company={company} />
        </div>
      </div>

      {/* Edit Company Dialog */}
      {company && (
        <EditCompanyDialog
          isOpen={showEditDialog}
          onOpenChange={setShowEditDialog}
          company={company}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default CompanyProfile;