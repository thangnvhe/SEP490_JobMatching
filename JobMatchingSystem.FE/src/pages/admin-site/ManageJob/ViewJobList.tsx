import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

// Import các UI components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import types và services
import { JobServices } from "@/services/job.service";
import { type JobDetailResponse } from "@/models/job";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function ViewJobList() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobDetailResponse[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobDetailResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Pagination state (client-side pagination vì API chưa hỗ trợ)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch all jobs
  const getAllJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobServices.searchJobs({});
      if (response.isSuccess) {
        setJobs(response.result);
      } else {
        setError("Không thể tải danh sách công việc");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải dữ liệu công việc");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter jobs dựa trên keyword và status
  useEffect(() => {
    let filtered = jobs;

    // Filter theo status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Filter theo keyword
    if (debouncedKeyword) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
        job.location.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
        job.description.toLowerCase().includes(debouncedKeyword.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [jobs, statusFilter, debouncedKeyword]);

  // Load jobs on component mount
  useEffect(() => {
    getAllJobs();
  }, [getAllJobs]);

  // Handler functions
  const handleRefresh = () => {
    getAllJobs();
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleView = (job: JobDetailResponse) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (job: JobDetailResponse) => {
    // TODO: Navigate to edit page
    console.log("Edit job:", job);
  };

  const handleApprove = async (jobId: number) => {
    try {
      await JobServices.censorJob(jobId.toString(), { Status: 1 }); // Moderated
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  const handleReject = async (jobId: number) => {
    try {
      await JobServices.censorJob(jobId.toString(), { Status: 2 }); // Rejected
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleDelete = (job: JobDetailResponse) => {
    // TODO: Implement soft delete
    console.log("Delete job:", job);
  };

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Moderated':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'Moderated':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'Rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'Chờ duyệt';
      case 'Moderated':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Bị từ chối';
      default:
        return status;
    }
  };

  // Calculate pagination
  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Define columns
  const columns = useMemo<ColumnDef<JobDetailResponse>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return startIndex + index + 1;
      },
      enableSorting: false,
    },
    {
      id: "title",
      accessorKey: "title",
      header: "Tên công việc",
      enableSorting: true,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div title={title} className="max-w-[200px] truncate text-sm">
            {truncateText(title, 30)}
          </div>
        );
      },
    },
    {
      id: "location",
      accessorKey: "location",
      header: "Địa điểm",
      enableSorting: true,
      cell: ({ row }) => {
        const location = row.getValue("location") as string;
        // Loại bỏ prefix "Địa điểm làm việc:" nếu có trước khi cắt ngắn
        const cleanLocation = location.replace(/^Địa điểm làm việc\s*/i, "");
        const displayText = truncateText(cleanLocation, 20);
        return (
          <div title={location} className="max-w-[180px] truncate text-sm">
            {displayText}
          </div>
        );
      },
    },
    {
      id: "salaryRange",
      header: "Mức lương",
      cell: ({ row }) => {
        const job = row.original;
        if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
        
        const formatSalary = (amount: number) => {
          if (amount >= 1000000) {
            return (amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1) + ' triệu';
          }
          return amount.toLocaleString();
        };
        
        if (job.salaryMin === job.salaryMax) {
          return `${formatSalary(job.salaryMin!)}`;
        }
        return `${formatSalary(job.salaryMin || 0)} - ${formatSalary(job.salaryMax || 0)}`;
      },
      enableSorting: false,
    },
    {
      id: "jobType",
      accessorKey: "jobType",
      header: "Loại công việc",
      cell: ({ row }) => {
        const jobType = row.getValue("jobType") as number;
        const typeMap: { [key: string]: string } = {
          0: 'Toàn thời gian',
          1: 'Bán thời gian',
          2: 'Làm từ xa'
        };
        return typeMap[jobType] || jobType;
      },
      enableSorting: true,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return new Date(date).toLocaleDateString('vi-VN');
      },
      enableSorting: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusBadgeColor(status)}>
            {getStatusIcon(status)}
            {getStatusLabel(status)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => handleView(job)}
              variant="outline"
              size="sm"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleEdit(job)}
              variant="outline"
              size="sm"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {/* Actions based on status */}
            {/* {job.status === 'Draft' && (
              <>
                <Button
                  onClick={() => handleApprove(job.jobId)}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                  title="Duyệt"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleReject(job.jobId)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  title="Từ chối"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )} */}
            
            {(job.status === 'Rejected') && (
              <Button
                onClick={() => handleDelete(job)}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ], [startIndex]);

  return (
    <div className="p-6 space-y-6">
      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Tìm kiếm công việc..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Draft">Chờ duyệt</SelectItem>
                  <SelectItem value="Moderated">Đã duyệt</SelectItem>
                  <SelectItem value="Rejected">Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                aria-label="Làm mới"
                title="Làm mới dữ liệu"
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !jobs.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Thử lại
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={paginatedJobs}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          
          {/* Pagination */}
          {!error && filteredJobs.length > 0 && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1} - {endIndex} của {totalItems} kết quả
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">Dòng trên trang</p>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    Trang {currentPage} trên {totalPages}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage >= totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Job Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết công việc</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về vị trí tuyển dụng
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tên công việc
                  </label>
                  <p className="text-sm mt-1">{selectedJob.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Địa điểm
                  </label>
                  <p className="text-sm mt-1">{selectedJob.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mức lương
                  </label>
                  <p className="text-sm mt-1">
                    {!selectedJob.salaryMin && !selectedJob.salaryMax ? 'Thỏa thuận' :
                     selectedJob.salaryMin === selectedJob.salaryMax ? `${selectedJob.salaryMin?.toLocaleString()} VND` :
                     `${selectedJob.salaryMin?.toLocaleString() || 0} - ${selectedJob.salaryMax?.toLocaleString() || 0} VND`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Loại công việc
                  </label>
                  <p className="text-sm mt-1">
                    {selectedJob.jobType === 'FullTime' ? 'Toàn thời gian' :
                     selectedJob.jobType === 'PartTime' ? 'Bán thời gian' :
                     selectedJob.jobType === 'Remote' ? 'Làm từ xa' : selectedJob.jobType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lượt xem
                  </label>
                  <p className="text-sm mt-1">{selectedJob.viewsCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(selectedJob.status)}>
                      {getStatusIcon(selectedJob.status)}
                      {getStatusLabel(selectedJob.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <p className="text-sm mt-1">
                    {new Date(selectedJob.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {selectedJob.openedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ngày mở
                    </label>
                    <p className="text-sm mt-1">
                      {new Date(selectedJob.openedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {selectedJob.expiredAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ngày hết hạn
                    </label>
                    <p className="text-sm mt-1">
                      {new Date(selectedJob.expiredAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả công việc
                </label>
                <div className="text-sm mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedJob.description}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Yêu cầu
                </label>
                <div className="text-sm mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedJob.requirements}
                </div>
              </div>

              {selectedJob.benefits && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Quyền lợi
                  </label>
                  <div className="text-sm mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {selectedJob.benefits}
                  </div>
                </div>
              )}

              {selectedJob.taxonomies && selectedJob.taxonomies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Kỹ năng yêu cầu
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedJob.taxonomies.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <div className="flex space-x-2">
                  {selectedJob.status === 'Draft' && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedJob.jobId);
                          setIsViewDialogOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Duyệt
                      </Button>
                      <Button
                        onClick={() => {
                          handleReject(selectedJob.jobId);
                          setIsViewDialogOpen(false);
                        }}
                        variant="destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Từ chối
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => {
                      handleEdit(selectedJob);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
