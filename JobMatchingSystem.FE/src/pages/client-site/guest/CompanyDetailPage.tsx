import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/ui/jobs/JobCard";
import {
  MapPin,
  Globe,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Briefcase
} from "lucide-react";

// Services
import { CompanyServices } from "@/services/company.service";
import { JobServices } from "@/services/job.service";

// Types
import type { Company } from "@/models/company";
import type { JobDetailResponse } from "@/models/job";
import type { JobSearchParams } from "@/models/job";
import { getStatusString } from "@/models/company";

// Utils
import { API_BASE_URL } from "../../../../env.ts";

// -----------------------------------------------------------------
// COMPONENT: CompanyDetailHeader
// -----------------------------------------------------------------

interface CompanyDetailHeaderProps {
  company: Company;
}

const CompanyDetailHeader: React.FC<CompanyDetailHeaderProps> = ({ company }) => {
  const navigate = useNavigate();

  // Helper function to get logo URL
  const getLogoUrl = (logoPath?: string): string | undefined => {
    if (!logoPath) return undefined;
    
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  const handleVisitWebsite = () => {
    if (company.website) {
      window.open(company.website, "_blank");
    }
  };

  const statusBadgeColor = company.status === 1 ? "default" : "secondary";
  const statusText = company.status === 1 ? "Đã được duyệt" : getStatusString(company.status);

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
              {company.logo ? (
                <img
                  src={getLogoUrl(company.logo)}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                <Building2 className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Company Name & Status */}
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {company.name}
                  </h1>
                  <Badge variant={statusBadgeColor} className="flex-shrink-0">
                    {statusText}
                  </Badge>
                </div>

                {/* Location */}
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm lg:text-base truncate">
                      {company.address}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-sm lg:text-base line-clamp-3 mb-4">
                  {company.description}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  {company.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{new URL(company.website).hostname}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.phoneContact && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{company.phoneContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 lg:w-40">
                <Button
                  onClick={() => navigate('/companies')}
                  variant="outline"
                  className="flex-1 lg:w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>

                {company.website && (
                  <Button
                    onClick={handleVisitWebsite}
                    variant="default"
                    className="flex-1 lg:w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------
// COMPONENT: CompanyAbout
// -----------------------------------------------------------------

interface CompanyAboutProps {
  company: Company;
}

const CompanyAbout: React.FC<CompanyAboutProps> = ({ company }) => {
  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Tổng quan công ty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 leading-relaxed">{company.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-semibold text-gray-900">
                  {company.address || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Website</div>
                <div className="font-semibold text-gray-900 truncate">
                  {company.website
                    ? new URL(company.website).hostname
                    : "Chưa cập nhật"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Liên hệ</div>
                <div className="font-semibold text-gray-900">
                  {company.phoneContact || "Chưa cập nhật"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// -----------------------------------------------------------------
// COMPONENT: CompanyJobs
// -----------------------------------------------------------------

interface CompanyJobsProps {
  companyId: number;
}

const CompanyJobs: React.FC<CompanyJobsProps> = ({ companyId }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      
      const apiParams: JobSearchParams = {
        Page: currentPage,
        Size: pageSize,
        Status: 3, // Only opened jobs
        CompanyId: companyId
      };

      const response = await JobServices.getJobsWithPagination(apiParams);
      
      if (response.isSuccess && response.result) {
        setJobs(response.result.items);
        setTotalItems(response.result.pageInfo.totalItem);
        setTotalPages(response.result.pageInfo.totalPage);
      } else {
        setJobs([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      setJobs([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, [companyId, currentPage]);

  const handleJobDetails = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Tin tuyển dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-6"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          Tin tuyển dụng ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có tin tuyển dụng
            </h3>
            <p className="text-gray-600">
              Công ty hiện chưa đăng tin tuyển dụng nào.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.jobId}
                  job={job}
                  onJobDetails={handleJobDetails}
                  className="shadow-sm hover:shadow-md transition-shadow duration-200"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Trước
                </Button>
                
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------
// MAIN COMPONENT: CompanyDetailPage
// -----------------------------------------------------------------

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      if (!id) {
        setError("ID công ty không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await CompanyServices.getCompanyById(id);
        
        if (response?.isSuccess && response?.result) {
          setCompany(response.result);
        } else {
          setError("Không thể tải thông tin công ty");
        }
      } catch (err) {
        setError("Không thể tải thông tin công ty");
        console.error("Error fetching company details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [id]);

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
                {error || "Không tìm thấy thông tin công ty"}
              </h2>
              <p className="text-gray-500 mb-6">
                Có lỗi xảy ra khi tải thông tin công ty hoặc công ty không tồn tại.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/companies')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <CompanyDetailHeader company={company} />

        {/* Company Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 lg:flex lg:h-auto lg:bg-transparent lg:p-0 lg:space-x-2">
              <TabsTrigger value="about" className="lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm lg:data-[state=active]:bg-blue-50 lg:data-[state=active]:text-blue-700 lg:data-[state=active]:border-blue-200">
                Về công ty
              </TabsTrigger>
              <TabsTrigger value="jobs" className="lg:bg-white lg:border lg:border-gray-200 lg:shadow-sm lg:data-[state=active]:bg-blue-50 lg:data-[state=active]:text-blue-700 lg:data-[state=active]:border-blue-200">
                Tin tuyển dụng
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <CompanyAbout company={company} />
            </TabsContent>
            
            <TabsContent value="jobs" className="space-y-6">
              <CompanyJobs companyId={company.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;