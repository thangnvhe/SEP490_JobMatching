import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Eye,
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

// Import types và services
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { type JobDetailResponse } from "@/models/job";
import { type Company } from "@/models/company";
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
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobDetailResponse | null>(null);
  const [selectedJobCompany, setSelectedJobCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Pagination state - chuyển sang server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch jobs with server-side pagination and filtering
  const getAllJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chuẩn bị parameters cho API với timeout
      const params: any = {
        page: currentPage,
        size: pageSize,
        search: debouncedKeyword,
        sortBy: sortBy,
        isDescending: isDescending
      };
      
      // Thêm status filter nếu có
      if (statusFilter !== 'all') {
        params.status = parseInt(statusFilter);
      }
      
      console.log('API Request params:', params);
      
      // Add timeout để tránh hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const apiPromise = JobServices.searchJobs(params);
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      console.log('API Response:', response);
      
      if (response.isSuccess && response.result) {
        // Kiểm tra nếu response có structure paginated với items và pageInfo
        if (response.result.items && response.result.pageInfo) {
          console.log('Using paginated structure:', response.result);
          setJobs(response.result.items || []);
          setTotalItems(response.result.pageInfo.totalItem || 0);
        } 
        // Nếu response.result là array trực tiếp (không phân trang)
        else if (Array.isArray(response.result)) {
          console.log('Using direct array:', response.result.length, 'items');
          // Trong trường hợp này, backend không hỗ trợ pagination
          // Chúng ta cần tính toán manual
          const startIdx = (currentPage - 1) * pageSize;
          const endIdx = startIdx + pageSize;
          const paginatedItems = response.result.slice(startIdx, endIdx);
          
          setJobs(paginatedItems);
          setTotalItems(response.result.length);
        } 
        // Nếu không phải array và không có structure paginated
        else {
          console.log('Single object or unknown structure:', response.result);
          setJobs([response.result]);
          setTotalItems(1);
        }
      } else {
        setError("Không thể tải danh sách công việc");
        setJobs([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      if (err.message?.includes('timeout')) {
        setError("Tải dữ liệu quá lâu - có thể do server đang xử lý nhiều dữ liệu. Vui lòng thử lại!");
      } else {
        setError(err.message || "Lỗi khi tải dữ liệu công việc");
      }
      setJobs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, statusFilter, sortBy, isDescending]);

  // Load jobs on component mount and when dependencies change
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
    
    // Convert sorting to backend format
    if (newSorting.length > 0) {
      const sortConfig = newSorting[0];
      setSortBy(sortConfig.id);
      setIsDescending(sortConfig.desc);
    } else {
      setSortBy('');
      setIsDescending(false);
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleView = async (job: JobDetailResponse) => {
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
      await JobServices.censorJob(jobId.toString(), { Status: 2 }); // Moderated
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  const handleReject = async (jobId: number) => {
    try {
      await JobServices.censorJob(jobId.toString(), { Status: 1 }); // Rejected
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleActivateDeactivate = async (job: JobDetailResponse) => {
    try {
      // Toggle giữa Opened (3) và Closed (4)
      // Ensure status is treated as a number (API may return string or number)
      const statusNum = typeof job.status === 'string' ? parseInt(job.status, 10) || 0 : (job.status as number | undefined) ?? 0;
      const newStatus = statusNum === 3 ? 4 : 3;
      await JobServices.censorJob(job.jobId.toString(), { Status: newStatus });
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const handleSoftDelete = async (job: JobDetailResponse) => {
    try {
      await JobServices.censorJob(job.jobId.toString(), { Status: 5 }); // Soft Delete
      getAllJobs(); // Refresh data
    } catch (error) {
      console.error("Error soft deleting job:", error);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: number | string) => {
    // Handle string status from API
    if (typeof status === 'string') {
      const lowerStatus = status.toLowerCase();
      switch (lowerStatus) {
        case 'draft':
          return 'bg-yellow-100 text-yellow-800'; // Draft/Waiting
        case 'rejected':
          return 'bg-red-100 text-red-800'; // Rejected
        case 'moderated':
          return 'bg-blue-100 text-blue-800'; // Moderated
        case 'opened':
          return 'bg-green-100 text-green-800'; // Opened
        case 'closed':
          return 'bg-red-100 text-red-800'; // Closed
        case 'deleted':
          return 'bg-gray-100 text-gray-800'; // Deleted
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Handle numeric status
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return 'bg-yellow-100 text-yellow-800'; // Draft/Waiting
      case 1:
        return 'bg-red-100 text-red-800'; // Rejected
      case 2:
        return 'bg-blue-100 text-blue-800'; // Moderated
      case 3:
        return 'bg-green-100 text-green-800'; // Opened
      case 4:
        return 'bg-red-100 text-red-800'; // Closed
      case 5:
        return 'bg-gray-100 text-gray-800'; // Deleted
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: number | string) => {
    // Handle string status from API
    if (typeof status === 'string') {
      const lowerStatus = status.toLowerCase();
      switch (lowerStatus) {
        case 'draft':
          return <Clock className="h-3 w-3 mr-1" />; // Draft/Waiting
        case 'rejected':
          return <XCircle className="h-3 w-3 mr-1" />; // Rejected
        case 'moderated':
          return <CheckCircle className="h-3 w-3 mr-1" />; // Moderated
        case 'opened':
          return <CheckCircle className="h-3 w-3 mr-1" />; // Opened
        case 'closed':
          return <XCircle className="h-3 w-3 mr-1" />; // Closed
        case 'deleted':
          return <Trash2 className="h-3 w-3 mr-1" />; // Deleted
        default:
          return null;
      }
    }
    
    // Handle numeric status
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return <Clock className="h-3 w-3 mr-1" />; // Draft/Waiting
      case 1:
        return <XCircle className="h-3 w-3 mr-1" />; // Rejected
      case 2:
        return <CheckCircle className="h-3 w-3 mr-1" />; // Moderated
      case 3:
        return <CheckCircle className="h-3 w-3 mr-1" />; // Opened
      case 4:
        return <XCircle className="h-3 w-3 mr-1" />; // Closed
      case 5:
        return <Trash2 className="h-3 w-3 mr-1" />; // Deleted
      default:
        return null;
    }
  };

  const getStatusLabel = (status: number | string) => {
    // Handle string status from API
    if (typeof status === 'string') {
      const lowerStatus = status.toLowerCase();
      switch (lowerStatus) {
        case 'draft':
          return 'Đang chờ duyệt';
        case 'rejected':
          return 'Bị từ chối';
        case 'moderated':
          return 'Đã kiểm duyệt';
        case 'opened':
          return 'Đang mở';
        case 'closed':
          return 'Đã đóng';
        case 'deleted':
          return 'Đã xóa';
        default:
          return `Trạng thái: ${status}`;
      }
    }
    
    // Handle numeric status
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return 'Đang chờ duyệt';
      case 1:
        return 'Bị từ chối';
      case 2:
        return 'Đã kiểm duyệt';
      case 3:
        return 'Đang mở';
      case 4:
        return 'Đã đóng';
      case 5:
        return 'Đã xóa';
      default:
        console.log('Unknown status:', status); // Debug log
        return `Trạng thái: ${status}`; // Show actual status value for debugging
    }
  };

  // Calculate pagination (server-side)
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + jobs.length, totalItems); // Sử dụng actual length
  const displayedTotalItems = totalItems;
  
  // Đảm bảo currentPage không vượt quá totalPages
  const safePage = Math.min(currentPage, totalPages);
  
  console.log('Pagination Info:', {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    actualDataLength: jobs.length
  });

  // Define columns
  const columns = useMemo<ColumnDef<JobDetailResponse>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return (currentPage - 1) * pageSize + index + 1;
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
        const status = row.getValue("status") as number | string;
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
            
            {/* Soft Delete Button for jobs that are not deleted yet */}
            {(typeof job.status === 'string' ? parseInt(job.status) : job.status) !== 5 && (
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
          </div>
        );
      },
      enableSorting: false,
    },
  ], [currentPage, pageSize]);

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
                  <SelectItem value="5">Đã xóa</SelectItem>
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
          {!error && totalItems > 0 && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1} - {endIndex} của {displayedTotalItems} kết quả
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
                    Trang {safePage} trên {totalPages || 1}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={safePage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage >= totalPages || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={safePage >= totalPages || loading}
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
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
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
                        {(typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 0 ? 'Toàn thời gian' :
                         (typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 1 ? 'Bán thời gian' :
                         (typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 2 ? 'Làm từ xa' : selectedJob.jobType}
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
                      {(typeof selectedJob.status === 'string' ? parseInt(selectedJob.status) : selectedJob.status) === 0 && (
                        <>
                          <Button
                            onClick={() => {
                              handleApprove(selectedJob.jobId);
                              setIsViewDialogOpen(false);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Đồng ý
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
                      
                      {/* Activate button chỉ cho jobs đã đóng (status = 4) */}
                      {(typeof selectedJob.status === 'string' ? parseInt(selectedJob.status) : selectedJob.status) === 4 && (
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
