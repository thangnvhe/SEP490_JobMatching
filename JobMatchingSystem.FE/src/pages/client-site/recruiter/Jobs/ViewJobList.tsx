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
  X,
  Filter
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
import { type Job } from "@/models/job";
import { type Company } from "@/models/company";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Import Edit Dialog
import EditJobDialog from "./EditJobDialog";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function ViewJobList() {
  const navigate = useNavigate();

  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobCompany, setSelectedJobCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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

  // Fetch jobs với filter
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      
      // Merge status filter into params
      const apiParams: any = { ...params };
      if (statusFilter !== 'all') {
        apiParams.status = parseInt(statusFilter);
      }
      
      const response = await JobServices.getAllMyJobsPagination(apiParams);
      
      if (response.isSuccess && response.result) {
          setJobs(response.result.items);
          setPaginationInfo(response.result.pageInfo);
      } else {
          setError("Không thể tải danh sách tin tuyển dụng");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu tin tuyển dụng");
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

  const handleEdit = (job: Job) => {
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

  // Define columns
  const columns = useMemo<ColumnDef<Job>[]>(() => [
    {
      id: "stt",
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
      header: "Tên tin tuyển dụng",
      enableSorting: true,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const job = row.original;
        return (
          <div title={title} className="max-w-[200px] truncate text-sm">
            <button
              onClick={() => {
                navigate(`/recruiter/recruitment-process/${job.jobId}`);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
            >
              {truncateText(title, 30)}
            </button>
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
  ], [paginationInfo, navigate]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tin tuyển dụng</h1>
          <p className="text-muted-foreground">
            Danh sách các tin tuyển dụng của bạn
          </p>
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
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </div>
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
                onClick={() => navigate("/recruiter/jobs/create")}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo tin tuyển dụng</span>
              </Button>
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
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
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
            getAllWithPagination(paginationInput); // Refresh data
          }}
        />
      )}
    </div>
  );
}