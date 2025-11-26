import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Eye,
  Trash2,
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

// Import types và services
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { type Job } from "@/models/job";
import { type Company } from "@/models/company";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { API_BASE_URL } from "../../../../env";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper function để tạo URL tuỷệt đối cho file
const getFullImageUrl = (relativePath: string | null | undefined): string | null => {
  if (!relativePath) return null;
  // Nếu đã là URL đầy đủ thì trả về luôn
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // Nếu là đường dẫn tương đối thì kết hợp với base URL
  const baseUrl = API_BASE_URL.replace('/api', ''); // Loại bỏ /api khỏi cuối
  return `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};

export default function ViewJobList() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobCompany, setSelectedJobCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
    size: 10,
    search: '',
    sortBy: '',
    isDecending: false,
  });
  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      
      // Thêm status filter nếu có
      const apiParams = { ...params };
      
      if (statusFilter === 'deleted') {
        // Nếu chọn "Xóa mềm" thì truyền isDeleted = true
        apiParams.isDeleted = true;
      } else if (statusFilter !== 'all') {
        // Nếu không phải "tất cả" hoặc "xóa mềm" thì truyền status cụ thể và chỉ lấy chưa xóa
        apiParams.status = parseInt(statusFilter);
        apiParams.isDeleted = false;
      }
      // Nếu statusFilter === 'all' thì không truyền isDeleted để lấy tất cả
      
      const response = await JobServices.getAllWithPagination(apiParams);
      setJobs(response.result.items);
      // API now returns pagination metadata in `pageInfo`
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu công việc");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput]);

  // Handler functions
  const handleRefresh = () => {
    getAllWithPagination(paginationInput);
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    setPaginationInput(prev => {
      if (!newSorting.length) {
        return {
          ...prev,
          sortBy: undefined,
          isDecending: undefined,
        };
      }

      const sort = newSorting[0];
      return {
        ...prev,
        sortBy: sort.id,
        isDecending: !!sort.desc,
      };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput(prev => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPaginationInput(prev => ({ ...prev, page: 1 }));
  };

  const handleView = async (job: Job) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
    
    // Fetch company data if available
    if (job.companyId) {
      try {
        const response = await CompanyServices.getCompanyById(job.companyId.toString());
        if (response.isSuccess) {
          setSelectedJobCompany(response.result);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    }
  };

  const handleApprove = async (jobId: number) => {
    try {
      await JobServices.censorJob(jobId.toString(), { status: 2 }); // Moderated
      handleRefresh(); // Refresh data
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  const handleReject = async (jobId: number) => {
    try {
      await JobServices.censorJob(jobId.toString(), { status: 1 }); // Rejected
      handleRefresh(); // Refresh data
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleActivateDeactivate = async (job: Job) => {
    try {
      // Toggle giữa Opened (3) và Closed (4)
      const newStatus = job.status === 'Opened' ? 4 : 3;
      await JobServices.censorJob(job.jobId.toString(), { status: newStatus });
      handleRefresh(); // Refresh data
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const handleSoftDelete = async (job: Job) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa công việc "${job.title}" không?`)) {
      return;
    }
    
    try {
      await JobServices.delete(job.jobId.toString());
      handleRefresh(); // Refresh data
      alert('Xóa công việc thành công!');
    } catch (error: any) {
      console.error("Error soft deleting job:", error);
      const errorMessage = error?.response?.data?.message || "Lỗi khi xóa công việc";
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: string, isDeleted?: boolean) => {
    // Nếu job đã bị xóa mềm
    if (isDeleted) {
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Moderated':
        return 'bg-blue-100 text-blue-800';
      case 'Opened':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, isDeleted?: boolean) => {
    // Nếu job đã bị xóa mềm
    if (isDeleted) {
      return <XCircle className="h-3 w-3 mr-1" />;
    }
    
    switch (status) {
      case 'Draft':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'Rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'Moderated':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'Opened':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'Closed':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string, isDeleted?: boolean) => {
    // Nếu job đã bị xóa mềm
    if (isDeleted) {
      return 'Đã xóa';
    }
    
    switch (status) {
      case 'Draft':
        return 'Đang chờ duyệt';
      case 'Rejected':
        return 'Bị từ chối';
      case 'Moderated':
        return 'Đã kiểm duyệt';
      case 'Opened':
        return 'Đang mở';
      case 'Closed':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  // Define columns
  const columns = useMemo<ColumnDef<Job>[]>(() => [
    {
      id: "id",
      accessorKey: "jobId",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return (paginationInfo.currentPage - 1) * paginationInfo.pageSize + index + 1;
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
        const jobType = row.getValue("jobType") as string;
        const typeMap: { [key: string]: string } = {
          'FullTime': 'Toàn thời gian',
          'PartTime': 'Bán thời gian',
          'Remote': 'Làm từ xa',
          'Other': 'Khác'
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
        const job = row.original;
        return (
          <Badge className={getStatusBadgeColor(status, job.isDeleted)}>
            {getStatusIcon(status, job.isDeleted)}
            {getStatusLabel(status, job.isDeleted)}
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
            
            {/* Chỉ hiển thị các nút cho jobs chưa bị xóa mềm */}
            {!job.isDeleted && (
              <>
                {/* Nút Accept cho jobs đang chờ duyệt (Draft) */}
                {job.status === 'Draft' && (
                  <Button
                    onClick={() => handleApprove(job.jobId)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                    title="Duyệt công việc"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Nút Xóa mềm cho jobs đã duyệt hoặc đã mở/đóng */}
                {(job.status === 'Moderated' || job.status === 'Opened' || job.status === 'Closed') && (
                  <Button
                    onClick={() => handleSoftDelete(job)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    title="Xóa mềm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ], [paginationInfo]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý công việc</h1>
        <p className="text-muted-foreground">Theo dõi, tìm kiếm và cập nhật danh sách công việc trong hệ thống</p>
      </div>
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
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="0">Đang chờ duyệt</SelectItem>
                  <SelectItem value="1">Bị từ chối</SelectItem>
                  <SelectItem value="2">Đã kiểm duyệt</SelectItem>
                  <SelectItem value="3">Đang mở</SelectItem>
                  <SelectItem value="4">Đã đóng</SelectItem>
                  <SelectItem value="deleted">Đã xóa</SelectItem>
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
              data={jobs}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          
          {/* Pagination */}
          {!error && paginationInfo && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1} - {Math.min(paginationInfo.currentPage * paginationInfo.pageSize, paginationInfo.totalItem)} của {paginationInfo.totalItem} kết quả
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">Dòng trên trang</p>
                  <Select
                    value={paginationInfo.pageSize.toString()}
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
                    Trang {paginationInfo.currentPage} trên {paginationInfo.totalPage}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
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

      {/* View Job Dialog - Custom Full Screen */}
      {isViewDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-xl overflow-hidden w-full h-full max-w-7xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Company Logo */}
                  {selectedJobCompany?.logo && (
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                      <img
                        src={getFullImageUrl(selectedJobCompany.logo)!}
                        alt={`${selectedJobCompany.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedJob?.title}
                    </h2>
                    {selectedJobCompany && (
                      <p className="text-sm text-gray-600">
                        {selectedJobCompany.name}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setSelectedJobCompany(null); // Clear company data when closing
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            {selectedJob && (
              <div className="p-6 h-full overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
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
                         selectedJob.jobType === 'Remote' ? 'Làm từ xa' :
                         selectedJob.jobType === 'Other' ? 'Khác' : selectedJob.jobType}
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
                        {selectedJob.taxonomies.map((taxonomy: any, index: number) => (
                          <Badge key={taxonomy.id || index} variant="secondary">
                            {taxonomy.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setSelectedJobCompany(null); // Clear company data when closing
                      }}
                    >
                      Đóng
                    </Button>
                    <div className="flex space-x-2">
                      {/* Approve/Reject buttons for Draft status */}
                      {selectedJob.status === 'Draft' && !selectedJob.isDeleted && (
                        <>
                          <Button
                            onClick={() => {
                              handleApprove(selectedJob.jobId);
                              setIsViewDialogOpen(false);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            onClick={() => {
                              handleReject(selectedJob.jobId);
                              setIsViewDialogOpen(false);
                            }}
                            variant="destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      
                      {/* Activate button chỉ cho jobs đã đóng (status = Closed) */}
                      {selectedJob.status === 'Closed' && (
                        <Button
                          onClick={() => {
                            handleActivateDeactivate(selectedJob);
                            setIsViewDialogOpen(false);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Kích hoạt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
