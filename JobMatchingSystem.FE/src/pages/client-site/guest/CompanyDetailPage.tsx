import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Building2,
  Briefcase,
  Camera,
  Info
} from 'lucide-react';
import { CompanyDetailHeader } from '@/components/ui/companies/CompanyDetailHeader';
import { CompanyAbout } from '@/components/ui/companies/CompanyAbout';
import { CompanyJobs } from '@/components/ui/companies/CompanyJobs';
import { CompanyGallery } from '@/components/ui/companies/CompanyGallery';
import { SimilarCompanies } from '@/components/ui/companies/SimilarCompanies';
import { companyService } from '@/services/test-services/companyService';
import type { Company } from '@/models/company';
import { toast } from 'sonner';

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError('ID công ty không hợp lệ');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const companyData = await companyService.getCompanyById(id);
        
        if (!companyData) {
          setError('Không tìm thấy công ty');
          return;
        }

        setCompany(companyData);
        
        // TODO: Check if user is following this company (would come from auth context)
        setIsFollowing(false);
        
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Có lỗi xảy ra khi tải thông tin công ty');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleFollow = async () => {
    if (!company) return;
    
    try {
      const result = await companyService.followCompany(company.id);
      if (result.success) {
        setIsFollowing(true);
        toast.success(result.message);
      } else {
        toast.error('Không thể theo dõi công ty');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleUnfollow = async () => {
    if (!company) return;
    
    try {
      const result = await companyService.unfollowCompany(company.id);
      if (result.success) {
        setIsFollowing(false);
        toast.success(result.message);
      } else {
        toast.error('Không thể bỏ theo dõi công ty');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đang tải thông tin công ty...
              </h2>
              <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Không tìm thấy công ty'}
              </h2>
              <p className="text-gray-500 mb-6">
                Công ty bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button onClick={() => navigate('/companies')}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Xem tất cả công ty
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb/Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {/* Company Header */}
        <div className="mb-8">
          <CompanyDetailHeader
            company={company}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">Giới thiệu</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Việc làm</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Hình ảnh</span>
                </TabsTrigger>
                <TabsTrigger value="similar" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Tương tự</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <CompanyAbout company={company} />
              </TabsContent>

              <TabsContent value="jobs" className="mt-6">
                <CompanyJobs 
                  companyId={company.id}
                  companyName={company.name}
                />
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <CompanyGallery companyName={company.name} />
              </TabsContent>

              <TabsContent value="similar" className="mt-6">
                <SimilarCompanies 
                  currentCompanyId={company.id}
                  currentCompanyName={company.name}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="lg:sticky lg:top-6">
              <div className="space-y-6">
                {/* Company Jobs */}
                <div className="lg:hidden">
                  <CompanyJobs 
                    companyId={company.id}
                    companyName={company.name}
                  />
                </div>

                {/* Similar Companies */}
                <div className="lg:block hidden">
                  <SimilarCompanies 
                    currentCompanyId={company.id}
                    currentCompanyName={company.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;