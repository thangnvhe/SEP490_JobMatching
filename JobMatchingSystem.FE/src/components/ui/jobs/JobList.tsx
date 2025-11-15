import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { JobCard } from "./JobCard";
import type { JobDetailResponse } from "@/models/job";

interface JobListProps {
  jobs: JobDetailResponse[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onPageChange: (page: number) => void;
  onJobDetails: (jobId: number) => void;
  onSaveJob?: (jobId: number) => void;
  loading?: boolean;
  className?: string;
}

const SORT_OPTIONS = [
  { value: "latest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "salary-high", label: "Lương: Cao đến thấp" }
];

const JobList: React.FC<JobListProps> = ({
  jobs,
  total,
  currentPage,
  totalPages,
  pageSize,
  sortBy,
  onSortChange,
  onPageChange,
  onJobDetails,
  onSaveJob,
  loading = false,
  className = "",
}) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const renderPaginationButton = (pageNumber: number, isActive: boolean = false) => (
    <Button
      key={pageNumber}
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onPageChange(pageNumber)}
      disabled={loading}
      className={`w-10 h-10 ${
        isActive
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {pageNumber}
    </Button>
  );

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(renderPaginationButton(i, i === currentPage));
      }
    } else {
      // Logic phức tạp hơn cho nhiều trang
      if (currentPage <= 3) {
        // Hiển thị 1,2,3,4,5 ... last
        for (let i = 1; i <= 5; i++) {
          buttons.push(renderPaginationButton(i, i === currentPage));
        }
        if (totalPages > 6) {
          buttons.push(
            <span key="ellipsis1" className="px-2 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
          buttons.push(renderPaginationButton(totalPages));
        }
      } else if (currentPage >= totalPages - 2) {
        // Hiển thị 1 ... last-4,last-3,last-2,last-1,last
        buttons.push(renderPaginationButton(1));
        if (totalPages > 6) {
          buttons.push(
            <span key="ellipsis2" className="px-2 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          buttons.push(renderPaginationButton(i, i === currentPage));
        }
      } else {
        // Hiển thị 1 ... current-1,current,current+1 ... last
        buttons.push(renderPaginationButton(1));
        buttons.push(
          <span key="ellipsis3" className="px-2 text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(renderPaginationButton(i, i === currentPage));
        }
        buttons.push(
          <span key="ellipsis4" className="px-2 text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
        buttons.push(renderPaginationButton(totalPages));
      }
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton */}
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </Card>

        {/* Jobs loading skeleton */}
        <div className="grid gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header với thống kê và sắp xếp */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-gray-600">
            <span className="font-medium text-gray-900">
              {total.toLocaleString()}
            </span>{" "}
            việc làm được tìm thấy
            {total > 0 && (
              <span className="ml-2 text-sm">
                (Hiển thị {startIndex}-{endIndex})
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp theo:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Danh sách việc làm */}
      {jobs.length > 0 ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onJobDetails={onJobDetails}
              onSaveJob={onSaveJob}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-gray-50">
          <div className="space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Không tìm thấy việc làm phù hợp
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả.
            </p>
          </div>
        </Card>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="w-10 h-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="w-10 h-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobList;