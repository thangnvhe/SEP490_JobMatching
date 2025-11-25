import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Info, Loader2, MapPin, Clock, DollarSign, Briefcase, Building2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateJobServices } from "@/services/candidate-job.service";
import { SaveJobServices } from "@/services/save-job.service";
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { CandidateJob, CandidateJobStatus, Job, SavedJob } from "@/models/job";
import { Company } from "@/models/company";
import { toast } from "sonner";
import { API_BASE_URL } from "../../../../../env";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";

// Helper functions
const getLogoUrl = (logoPath?: string): string => {
    if (!logoPath) return "https://placehold.co/100x100?text=Logo";
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
        return logoPath;
    }
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '/images');
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${baseUrl}${path}`;
};

const formatSalary = (salaryMin?: number, salaryMax?: number): string => {
    const toMillions = (value?: number | null) => {
        if (value == null) return null;
        const millions = value / 1_000_000;
        return millions % 1 === 0 ? `${millions}` : `${millions.toFixed(1)}`;
    };

    const min = toMillions(salaryMin);
    const max = toMillions(salaryMax);

    if (!min && !max) return "Thoả thuận";
    if (min && max) return `${min} – ${max} triệu`;
    if (min) return `Từ ${min} triệu`;
    if (max) return `Đến ${max} triệu`;
    return "Thoả thuận";
};

const formatLocation = (location: string): string => {
    if (!location) return "";
    const parts = location.split("\n").map(p => p.trim()).filter(Boolean);
    const lastLine = parts[parts.length - 1];
    const segments = lastLine.split(",").map(s => s.trim());
    if (segments.length >= 2) {
        return segments[segments.length - 2];
    }
    return lastLine;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 30) > 0 ? Math.floor(diffDays / 30) + ' tháng trước' : Math.floor(diffDays / 7) + ' tuần trước'}`;
};

const fetchCompanyById = async (companyId: number): Promise<Company | null> => {
    try {
        const res = await CompanyServices.getCompanyById(companyId.toString());
        if (res.isSuccess && res.result) {
            return res.result;
        }
    } catch (error) {
        console.error("Error fetching company", error);
    }
    return null;
};

const getStatusInfo = (status: CandidateJobStatus): { label: string; className: string } => {
    switch (status) {
        case CandidateJobStatus.Pending:
            return { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-700 border-yellow-200" };
        case CandidateJobStatus.RejectCv:
            return { label: "CV bị từ chối", className: "bg-red-100 text-red-700 border-red-200" };
        case CandidateJobStatus.Processing:
            return { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 border-blue-200" };
        case CandidateJobStatus.Fail:
            return { label: "Không đạt", className: "bg-red-100 text-red-700 border-red-200" };
        case CandidateJobStatus.Pass:
            return { label: "Đã đạt", className: "bg-green-100 text-green-700 border-green-200" };
        default:
            return { label: "Không xác định", className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
};

export default function MyJobsPage() {
    const navigate = useNavigate();
    const [appliedJobs, setAppliedJobs] = useState<CandidateJob[]>([]);
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
    const [loadingApplied, setLoadingApplied] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);

    // Fetch data
    const fetchAppliedJobs = async () => {
        try {
            setLoadingApplied(true);
            const response = await CandidateJobServices.getMyCandidateJobs({
                page: 1,
                size: 20,
                search: '',
                sortBy: '',
                isDecending: false,
            });
            setAppliedJobs(response.result.items);
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoadingApplied(false);
        }
    };

    const fetchSavedJobs = async () => {
        try {
            setLoadingSaved(true);
            const response = await SaveJobServices.getMySavedJobs();
            console.log(response.result);
            setSavedJobs(response.result);
        } catch (err: any) {
            console.log(err);
        } finally {
            setLoadingSaved(false);
        }
    };

    useEffect(() => {
        fetchAppliedJobs();
        fetchSavedJobs();
    }, []);

    const handleUnsaveJob = async (savedJobId: number) => {
        try {
            const response = await SaveJobServices.deleteSavedJob(savedJobId);
            if (response.isSuccess) {
                toast.success("Đã bỏ lưu việc làm");
                // Refresh danh sách saved jobs
                setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi bỏ lưu việc làm");
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-gray-50/30">
            <div className="space-y-1 mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Việc làm của tôi</h1>
                <p className="text-muted-foreground">Quản lý danh sách việc làm đã ứng tuyển và đã lưu</p>
            </div>

            <Tabs defaultValue="applied" className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8 mb-6">
                    <TabsTrigger
                        value="applied"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 py-3 text-muted-foreground font-medium text-base transition-all hover:text-emerald-500"
                    >
                        Việc làm đã ứng tuyển <span className="ml-2 bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{appliedJobs.length}</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="saved"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 rounded-none px-0 py-3 text-muted-foreground font-medium text-base transition-all hover:text-emerald-500"
                    >
                        Việc làm đã lưu <span className="ml-2 bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{savedJobs.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="applied" className="mt-0 space-y-6">
                    {loadingApplied ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : appliedJobs.length > 0 ? 
                    (
                        <div className="space-y-4">
                            {appliedJobs.map((candidateJob: CandidateJob) => (
                                <AppliedJobItemWithFetch
                                    key={candidateJob.id}
                                    candidateJob={candidateJob}
                                    onNavigate={(id) => navigate(`/jobs/${id}`)}
                                />
                            ))}
                        </div>
                    
                ) : (
                        <div className="bg-white rounded-xl p-8 border border-dashed shadow-sm text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-gray-50 p-4 rounded-full">
                                    <Briefcase className="w-10 h-10 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa ứng tuyển việc làm nào</h3>
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
                                <Info className="w-4 h-4" />
                                <span>Việc làm đã ứng tuyển của bạn sẽ được lưu trong 12 tháng.</span>
                            </div>
                            <Button
                                variant="outline"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                onClick={() => navigate("/jobs")}
                            >
                                Khám phá việc làm ngay
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="saved" className="mt-0 space-y-6">
                    {loadingSaved ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : savedJobs.length > 0 ? (
                        <div className="space-y-4">
                            {savedJobs.map(savedJob => (
                                <SavedJobItemWithFetch
                                    key={savedJob.id}
                                    savedJob={savedJob}
                                    onToggleSave={handleUnsaveJob}
                                    onNavigate={(id) => navigate(`/jobs/${id}`)}
                                />
                            )
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 border border-dashed shadow-sm text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-gray-50 p-4 rounded-full">
                                    <IconBookmark className="w-10 h-10 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa lưu việc làm nào</h3>
                            <p className="text-gray-500 mb-6">Bạn chưa lưu bất kỳ việc làm nào.</p>
                            <Button
                                variant="outline"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                onClick={() => navigate("/jobs")}
                            >
                                Tìm việc làm ngay
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Component cho Saved Jobs - fetch Job data từ jobId
const SavedJobItemWithFetch = ({ savedJob, onToggleSave, onNavigate }: { savedJob: SavedJob, onToggleSave?: (id: number) => void, onNavigate: (id: number) => void }) => {
    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobAndCompany = async () => {
            try {
                setLoading(true);
                const jobRes = await JobServices.getById(savedJob.jobId.toString());
                if (jobRes.isSuccess && jobRes.result) {
                    setJob(jobRes.result);
                    if (jobRes.result.companyId) {
                        const companyData = await fetchCompanyById(jobRes.result.companyId);
                        setCompany(companyData);
                    }
                }
            } catch (error) {
                console.error("Error fetching job or company", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobAndCompany();
    }, [savedJob.jobId]);

    if (loading) {
        return (
            <Card className="p-5 bg-white border border-gray-100">
                <div className="flex gap-5 items-start animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded w-20" />
                            <div className="h-6 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <Card
            className="group relative p-5 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 cursor-pointer bg-white border border-gray-100 overflow-hidden"
            onClick={() => onNavigate(job.jobId)}
        >
            {/* Hover indicator line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="flex gap-5 items-start">
                {/* Company Logo */}
                <div className="shrink-0">
                    <div className="w-20 h-20 border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-xs overflow-hidden group-hover:border-emerald-100 transition-colors">
                        <img
                            src={getLogoUrl(company?.logo)}
                            alt={`${company?.name || 'Company'} logo`}
                            className="w-full h-full object-contain "
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                            }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col h-full">
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                <Building2 className="w-4 h-4" />
                                <span className="truncate hover:underline">{company?.name || "Công ty chưa cập nhật"}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="text-emerald-600 font-bold text-base whitespace-nowrap bg-emerald-50 px-3 py-1 rounded-full">
                                {formatSalary(job.salaryMin, job.salaryMax) === "Thoả thuận" ? (
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5" /> Thoả thuận
                                    </span>
                                ) : (
                                    formatSalary(job.salaryMin, job.salaryMax)
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                            {formatLocation(job.location || '') || 'Toàn quốc'}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                            {job.experienceYear ? `${job.experienceYear} năm` : 'Không yêu cầu'}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <Briefcase className="w-3 h-3 mr-1.5 text-gray-400" />
                            {job.jobType || 'Full-time'}
                        </Badge>
                    </div>

                    <div className="mt-auto pt-2 flex justify-between items-end border-t border-gray-50 border-dashed">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Đăng {formatDate(job.createdAt)}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">
                                {job.taxonomies?.map((taxonomy) => taxonomy.name).slice(0, 3).join(', ') || ''}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {onToggleSave && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full text-emerald-600 bg-emerald-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleSave(savedJob.id);
                                    }}
                                    title="Bỏ lưu"
                                >
                                    <IconBookmarkFilled className="w-5 h-5" />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium group/btn"
                            >
                                Chi tiết <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Component cho Applied Jobs - fetch Job data từ CandidateJob
const AppliedJobItemWithFetch = ({ candidateJob, onNavigate }: { candidateJob: CandidateJob, onNavigate: (id: number) => void }) => {
    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobAndCompany = async () => {
            try {
                setLoading(true);
                const jobRes = await JobServices.getById(candidateJob.jobId.toString());
                if (jobRes.isSuccess && jobRes.result) {
                    setJob(jobRes.result);
                    if (jobRes.result.companyId) {
                        const companyData = await fetchCompanyById(jobRes.result.companyId);
                        setCompany(companyData);
                    }
                }
            } catch (error) {
                console.error("Error fetching job or company", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobAndCompany();
    }, [candidateJob.jobId]);

    const statusInfo = getStatusInfo(candidateJob.status);

    if (loading) {
        return (
            <Card className="p-5 bg-white border border-gray-100">
                <div className="flex gap-5 items-start animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded w-20" />
                            <div className="h-6 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <Card
            className="group relative p-5 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 cursor-pointer bg-white border border-gray-100 overflow-hidden"
            onClick={() => onNavigate(job.jobId)}
        >
            {/* Hover indicator line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

            <div className="flex gap-5 items-start">
                {/* Company Logo */}
                <div className="shrink-0">
                    <div className="w-20 h-20 border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-xs overflow-hidden group-hover:border-emerald-100 transition-colors">
                        <img
                            src={getLogoUrl(company?.logo)}
                            alt={`${company?.name || 'Company'} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                            }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col h-full">
                    <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                <Building2 className="w-4 h-4" />
                                <span className="truncate hover:underline">{company?.name || "Công ty chưa cập nhật"}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* Application Status */}
                            <Badge className={`${statusInfo.className} font-medium`}>
                                {statusInfo.label}
                            </Badge>
                            <span className="text-emerald-600 font-bold text-base whitespace-nowrap bg-emerald-50 px-3 py-1 rounded-full">
                                {formatSalary(job.salaryMin, job.salaryMax) === "Thoả thuận" ? (
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5" /> Thoả thuận
                                    </span>
                                ) : (
                                    formatSalary(job.salaryMin, job.salaryMax)
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                            {formatLocation(job.location || '') || 'Toàn quốc'}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                            {job.experienceYear ? `${job.experienceYear} năm` : 'Không yêu cầu'}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-gray-600 border-gray-200 bg-gray-50/50 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                            <Briefcase className="w-3 h-3 mr-1.5 text-gray-400" />
                            {job.jobType || 'Full-time'}
                        </Badge>
                    </div>

                    <div className="mt-auto pt-2 flex justify-between items-end border-t border-gray-50 border-dashed">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Ứng tuyển {formatDate(candidateJob.appliedAt)}</span>
                            {candidateJob.cvId && (
                                <>
                                    <span>•</span>
                                    <span>CV #{candidateJob.cvId}</span>
                                </>
                            )}
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium group/btn"
                        >
                            Chi tiết <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
