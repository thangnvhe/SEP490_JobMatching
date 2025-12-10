import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  Globe,
  Share2,
  Heart,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Users,
  ArrowLeft,
  Bookmark,
  Flag
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportJobDialog } from "@/components/dialogs/ReportJobDialog";
import ApplyJobDialog from "@/components/dialogs/ApplyJobDialog";

// Services & Models
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { SaveJobServices } from "@/services/save-job.service";
import { ReportService } from "@/services/report.service";
import { Job } from "@/models/job";
import { Company } from "@/models/company";
import { API_BASE_URL } from "../../../../env";
import { PaginationParamsInput } from "@/models/base";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingJob, setSavingJob] = useState(false);
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const [isApplyDialogOpen, setApplyDialogOpen] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 10,
    search: '',
    sortBy: '',
    isDecending: false,
    salaryMin: null,
    taxonomyIds: id ? [id] : [],
});
  const getLogoUrl = (logoPath?: string) => {
    if (!logoPath) return "https://placehold.co/100x100?text=Logo";
    if (logoPath.startsWith("http")) return logoPath;
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '/images');
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${baseUrl}${path}`;
  };

  const getAllJobsRecommendedWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      const response = await JobServices.getAllWithPagination(params);
      if (response.isSuccess && response.result) {
        setRecommendedJobs(response.result.items);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải danh sách công việc");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await JobServices.getById(id);
      if (response.isSuccess && response.result) {
        setJob(response.result);
        
        // Cập nhật paginationInput với salaryMin và taxonomyIds từ job
        const taxonomyIds = response.result.taxonomies?.map(t => t.id.toString()) || [];
        const newPaginationInput: PaginationParamsInput = {
          ...paginationInput,
          salaryMin: response.result.salaryMin || null,
          taxonomyIds: taxonomyIds,
        };
        setPaginationInput(newPaginationInput);
        
        // Gọi API lấy việc làm tương tự
        getAllJobsRecommendedWithPagination(newPaginationInput);
        
        if (response.result.companyId) {
          const companyResponse = await CompanyServices.getCompanyById(response.result.companyId.toString());
          if (companyResponse.isSuccess && companyResponse.result) {
            setCompany(companyResponse.result);
          }
        }
      } else {
        toast.error(response.errorMessages[0]);
      }
    } catch (error: any) {
      console.error("Error loading details:", error);
      toast.error("Không thể tải thông tin công việc");
    } finally {
      setLoading(false);
    }
  };
  const location = useLocation();
  const getBackPath = () => {
    const from = location.state?.from;
    return from === '/' ? '/' : '/jobs';
  };

  useEffect(() => {
    fetchJobData();
  }, [id]);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  const handleSaveJob = async () => {
    if (!job?.jobId || savingJob) return;
    try {
      setSavingJob(true);
      await SaveJobServices.saveJob(job.jobId);
      toast.success("Đã lưu tin tuyển dụng");
    } catch (error: any) {
      toast.error("Tin tuyển dụng đã được lưu");
    } finally {
      setSavingJob(false);
    }
  };

  const handleSubmitReport = async (reportData: { jobId: number; subject: number; reason: string }) => {
    await ReportService.create(reportData);
  };

  if (!job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy công việc này</h2>
          <p className="text-gray-500">Có thể công việc đã bị xóa hoặc hết hạn.</p>
          <Button variant="default" className="bg-emerald-600" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Breadcrumb Area */}
      <div className="bg-slate-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(getBackPath())}
            className="text-emerald-600 hover:bg-emerald-600 hover:text-white pl-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại tìm việc
          </Button>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Company Logo Mobile/Desktop */}
            <div className="w-24 h-24 md:w-32 md:h-32 border border-gray-100 rounded-xl bg-white p-2 shadow-sm shrink-0 hidden md:flex items-center justify-center">
              <img
                src={getLogoUrl(company?.logo)}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="flex-1 space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>
              <div className="text-lg font-medium text-gray-600 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                {company?.name || "Công ty ẩn danh"}
              </div>

              <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm md:text-base text-gray-600 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                  <DollarSign className="h-5 w-5" />
                  <span>
                    {job.salaryMin && job.salaryMax
                      ? `${job.salaryMin / 1000000} - ${
                          job.salaryMax / 1000000
                        } Triệu`
                      : "Thỏa thuận"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>
                    {job.experienceYear
                      ? `${job.experienceYear} năm kinh nghiệm`
                      : "Không yêu cầu"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[220px]">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6 shadow-lg shadow-emerald-600/20 font-bold transition-transform hover:scale-[1.02]"
                onClick={() => setApplyDialogOpen(true)}
              >
                Ứng tuyển ngay
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 bg-white text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-base font-semibold transition-all shadow-sm h-10"
                  onClick={() => setReportDialogOpen(true)}
                >
                  <Flag className="mr-1.5 h-4 w-4" /> Báo cáo
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium h-10 w-10 p-0 flex items-center justify-center rounded-lg disabled:opacity-60"
                  onClick={handleSaveJob}
                  disabled={savingJob}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Detail Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 bg-white shadow-sm border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hình thức làm việc</p>
                    <p className="font-semibold text-gray-900">
                      {job.jobType || "Toàn thời gian"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số lượng tuyển</p>
                    <p className="font-semibold text-gray-900">5 người</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hạn nộp hồ sơ</p>
                    <p className="font-semibold text-gray-900">
                      {job.expiredAt
                        ? `${format(new Date(job.expiredAt), "dd/MM/yyyy")}`
                        : "Không giới hạn"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-semibold text-emerald-700">
                      Đang tuyển dụng
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Chi tiết tin tuyển dụng */}
            <Card className="p-6 md:p-8 shadow-sm border-0 ring-1 ring-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-emerald-500 pl-4 py-1">
                Chi tiết tin tuyển dụng
              </h2>

              <div className="space-y-8">
                {/* Mô tả công việc */}
                <section className="prose max-w-none">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    Mô tả công việc
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    {job.description || "Đang cập nhật..."}
                  </div>
                </section>

                {/* Yêu cầu ứng viên */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    Yêu cầu ứng viên
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    {job.requirements || "Đang cập nhật..."}
                  </div>
                </section>

                {/* Quyền lợi */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    Quyền lợi
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                    {job.benefits || "Đang cập nhật..."}
                  </div>
                </section>

                {/* Địa điểm làm việc */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                    Địa điểm làm việc
                  </h3>
                  <div className="flex items-start gap-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{job.location}</span>
                  </div>
                </section>
              </div>
            </Card>

            {/* Action Buttons Footer */}
            <div className="flex gap-4 mt-8">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-lg py-6 shadow-md font-bold"
                onClick={() => setApplyDialogOpen(true)}
              >
                Ứng tuyển ngay
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-6"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Company Info Card - Sticky only if desired, but simple block here */}
            <Card className="p-6 shadow-md border-0 ring-1 ring-gray-100 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-emerald-600 w-5 h-5" />
                <h3 className="font-bold text-gray-900">Thông tin công ty</h3>
              </div>
              {company ? (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                    <Avatar className="h-24 w-24 rounded-xl border bg-white p-2 mb-3">
                      <AvatarImage
                        src={getLogoUrl(company.logo)}
                        alt={company.name}
                        className="object-contain"
                      />
                      <AvatarFallback className="rounded-xl text-2xl bg-emerald-50 text-emerald-600">
                        {company.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 hover:text-emerald-600 cursor-pointer transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">IT - Phần mềm</p>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex gap-3">
                      <Users className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        Quy mô: 25-99 nhân viên
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="text-gray-600 line-clamp-3">
                        {company.address}
                      </span>
                    </div>
                    {company.website && (
                      <div className="flex gap-3">
                        <Globe className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline truncate font-medium"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    onClick={() => window.open(company.website, "_blank")}
                  >
                    Xem trang công ty <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Đang tải thông tin...
                </div>
              )}
            </Card>

            {/* Gợi ý việc làm */}
            <div className="bg-white rounded-xl p-5 shadow-sm border ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                Việc làm tương tự
              </h3>
              <div className="space-y-3">
                {recommendedJobs.length > 0 ? (
                  <>
                    {recommendedJobs
                      .filter((rJob) => rJob.jobId !== job?.jobId)
                      .slice(0, 4)
                      .map((rJob) => (
                        <div
                          key={rJob.jobId}
                          className="border border-gray-100 rounded-lg p-3 hover:bg-emerald-50/50 hover:border-emerald-100 transition-all cursor-pointer group"
                          onClick={() => navigate(`/jobs/${rJob.jobId}`)}
                        >
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            {rJob.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 mb-2 truncate">
                            {rJob.location}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              {rJob.salaryMin && rJob.salaryMax
                                ? `${rJob.salaryMin / 1000000} - ${
                                    rJob.salaryMax / 1000000
                                  } triệu`
                                : "Thỏa thuận"}
                            </span>
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {rJob.jobType || "Toàn thời gian"}
                            </span>
                          </div>
                        </div>
                      ))}
                    <Button
                      variant="link"
                      className="w-full text-emerald-600 text-sm font-medium hover:no-underline hover:bg-emerald-50 mt-2"
                      onClick={() => navigate("/jobs")}
                    >
                      Xem tất cả việc làm tương tự
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Không có việc làm tương tự
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportJobDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setReportDialogOpen}
        jobId={job.jobId}
        jobTitle={job.title}
        onSubmitReport={handleSubmitReport}
      />
      <ApplyJobDialog
        isOpen={isApplyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        jobId={job.jobId}
        jobTitle={job.title}
        onUploadCV={() => navigate("/candidate/cv-management")}
      />
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}
