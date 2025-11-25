import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Heart, MapPin, Clock, DollarSign, Briefcase, Building2, ChevronRight } from "lucide-react";
import { Job } from "@/models/job";
import { Company } from "@/models/company";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "../../../../env";
import { cn } from "@/lib/utilsCommon";

interface JobListProps {
    jobs: Job[];
    companies: Record<number, Company>;
    total: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    sortBy: string;
    onSortChange: (sortBy: string) => void;
    onPageChange: (page: number) => void;
    onJobDetails: (jobId: number) => void;
    onSaveJob: (jobId: number) => void;
    loading: boolean;
    className?: string;
}

const JobCard = ({ job, company, onJobDetails, onSaveJob }: {
    job: Job;
    company?: Company;
    onJobDetails: (jobId: number) => void;
    onSaveJob: (jobId: number) => void;
}) => {

    const getLogoUrl = (logoPath?: string) => {
        if (!logoPath) return "https://placehold.co/100x100?text=Logo";
        if (logoPath.startsWith("http")) return logoPath;
        const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '/images');
        const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
        return `${baseUrl}${path}`;
    };

    const formatSalary = () => {
        const toMillions = (value?: number | null) => {
            if (value == null) return null;
            const millions = value / 1_000_000;
            return millions % 1 === 0
                ? `${millions}`
                : `${millions.toFixed(1)}`;
        };

        const min = toMillions(job.salaryMin);
        const max = toMillions(job.salaryMax);

        if (!min && !max) return "Thoả thuận";

        if (min && max) return `${min} – ${max} triệu`;
        if (min) return `Từ ${min} triệu`;
        if (max) return `Đến ${max} triệu`;

        return "Thoả thuận";
    }

    const formatLocation = (location: string) => {
        if (!location) return "";
        const parts = location.split("\n").map(p => p.trim()).filter(Boolean);
        const lastLine = parts[parts.length - 1];
        const segments = lastLine.split(",").map(s => s.trim());
        if (segments.length >= 2) {
            const city = segments[segments.length - 2];
            return city;
        }
        return lastLine;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Hôm nay";
        if (diffDays === 1) return "Hôm qua";
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return `${Math.floor(diffDays / 30) > 0 ? Math.floor(diffDays / 30) + ' tháng trước' : Math.floor(diffDays / 7) + ' tuần trước'}`;
    };


    return (
        <Card
            className="group relative p-5 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 cursor-pointer bg-white border border-gray-100 overflow-hidden"
            onClick={() => onJobDetails(job.jobId)}
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
                                {formatSalary() === "Thoả thuận" ? (
                                    <span className="flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5" /> Thoả thuận
                                    </span>
                                ) : (
                                    formatSalary()
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
                                {job.taxonomies.map((taxonomy) => taxonomy.name).slice(0, 3).join(', ')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:text-red-500 hover:bg-red-50 text-gray-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveJob(job.jobId);
                                }}
                                title="Lưu công việc"
                            >
                                <Heart className="w-5 h-5" />
                            </Button>
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

const JobListSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-5 bg-white border border-gray-100">
                <div className="flex gap-5">
                    <Skeleton className="w-20 h-20 rounded-xl" />
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-1/3" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </div>
                </div>
            </Card>
        ))}
    </div>
);

const JobList: React.FC<JobListProps> = ({
    jobs,
    companies,
    total,
    currentPage,
    totalPages,
    sortBy,
    onSortChange,
    onPageChange,
    onJobDetails,
    onSaveJob,
    loading,
    className
}) => {
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header: Sort and Count */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600">
                    Tìm thấy <span className="font-bold text-emerald-600 text-lg">{total}</span> việc làm phù hợp
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto p-1 rounded-lg">
                    <span className="text-sm text-gray-500 pl-3 whitespace-nowrap font-medium">Sắp xếp:</span>
                    <Select value={sortBy || "CreatedAt"} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[160px] h-8 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 text-gray-700 font-medium">
                            <SelectValue placeholder="Chọn tiêu chí" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CreatedAt">Mới nhất</SelectItem>
                            <SelectItem value="SalaryMin">Lương cao nhất</SelectItem>
                            <SelectItem value="SalaryMax">Lương thấp nhất</SelectItem>
                            <SelectItem value="Title">Tên công việc</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List of Jobs */}
            {loading ? (
                <JobListSkeleton />
            ) : jobs.length === 0 ? (
                <Card className="py-16 px-4 text-center bg-white border-dashed border-2 border-gray-200 shadow-none">
                    <div className="text-gray-400 space-y-4 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                            <Briefcase className="w-10 h-10 opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-semibold text-gray-600">Không tìm thấy công việc phù hợp</p>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn</p>
                        </div>
                        <Button variant="outline" onClick={() => window.location.reload()}>Làm mới trang</Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.jobId}
                            job={job}
                            company={companies[job.companyId]}
                            onJobDetails={onJobDetails}
                            onSaveJob={onSaveJob}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && jobs.length > 0 && totalPages > 1 && (
                <div className="py-8 flex justify-center">
                    <Pagination>
                        <PaginationContent className="gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                    className={cn("cursor-pointer transition-colors", currentPage === 1 ? "pointer-events-none opacity-30" : "hover:bg-emerald-50 hover:text-emerald-600")}
                                />
                            </PaginationItem>

                            {generatePageNumbers().map((page, index) => (
                                <PaginationItem key={index}>
                                    {page === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            onClick={() => onPageChange(page as number)}
                                            isActive={currentPage === page}
                                            className={cn(
                                                "cursor-pointer w-10 h-10 transition-all",
                                                currentPage === page
                                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                                                    : "hover:bg-emerald-50 hover:text-emerald-600 border-transparent"
                                            )}
                                        >
                                            {page}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                                    className={cn("cursor-pointer transition-colors", currentPage === totalPages ? "pointer-events-none opacity-30" : "hover:bg-emerald-50 hover:text-emerald-600")}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default JobList;
