import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye,
  Edit3,
  Plus,
  RefreshCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CheckCircle,
  XCircle,
  X
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
import { useDebounce } from "@/hooks/useDebounce";

// Import types và services
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { type JobDetailResponse } from "@/models/job";
import { type Company } from "@/models/company";
import { useAppSelector } from "@/store";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Import Edit Dialog
import EditJobDialog from "./EditJobDialog";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function ViewJobList() {
  // Redux state để lấy thông tin recruiter hiện tại
  const authState = useAppSelector((state) => state.authState);
  const currentUserId = authState.nameid;
  const navigate = useNavigate();

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Pagination state - server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch jobs với filter theo recruiterId
  const getAllJobs = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Chuẩn bị parameters cho API
      const params: any = {
        Page: currentPage,
        Size: pageSize,
        Search: debouncedKeyword,
        sortBy: sortBy,
        isDescending: isDescending,
        RecuiterId: parseInt(currentUserId) // Filter theo recruiter ID (chú ý: API dùng RecuiterId)
      };
      
      // Thêm status filter nếu có
      if (statusFilter !== 'all') {
        params.Status = parseInt(statusFilter);
      }
      
      console.log('API Request params:', params);
      
      // Add timeout để tránh hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const apiPromise = JobServices.getJobsWithPagination(params);
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      console.log('API Response:', response);
      
      if (response.isSuccess && response.result) {
        // Kiểm tra nếu response có structure paginated
        if (response.result.items && response.result.pageInfo) {
          console.log('Using paginated structure:', response.result);
          setJobs(response.result.items || []);
          setTotalItems(response.result.pageInfo.totalItem || 0);
        } 
        // Nếu response.result là array trực tiếp
        else if (Array.isArray(response.result)) {
          console.log('Using direct array:', response.result.length, 'items');
          const startIdx = (currentPage - 1) * pageSize;
          const endIdx = startIdx + pageSize;
          const paginatedItems = response.result.slice(startIdx, endIdx);
          
          setJobs(paginatedItems);
          setTotalItems(response.result.length);
        } 
        else {
          console.log('Single object or unknown structure:', response.result);
          setJobs([response.result]);
          setTotalItems(1);
        }
      } else {
        setError("Không thể tải danh sách tin tuyển dụng");
        setJobs([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      if (err.message?.includes('timeout')) {
        setError("Tải dữ liệu quá lâu. Vui lòng thử lại!");
      } else {
        setError(err.message || "Lỗi khi tải dữ liệu tin tuyển dụng");
      }
      setJobs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, statusFilter, sortBy, isDescending, currentUserId]);

  // Load jobs on component mount và khi dependencies thay đổi
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
    
    if (newSorting.length > 0) {
      const sortConfig = newSorting[0];
      setSortBy(sortConfig.id);
      setIsDescending(sortConfig.desc);
    } else {
      setSortBy('');
      setIsDescending(false);
    }
    setCurrentPage(1);
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
    
    // Fetch company data nếu có
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

  const handleEdit = (job: JobDetailResponse) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  // Helper functions cho status
  const getStatusBadgeColor = (status: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return 'bg-orange-100 text-orange-800 border border-orange-200'; // Đang chờ duyệt
      case 1:
        return 'bg-red-100 text-red-800 border border-red-200'; // Bị từ chối
      case 2:
        return 'bg-blue-100 text-blue-800 border border-blue-200'; // Đã duyệt
      case 3:
        return 'bg-green-100 text-green-800 border border-green-200'; // Đang mở
      case 4:
        return 'bg-gray-100 text-gray-800 border border-gray-200'; // Đã đóng
      case 5:
        return 'bg-slate-100 text-slate-800 border border-slate-200'; // Đã xóa
      default:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
    }
  };

  const getStatusIcon = (status: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return <Clock className="h-3 w-3 mr-1" />; // Draft
      case 1:
        return <XCircle className="h-3 w-3 mr-1" />; // Rejected
      case 2:
        return <CheckCircle className="h-3 w-3 mr-1" />; // Moderated
      case 3:
        return <CheckCircle className="h-3 w-3 mr-1" />; // Opened
      case 4:
        return <XCircle className="h-3 w-3 mr-1" />; // Closed
      case 5:
        return <XCircle className="h-3 w-3 mr-1" />; // Deleted
      default:
        return null;
    }
  };

  const getStatusLabel = (status: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
      case 0:
        return 'Đang chờ duyệt';
      case 1:
        return 'Bị từ chối';
      case 2:
        return 'Đã duyệt';
      case 3:
        return 'Đang tuyển dụng';
      case 4:
        return 'Đã đóng';
      case 5:
        return 'Đã xóa';
      default:
        return status.toString();
    }
  };

  // Calculate pagination
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + jobs.length, totalItems);
  const safePage = Math.min(currentPage, totalPages);

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
      header: "Tên tin tuyển dụng",
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
            
            {/* Edit Button */}
            <Button
              onClick={() => handleEdit(job)}
              variant="outline"
              size="sm"
              title="Chỉnh sửa"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ], [currentPage, pageSize]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
          <p className="text-muted-foreground">
            Danh sách các tin tuyển dụng của bạn
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/recruiter/jobs/create");
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo tin tuyển dụng mới
        </Button>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Tìm kiếm tin tuyển dụng..."
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
                  <SelectItem value="2">Đã duyệt</SelectItem>
                  <SelectItem value="3">Đang tuyển dụng</SelectItem>
                  <SelectItem value="4">Đã đóng</SelectItem>
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
                <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
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
                Hiển thị {startIndex + 1} - {endIndex} của {totalItems} kết quả
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Số dòng mỗi trang:</p>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={safePage === 1}
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1}
                    title="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm">Trang</span>
                    <span className="text-sm font-semibold">{safePage}</span>
                    <span className="text-sm">của</span>
                    <span className="text-sm font-semibold">{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages}
                    title="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safePage === totalPages}
                    title="Trang cuối"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Job Dialog */}
      {isViewDialogOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-xl overflow-hidden w-full h-full max-w-7xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedJobCompany?.logo && (
                    <img
                      src={selectedJobCompany.logo}
                      alt={selectedJobCompany.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedJob.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedJobCompany?.name || 'Công ty không xác định'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setSelectedJob(null);
                    setSelectedJobCompany(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 h-full overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Địa điểm:</span>
                      <p className="text-sm">{selectedJob.location}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Mức lương:</span>
                      <p className="text-sm">
                        {!selectedJob.salaryMin && !selectedJob.salaryMax 
                          ? 'Thỏa thuận' 
                          : `${selectedJob.salaryMin?.toLocaleString() || 0} - ${selectedJob.salaryMax?.toLocaleString() || 0} VND`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mô tả công việc */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Mô tả công việc</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedJob.description}
                  </div>
                </div>

                {/* Yêu cầu công việc */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Yêu cầu công việc</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedJob.requirements}
                  </div>
                </div>

                {/* Quyền lợi */}
                {selectedJob.benefits && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Quyền lợi</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedJob.benefits}
                    </div>
                  </div>
                )}

                {/* Thông tin khác */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Thông tin khác</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Số năm kinh nghiệm:</span>
                      <p>{selectedJob.experienceYear} năm</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Loại công việc:</span>
                      <p>
                        {(typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 0 ? 'Toàn thời gian' : 
                         (typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 1 ? 'Bán thời gian' : 
                         (typeof selectedJob.jobType === 'string' ? parseInt(selectedJob.jobType) : selectedJob.jobType) === 2 ? 'Làm từ xa' : 'Khác'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Ngày tạo:</span>
                      <p>{new Date(selectedJob.createdAt!).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Trạng thái:</span>
                      <Badge className={getStatusBadgeColor(selectedJob.status)}>
                        {getStatusIcon(selectedJob.status)}
                        {getStatusLabel(selectedJob.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Dialog */}
      {isEditDialogOpen && selectedJob && (
        <EditJobDialog
          job={selectedJob}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedJob(null);
          }}
          onSave={() => {
            getAllJobs(); // Refresh data
          }}
        />
      )}
    </div>
  );
}