import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/ui/jobs/JobCard";

// Icons
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Heart,
  AlertTriangle,
  Building,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  Eye,
} from "lucide-react";

// Services
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { ReportService } from "@/services/report.service";

// Components
import { ReportJobDialog } from "@/components/dialogs/ReportJobDialog";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";

// Types
import type { JobDetailResponse } from "@/models/job";
import type { Company } from "@/models/company";
import type { CreateReportRequest } from "@/models/report";

// ===================== UTILITY FUNCTIONS =====================

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ngày trước`;
  }
};

const formatSalary = (salaryMin?: number, salaryMax?: number) => {
  if (!salaryMin && !salaryMax) return "Thương lượng";

  const toMillions = (value?: number) => {
    if (!value) return undefined;
    const m = value / 1_000_000;
    return Number.isInteger(m) ? `${m}` : `${m.toFixed(1)}`;
  };

  const minM = toMillions(salaryMin);
  const maxM = toMillions(salaryMax);

  if (minM && maxM) {
    if (minM === maxM) return `${minM} triệu VND`;
    return `${minM} - ${maxM} triệu VND`;
  }

  if (minM) return `Từ ${minM} triệu VND`;
  if (maxM) return `Lên đến ${maxM} triệu VND`;

  return "Thương lượng";
};

const getJobTypeDisplay = (jobType: string) => {
  const jobTypeMap: { [key: string]: string } = {
    'FullTime': 'Toàn thời gian',
    'Parttime': 'Bán thời gian',
    'Remote': 'Làm từ xa',
    'Other': 'Khác'
  };
  return jobTypeMap[jobType] || jobType;
};

const formatExperience = (experienceYear?: number) => {
  if (!experienceYear || experienceYear < 0) {
    return "Không yêu cầu";
  }
  if (experienceYear === 0) {
    return "Không yêu cầu";
  }
  if (experienceYear === 1) {
    return "1 năm";
  }
  return `${experienceYear} năm`;
};

const cleanLocation = (location: string) => {
  const prefixesToRemove = [
    'Địa điểm làm việc\n',
    'Địa điểm làm việc ',
    'Địa chỉ làm việc\n',
    'Địa chỉ làm việc ',
  ];
  
  let cleanedLocation = location;
  prefixesToRemove.forEach(prefix => {
    if (cleanedLocation.startsWith(prefix)) {
      cleanedLocation = cleanedLocation.substring(prefix.length);
    }
  });
  
  return cleanedLocation.trim();
};

const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined;
  
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  return `https://localhost:7044${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

// ===================== COMPONENTS =====================

interface JobDetailHeaderProps {
  job: JobDetailResponse;
  company?: Company;
  onBack: () => void;
  onApply: () => void;
  onSave?: () => void;
  onReport?: () => void;
  isSaved?: boolean;
  authState: any; // Add authState prop
  className?: string;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  company,
  onBack,
  onApply,
  onSave,
  onReport,
  isSaved = false,
  authState,
  className = "",
}) => {
  return (
    <Card className={`bg-white border-none shadow-sm ${className}`}>
      <CardContent className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Job Info */}
          <div className="flex-1">
            <div className="flex items-start space-x-4 mb-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {company?.logo ? (
                  <img
                    src={getLogoUrl(company.logo)}
                    alt={company.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {company?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Title and Company */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {job.status}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="text-lg text-gray-700 font-medium">
                    {company?.name || `Company ${job.companyId}`}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Đăng {formatTimeAgo(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{job.viewsCount} lượt xem</span>
                  </div>
                  {job.expiredAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Hết hạn: {new Date(job.expiredAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Info Tags */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                <MapPin className="h-3 w-3 mr-1" />
                {cleanLocation(job.location)}
              </Badge>
              
              <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                <Briefcase className="h-3 w-3 mr-1" />
                {getJobTypeDisplay(job.jobType)}
              </Badge>
              
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                <Users className="h-3 w-3 mr-1" />
                Kinh nghiệm: {formatExperience(job.experienceYear)}
              </Badge>
              
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </Badge>
            </div>

            {/* Technologies/Taxonomies */}
            {job.taxonomies && job.taxonomies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.taxonomies.map((taxonomy) => (
                  <Badge
                    key={taxonomy.id}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800"
                  >
                    {taxonomy.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex flex-col space-y-3 lg:w-48">
            <Button
              onClick={onApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-3 h-12"
            >
              Ứng tuyển ngay
            </Button>

            <div className="flex space-x-2">
              {(authState?.isAuthenticated && authState?.role?.toLowerCase() === 'candidate') && onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className={`flex-1 border-gray-300 ${
                    isSaved
                      ? "text-red-600 border-red-300 bg-red-50"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`}
                  />
                  {isSaved ? "Đã lưu" : "Lưu"}
                </Button>
              )}

              {onReport && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onReport}
                  className="flex-1 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Báo cáo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface JobDescriptionProps {
  job: JobDetailResponse;
  className?: string;
}

const JobDescription: React.FC<JobDescriptionProps> = ({
  job,
  className = "",
}) => {
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, index) => (
      <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
        {line}
      </p>
    ));
  };

  const renderListItems = (text: string) => {
    const lines = text.split("\n").filter(line => line.trim());
    return (
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 leading-relaxed">{line.trim()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Mô tả công việc
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          {renderFormattedText(job.description)}
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Yêu cầu công việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderListItems(job.requirements)}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Quyền lợi & Phúc lợi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderFormattedText(job.benefits)}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface CompanyInfoProps {
  company: Company;
  className?: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  company,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Building className="h-5 w-5 text-emerald-600" />
          <span>Về công ty</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Header */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {company.logo ? (
              <img
                src={getLogoUrl(company.logo)}
                alt={company.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xl">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {company.name}
            </h3>
            {company.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {company.description}
              </p>
            )}
          </div>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 gap-4">
          {company.address && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium text-gray-900" title={company.address}>
                  {company.address.length > 50 
                    ? `${company.address.substring(0, 50)}...` 
                    : company.address
                  }
                </p>
              </div>
            </div>
          )}



          {company.phoneContact && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Điện thoại</p>
                <p className="font-medium text-gray-900">{company.phoneContact}</p>
              </div>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
};

interface SimilarJobsProps {
  jobs: JobDetailResponse[];
  currentJobId: number;
  loading?: boolean;
  className?: string;
}

const SimilarJobs: React.FC<SimilarJobsProps> = ({
  jobs,
  currentJobId,
  loading = false,
  className = "",
}) => {
  const navigate = useNavigate();
  
  const similarJobs = jobs.filter((job) => job.jobId !== currentJobId);

  const handleJobDetails = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <span>Việc làm liên quan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
              >
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

  if (similarJobs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <span>Việc làm liên quan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có việc làm liên quan
            </h3>
            <p className="text-gray-600">
              Hiện tại chưa có việc làm tương tự.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-emerald-600" />
          <span>Việc làm liên quan</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {similarJobs.slice(0, 3).map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onJobDetails={handleJobDetails}
              className="shadow-sm hover:shadow-md transition-shadow duration-200"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ===================== MAIN COMPONENT =====================

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);

  // State management
  const [job, setJob] = useState<JobDetailResponse | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarJobsLoading, setSimilarJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Dialog states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Load job details and related data
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!id) {
        setError("Job ID không được cung cấp");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load job details
        const jobResponse = await JobServices.getJobById(id);

        if (!jobResponse.isSuccess || !jobResponse.result) {
          setError("Không tìm thấy việc làm");
          setLoading(false);
          return;
        }

        const jobData = jobResponse.result;
        setJob(jobData);

        // Load company details
        try {
          const companyResponse = await CompanyServices.getCompanyById(jobData.companyId.toString());
          if (companyResponse.isSuccess && companyResponse.result) {
            setCompany(companyResponse.result);
          }
        } catch (error) {
          console.error("Error loading company:", error);
        }

        setLoading(false);

        // Load similar jobs based on taxonomies
        if (jobData.taxonomies && jobData.taxonomies.length > 0) {
          setSimilarJobsLoading(true);
          try {
            const taxonomyIds = jobData.taxonomies.map(t => t.id);
            const similarJobsResponse = await JobServices.getJobsWithPagination({
              Page: 1,
              Size: 6,
              Status: 3, // Only opened jobs
              TaxonomyIds: taxonomyIds
            });

            if (similarJobsResponse.isSuccess && similarJobsResponse.result) {
              setSimilarJobs(similarJobsResponse.result.items);
            }
          } catch (error) {
            console.error("Error loading similar jobs:", error);
          } finally {
            setSimilarJobsLoading(false);
          }
        } else {
          setSimilarJobsLoading(false);
        }
      } catch (error) {
        console.error("Error loading job details:", error);
        setError("Không thể tải thông tin việc làm. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id]);

  // Handle navigation back to jobs list
  const handleBack = () => {
    navigate("/jobs");
  };

  // Handle job application
  const handleApply = () => {
    if (!job) return;
    toast.info("Tính năng ứng tuyển sẽ được cập nhật sớm!");
  };

  // Handle save/unsave job
  const handleSaveJob = () => {
    if (!job) return;
    
    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    // Check if user is candidate
    if (authState.role?.toLowerCase() !== 'candidate') {
      toast.error('Chỉ ứng viên mới có thể lưu việc làm');
      return;
    }
    
    if (isSaved) {
      setIsSaved(false);
      toast.success("Đã bỏ lưu việc làm");
    } else {
      setIsSaved(true);
      toast.success("Đã lưu việc làm");
    }
  };

  // Handle report job
  const handleReportJob = () => {
    if (!job) return;

    // Check if user is authenticated
    if (!authState.isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    // Open report dialog
    setShowReportDialog(true);
  };

  // Handle submit report
  const handleSubmitReport = async (reportData: CreateReportRequest) => {
    try {
      const response = await ReportService.createReport(reportData);
      
      if (response.isSuccess) {
        toast.success("Báo cáo đã được gửi thành công!");
      } else {
        throw new Error("Report submission failed");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại!");
      throw error; // Re-throw để ReportJobDialog có thể handle
    }
  };

  // Handle login dialog close
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // After successful login, open report dialog
    setTimeout(() => {
      setShowReportDialog(true);
    }, 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="flex space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="flex gap-6">
              <div className="flex-1 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-80 space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || "Không tìm thấy việc làm"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Việc làm bạn đang tìm không tồn tại hoặc đã bị xóa."}
          </p>
          <Button
            onClick={handleBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Quay lại danh sách việc làm
          </Button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Job Header */}
          <JobDetailHeader
            job={job}
            company={company || undefined}
            onBack={handleBack}
            onApply={handleApply}
            onSave={handleSaveJob}
            onReport={handleReportJob}
            isSaved={isSaved}
            authState={authState}
          />

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Job Details */}
            <div className="flex-1">
              <JobDescription job={job} />
            </div>

            {/* Right Column - Company Info & Similar Jobs */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Company Info */}
              {company && <CompanyInfo company={company} />}

              {/* Similar Jobs */}
              <SimilarJobs
                jobs={similarJobs}
                currentJobId={job.jobId}
                loading={similarJobsLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Job Dialog */}
      {job && (
        <ReportJobDialog
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          jobId={job.jobId}
          jobTitle={job.title}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onOpenRegister={() => {
          setShowLoginDialog(false);
          // Handle register dialog if needed
        }}
        onOpenForgotPassword={() => {
          setShowLoginDialog(false);
          // Handle forgot password dialog if needed
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default JobDetailPage;
