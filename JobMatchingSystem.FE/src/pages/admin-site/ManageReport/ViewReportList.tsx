import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Eye,
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
import { ReportService } from "@/services/report.service";
import { JobServices } from "@/services/job.service";
import { UserServices } from "@/services/user.service";
import { ReportItem, ReportStatus } from "@/models/report";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

export default function ViewReportList() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Pagination state
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
    isDescending: false,
  });
  
  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  // Function to enrich reports with job and user data
  const enrichReportsData = async (reports: ReportItem[]): Promise<ReportItem[]> => {
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const enrichedReport = { ...report };
        
        // Fetch job title
        try {
          const jobResponse = await JobServices.getById(report.jobId.toString());
          if (jobResponse.isSuccess && jobResponse.result) {
            enrichedReport.jobTitle = jobResponse.result.title;
          }
        } catch (error) {
          console.error(`Error fetching job ${report.jobId}:`, error);
          enrichedReport.jobTitle = `Job #${report.jobId}`;
        }
        
        // Fetch reporter name
        try {
          const userResponse = await UserServices.getById(report.reporterId.toString());
          if (userResponse.isSuccess && userResponse.result) {
            enrichedReport.reporterName = userResponse.result.fullName || userResponse.result.userName || `User #${report.reporterId}`;
          }
        } catch (error) {
          console.error(`Error fetching user ${report.reporterId}:`, error);
          enrichedReport.reporterName = `User #${report.reporterId}`;
        }
        
        return enrichedReport;
      })
    );
    return enrichedReports;
  };

  // Fetch reports with server-side pagination and filtering
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      
      // Thêm status filter vào params nếu có
      const requestParams = { ...params };
      if (statusFilter) {
        requestParams.status = statusFilter;
      }
      
      const response = await ReportService.getAllWithPagination(requestParams);
      
      // Enrich reports data with job and user information
      const enrichedReports = await enrichReportsData(response.result.items);
      setReports(enrichedReports);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu báo cáo");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load reports on component mount and when dependencies change
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
          isDescending: undefined,
        };
      }

      const sort = newSorting[0];
      return {
        ...prev,
        sortBy: sort.id,
        isDescending: !!sort.desc,
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
    setStatusFilter(status === 'all' ? undefined : status);
    setPaginationInput(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (report: ReportItem) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleApprove = async (reportId: number) => {
    try {
      const response = await ReportService.updateReportCensor(reportId, {
        status: 1, // Approved
        note: "Báo cáo được chấp nhận"
      });
      if (response.isSuccess) {
        getAllWithPagination(paginationInput); // Refresh data
      } else {
        console.error("Failed to approve report:", response.errorMessages);
      }
    } catch (error) {
      console.error("Error approving report:", error);
    }
  };

  const handleReject = async (reportId: number) => {
    try {
      const response = await ReportService.updateReportCensor(reportId, {
        status: 2, // Rejected
        note: "Báo cáo bị từ chối"
      });
      if (response.isSuccess) {
        getAllWithPagination(paginationInput); // Refresh data
      } else {
        console.error("Failed to reject report:", response.errorMessages);
      }
    } catch (error) {
      console.error("Error rejecting report:", error);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: ReportStatus | number | string) => {
    // Handle both string and number values
    let normalizedStatus: string;
    
    if (typeof status === 'number') {
      switch (status) {
        case 0: normalizedStatus = 'Pending'; break;
        case 1: normalizedStatus = 'Approved'; break;
        case 2: normalizedStatus = 'Rejected'; break;
        default: normalizedStatus = status.toString();
      }
    } else {
      normalizedStatus = status.toString();
    }
    
    switch (normalizedStatus) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ReportStatus | number | string) => {
    // Handle both string and number values
    let normalizedStatus: string;
    
    if (typeof status === 'number') {
      switch (status) {
        case 0: normalizedStatus = 'Pending'; break;
        case 1: normalizedStatus = 'Approved'; break;
        case 2: normalizedStatus = 'Rejected'; break;
        default: normalizedStatus = status.toString();
      }
    } else {
      normalizedStatus = status.toString();
    }
    
    switch (normalizedStatus) {
      case 'Pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'Approved':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'Rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: ReportStatus | number | string) => {
    // Handle both string and number values
    let normalizedStatus: string;
    
    if (typeof status === 'number') {
      // Convert number to string enum
      switch (status) {
        case 0: normalizedStatus = 'Pending'; break;
        case 1: normalizedStatus = 'Approved'; break;
        case 2: normalizedStatus = 'Rejected'; break;
        default: normalizedStatus = status.toString();
      }
    } else {
      normalizedStatus = status.toString();
    }
    
    // Convert to Vietnamese
    switch (normalizedStatus) {
      case 'Pending':
        return 'Đang chờ xử lý';
      case 'Approved':
        return 'Đã chấp nhận';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        console.log('Unknown status:', status);
        return 'Không xác định';
    }
  };

  const getReportTypeLabel = (subject: number | string) => {
    // Handle both string and number values
    let normalizedSubject: string;
    
    if (typeof subject === 'number') {
      // Convert number to string enum
      switch (subject) {
        case 0: normalizedSubject = 'Spam'; break;
        case 1: normalizedSubject = 'InappropriateContent'; break;
        case 2: normalizedSubject = 'FraudulentJobPosting'; break;
        case 3: normalizedSubject = 'Other'; break;
        default: normalizedSubject = subject.toString();
      }
    } else {
      normalizedSubject = subject;
    }
    
    // Convert to Vietnamese
    switch (normalizedSubject) {
      case 'Spam':
        return 'Thư rác/Spam';
      case 'InappropriateContent':
        return 'Nội dung không phù hợp';
      case 'FraudulentJobPosting':
        return 'Việc làm giả mạo';
      case 'Other':
        return 'Khác';
      default:
        console.log('Unknown report type:', subject);
        return 'Không xác định';
    }
  };


  // Define columns
  const columns = useMemo<ColumnDef<ReportItem>[]>(() => [
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
      id: "jobTitle",
      accessorKey: "jobTitle",
      header: "Tên công việc",
      enableSorting: false,
      cell: ({ row }) => {
        const jobTitle = row.getValue("jobTitle") as string;
        const jobId = row.original.jobId;
        return (
          <div className="text-sm max-w-[200px]">
            <div className="font-medium truncate" title={jobTitle}>
              {jobTitle || `Job #${jobId}`}
            </div>
          </div>
        );
      },
    },
    {
      id: "subject",
      accessorKey: "subject",
      header: "Loại báo cáo",
      enableSorting: true,
      cell: ({ row }) => {
        const subject = row.getValue("subject") as number;
        return (
          <Badge variant="outline" className="text-xs">
            {getReportTypeLabel(subject)}
          </Badge>
        );
      },
    },
    {
      id: "reporterName",
      accessorKey: "reporterName",
      header: "Người báo cáo",
      enableSorting: false,
      cell: ({ row }) => {
        const reporterName = row.getValue("reporterName") as string;
        const reporterId = row.original.reporterId;
        return (
          <div className="text-sm">
            <div className="font-medium">
              {reporterName || `User #${reporterId}`}
            </div>
          </div>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Ngày báo cáo",
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
        const status = row.getValue("status") as ReportStatus;
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
        const report = row.original;
        const status = report.status;
        // Handle both string and number status values
        let normalizedStatus: string;
        if (typeof status === 'string') {
          normalizedStatus = status;
        } else if (typeof status === 'number') {
          normalizedStatus = status === 0 ? 'Pending' : status === 1 ? 'Approved' : status === 2 ? 'Rejected' : String(status);
        } else {
          normalizedStatus = String(status);
        }
        const isPending = normalizedStatus === 'Pending';
        
        return (
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => handleView(report)}
              variant="outline"
              size="sm"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {isPending && (
              <Button
                onClick={() => handleApprove(report.id)}
                variant="outline"
                size="sm"
                className="text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
                title="Chấp nhận"
              >
                <Check className="h-4 w-4" />
              </Button>
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
        <h1 className="text-2xl font-bold tracking-tight">Quản lý báo cáo</h1>
        <p className="text-muted-foreground">Theo dõi, xử lý và quản lý các báo cáo từ người dùng về công việc</p>
      </div>
      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Tìm kiếm báo cáo..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
              <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="0">Đang chờ xử lý</SelectItem>
                  <SelectItem value="1">Đã chấp nhận</SelectItem>
                  <SelectItem value="2">Đã từ chối</SelectItem>
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
          {loading && !reports.length ? (
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
              data={reports}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          
          {/* Pagination */}
          {!error && paginationInfo && paginationInfo.totalItem > 0 && (
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

      {/* View Report Dialog */}
      {isViewDialogOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden min-w-[500px] max-w-4xl w-auto max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Chi tiết báo cáo #{selectedReport.id}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Loại: {getReportTypeLabel(selectedReport.subject)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      ID báo cáo
                    </label>
                    <p className="text-sm mt-1 font-mono">{selectedReport.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Công việc được báo cáo
                    </label>
                    <p className="text-sm mt-1">{selectedReport.jobTitle || `Job #${selectedReport.jobId}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Người báo cáo
                    </label>
                    <p className="text-sm mt-1">{selectedReport.reporterName || `User #${selectedReport.reporterId}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Loại báo cáo
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {getReportTypeLabel(selectedReport.subject)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      <Badge className={getStatusBadgeColor(selectedReport.status)}>
                        {getStatusIcon(selectedReport.status)}
                        {getStatusLabel(selectedReport.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ngày báo cáo
                    </label>
                    <p className="text-sm mt-1">
                      {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {/* TODO: Uncomment when backend supports verifiedAt 
                  {selectedReport.verifiedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Ngày xử lý
                      </label>
                      <p className="text-sm mt-1">
                        {new Date(selectedReport.verifiedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                  */}
                  {/* TODO: Uncomment when backend supports verifiedById
                  {selectedReport.verifiedById && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Người xử lý
                      </label>
                      <p className="text-sm mt-1 font-mono">{selectedReport.verifiedById}</p>
                    </div>
                  )}
                  */}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lý do báo cáo
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.reason}</p>
                  </div>
                </div>
                
                {selectedReport.note && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ghi chú của admin
                    </label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.note}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons for pending reports */}
              {(() => {
                const status = selectedReport.status;
                let normalizedStatus: string;
                if (typeof status === 'string') {
                  normalizedStatus = status;
                } else if (typeof status === 'number') {
                  normalizedStatus = status === 0 ? 'Pending' : status === 1 ? 'Approved' : status === 2 ? 'Rejected' : String(status);
                } else {
                  normalizedStatus = String(status);
                }
                return normalizedStatus === 'Pending';
              })() && (
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedReport.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Chấp nhận báo cáo
                  </Button>
                  <Button
                    onClick={() => {
                      handleReject(selectedReport.id);
                      setIsViewDialogOpen(false);
                    }}
                    variant="destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Từ chối báo cáo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
