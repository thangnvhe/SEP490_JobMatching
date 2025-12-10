import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "@/components/ui/jobs/JobCard";
import {
  MapPin,
  Globe,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Share2,
} from "lucide-react";

// Services
import { CompanyServices } from "@/services/company.service";
import { JobServices } from "@/services/job.service";

// Types
import { Company } from "@/models/company";
import { Job } from "@/models/job";

// Utils
import { API_BASE_URL } from "../../../../env.ts";
import { PageInfo, PaginationParamsInput } from "@/models/base.ts";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ================================================================
  // STATE: Company Detail
  // ================================================================
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================================================
  // STATE: Company Jobs
  // ================================================================
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: '',
    isDecending: false,
  });
  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 6,
    status: 3, 
    companyId: id ? parseInt(id) : undefined,
    sortBy: '',
    isDescending: true,
  });

  // ================================================================
  // HELPERS
  // ================================================================

  const getLogoUrl = (logoPath?: string): string | undefined => {
    if (!logoPath) return undefined;
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Pending
        return { variant: "secondary" as const, text: "Đang chờ duyệt", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
      case 1: // Approved
        return { variant: "default" as const, text: "Đã xác thực", className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" };
      case 2: // Rejected
        return { variant: "destructive" as const, text: "Bị từ chối", className: "" };
      default:
        return { variant: "outline" as const, text: "Không xác định", className: "" };
    }
  };

  // ================================================================
  // API CALLS
  // ================================================================

  const getCompanyDetail = useCallback(async (companyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CompanyServices.getCompanyById(companyId);
      if (response.isSuccess && response.result) {
        setCompany(response.result);
        setPaginationInput(prev => ({ ...prev, companyId: response.result.id }));
      } else {
        setError("Không tìm thấy thông tin công ty");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải thông tin công ty");
      console.error("Error fetching company details:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllJobsWithPagination = useCallback(async (params: PaginationParamsInput) => {
    if (!params.companyId) return;

    setJobsLoading(true);
    try {
      const response = await JobServices.getAllWithPagination(params);
      if (response.isSuccess && response.result) {
        setJobs(response.result.items);
        setPaginationInfo(response.result.pageInfo);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      getCompanyDetail(id);
    }
  }, [id, getCompanyDetail]);

  useEffect(() => {
    if (company?.id) {
        if (paginationInput.companyId !== company.id) {
            setPaginationInput(prev => ({ ...prev, companyId: company.id }));
        } else {
            getAllJobsWithPagination(paginationInput);
        }
    }
  }, [company, paginationInput, getAllJobsWithPagination]);

  const handlePageChange = (newPage: number) => {
    setPaginationInput(prev => ({ ...prev, page: newPage }));
    // Scroll to jobs section
    const jobsSection = document.getElementById('jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJobDetails = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  // ================================================================
  // RENDER
  // ================================================================
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-64 bg-gray-100 animate-pulse" />
        <div className="container mx-auto px-4 -mt-20 relative">
          <div className="flex flex-col gap-6">
             <div className="w-40 h-40 rounded-xl bg-gray-200 border-4 border-white animate-pulse" />
             <div className="space-y-2">
               <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
               <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Building2 className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy công ty</h2>
          <p className="text-gray-500 mb-8">{error || "Công ty này không tồn tại hoặc đã bị xóa."}</p>
          <Button onClick={() => navigate('/companies')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(company.status);
  const logoUrl = getLogoUrl(company.logo);

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans">
      {/* Banner Section - Green Nature Theme */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501854140884-074bf64cad1c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="container mx-auto px-4 h-full relative z-10">
           <Button
                onClick={() => navigate('/companies')}
                variant="ghost"
                className="mt-6 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
            </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Info - Overlapping Banner */}
        <div className="relative -mt-20 mb-8 flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Box */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-white shadow-lg shrink-0 overflow-hidden flex items-center justify-center group relative z-10">
                <Avatar className="w-full h-full rounded-none">
                    <AvatarImage 
                        src={logoUrl} 
                        alt={company.name} 
                        className="object-contain p-2 w-full h-full"
                    />
                    <AvatarFallback className="rounded-none bg-white">
                        <Building2 className="w-16 h-16 text-gray-300" />
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Main Info */}
            <div className="flex-1 pt-2 md:pt-24 min-w-0 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight truncate leading-tight">
                            {company.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-600">
                            <Badge variant={statusInfo.variant} className={`${statusInfo.className} px-3 py-1 rounded-full font-medium`}>
                                {statusInfo.variant === 'default' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                                {statusInfo.text}
                            </Badge>
                         
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                        {company.website && (
                            <Button 
                                variant="outline" 
                                onClick={() => window.open(company.website, "_blank")} 
                                className="shadow-sm border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Website
                            </Button>
                        )}
                         {company.email && (
                            <Button onClick={() => window.location.href = `mailto:${company.email}`} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all duration-200">
                                <Mail className="w-4 h-4 mr-2" />
                                Liên hệ
                            </Button>
                         )}
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="about" className="w-full">
                    <TabsList className="w-full h-auto p-1 bg-emerald-50/50 border border-emerald-100 rounded-xl gap-2 mb-6">
                        <TabsTrigger 
                            value="about" 
                            className="flex-1 rounded-lg py-2.5 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all duration-200"
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Về công ty
                        </TabsTrigger>
                        <TabsTrigger 
                            value="jobs" 
                            className="flex-1 rounded-lg py-2.5 text-sm font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all duration-200 group"
                        >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Tuyển dụng
                            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 group-data-[state=active]:bg-emerald-50">
                                {paginationInfo.totalItem}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-6 animate-in fade-in-50 duration-300">
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Giới thiệu chung
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="prose prose-stone max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {company.description ? (
                                        company.description
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 italic">
                                            Chưa có mô tả về công ty này.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jobs" id="jobs-section" className="space-y-6 animate-in fade-in-50 duration-300">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Vị trí đang tuyển</h3>
                        </div>

                        {jobsLoading ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="p-6 border border-gray-100 shadow-sm">
                                        <div className="flex gap-4">
                                            <Skeleton className="w-16 h-16 rounded-lg" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-5 w-1/3" />
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-10 w-full mt-4" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <Card className="border-dashed border-2 bg-gray-50/50">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                        <Briefcase className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Chưa có tin tuyển dụng</h3>
                                    <p className="text-gray-500 mt-1 max-w-xs">Hiện tại công ty chưa đăng tải vị trí tuyển dụng nào. Vui lòng quay lại sau.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.map((job) => (
                                    <JobCard
                                        key={job.jobId}
                                        job={job}
                                        onJobDetails={handleJobDetails}
                                        className="border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!jobsLoading && jobs.length > 0 && paginationInfo.totalPage > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                                    disabled={!paginationInfo.hasPreviousPage}
                                    size="sm"
                                    className="w-24 hover:text-emerald-600 hover:border-emerald-200"
                                >
                                    Trước
                                </Button>
                                <span className="text-sm font-medium text-gray-600 px-4">
                                    Trang {paginationInfo.currentPage} / {paginationInfo.totalPage}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                                    disabled={!paginationInfo.hasNextPage}
                                    size="sm"
                                    className="w-24 hover:text-emerald-600 hover:border-emerald-200"
                                >
                                    Sau
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
                {/* Contact Info Card */}
                <Card className="border-none shadow-sm bg-white sticky top-24">
                    <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                        <CardTitle className="text-base font-semibold text-gray-800">Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                         {/* Address */}
                        <div className="flex gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 mb-0.5">Địa chỉ</p>
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3" title={company.address}>
                                    {company.address || "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                        
                        <Separator />

                        {/* Website */}
                        <div className="flex gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                <Globe className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 mb-0.5">Website</p>
                                <p className="text-sm text-gray-500 truncate">
                                    {company.website ? (
                                        <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-emerald-600 hover:underline transition-colors">
                                            {new URL(company.website).hostname}
                                        </a>
                                    ) : "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Email */}
                        <div className="flex gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                                <Mail className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 mb-0.5">Email</p>
                                <p className="text-sm text-gray-500 truncate">
                                    {company.email ? (
                                        <a href={`mailto:${company.email}`} className="hover:text-emerald-600 hover:underline transition-colors">
                                            {company.email}
                                        </a>
                                    ) : "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>

                         <Separator />

                        {/* Phone */}
                        <div className="flex gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                                <Phone className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 mb-0.5">Điện thoại</p>
                                <p className="text-sm text-gray-500">
                                    {company.phoneContact ? (
                                        <a href={`tel:${company.phoneContact}`} className="hover:text-emerald-600 hover:underline transition-colors">
                                            {company.phoneContact}
                                        </a>
                                    ) : "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    
                    {/* Share Button Section - Optional */}
                    <CardFooter className="bg-gray-50/30 p-4 border-t">
                         <Button variant="outline" className="w-full gap-2 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600" onClick={() => {
                             navigator.clipboard.writeText(window.location.href);
                             // Use a toast here if available
                         }}>
                            <Share2 className="w-4 h-4" />
                            Chia sẻ công ty
                         </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
