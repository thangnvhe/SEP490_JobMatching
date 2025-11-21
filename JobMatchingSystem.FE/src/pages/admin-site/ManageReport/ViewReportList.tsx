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
import { ReportService } from "@/services/report.service";
import { type ReportItem } from "@/models/report";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function ViewReportList() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Pagination state - server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch reports with server-side pagination and filtering
  const getAllReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chuẩn bị parameters cho API
      const params: any = {
        page: currentPage,
        size: pageSize,
        search: debouncedKeyword,
        sortBy: sortBy,
        isDescending: isDescending
      };
      
      // Thêm status filter nếu có
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      console.log('API Request params:', params);
      
      // Add timeout để tránh hang
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const apiPromise = ReportService.getReportsWithPagination(params);
      
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      console.log('API Response:', response);
      
      if (response.isSuccess && response.result) {
        // Kiểm tra nếu response có structure paginated với items và pageInfo
        if (response.result.items && response.result.pageInfo) {
          console.log('Using paginated structure:', response.result);
          setReports(response.result.items || []);
          setTotalItems(response.result.pageInfo.totalItem || 0);
        } 
        // Nếu response.result là array trực tiếp (không phân trang)
        else if (Array.isArray(response.result)) {
          console.log('Using direct array:', response.result.length, 'items');
          setReports(response.result);
          setTotalItems(response.result.length);
        } 
        else {
          console.log('Single object or unknown structure:', response.result);
          setReports([response.result]);
          setTotalItems(1);
        }
      } else {
        setError("Không thể tải danh sách báo cáo");
        setReports([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      if (err.message?.includes('timeout')) {
        setError("Tải dữ liệu quá lâu - có thể do server đang xử lý nhiều dữ liệu. Vui lòng thử lại!");
      } else {
        setError(err.message || "Lỗi khi tải dữ liệu báo cáo");
      }
      setReports([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, statusFilter, sortBy, isDescending]);

  // Load reports on component mount and when dependencies change
  useEffect(() => {
    getAllReports();
  }, [getAllReports]);

  // Handler functions
  const handleRefresh = () => {
    getAllReports();
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

  const handleView = (report: ReportItem) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleApprove = async (reportId: number) => {
    try {
      await ReportService.updateReportStatus(reportId, "Approved", "Báo cáo được chấp nhận");
      getAllReports(); // Refresh data
    } catch (error) {
      console.error("Error approving report:", error);
    }
  };

  const handleReject = async (reportId: number) => {
    try {
      await ReportService.updateReportStatus(reportId, "Rejected", "Báo cáo bị từ chối");
      getAllReports(); // Refresh data
    } catch (error) {
      console.error("Error rejecting report:", error);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'approved':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'approved':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'spam':
        return 'Spam';
      case 'fake_job':
        return 'Việc làm giả';
      case 'inappropriate':
        return 'Nội dung không phù hợp';
      case 'discrimination':
        return 'Phân biệt đối xử';
      default:
        return type;
    }
  };

  // Calculate pagination (server-side)
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + reports.length, totalItems);
  const displayedTotalItems = totalItems;
  
  // Đảm bảo currentPage không vượt quá totalPages
  const safePage = Math.min(currentPage, totalPages);

  // Define columns
  const columns = useMemo<ColumnDef<ReportItem>[]>(() => [
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
      id: "id",
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => {
        const id = row.getValue("id") as number;
        return <div className="text-sm font-mono">{id}</div>;
      },
    },
    {
      id: "jobId",
      accessorKey: "jobId",
      header: "Job ID",
      enableSorting: true,
      cell: ({ row }) => {
        const jobId = row.getValue("jobId") as number;
        return <div className="text-sm font-mono">{jobId}</div>;
      },
    },
    {
      id: "subject",
      accessorKey: "subject",
      header: "Loại báo cáo",
      enableSorting: true,
      cell: ({ row }) => {
        const subject = row.getValue("subject") as string;
        return (
          <Badge variant="outline" className="text-xs">
            {getReportTypeLabel(subject)}
          </Badge>
        );
      },
    },
    {
      id: "reason",
      accessorKey: "reason",
      header: "Lý do",
      enableSorting: false,
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string;
        return (
          <div title={reason} className="max-w-[200px] truncate text-sm">
            {truncateText(reason, 50)}
          </div>
        );
      },
    },
    {
      id: "reporterId",
      accessorKey: "reporterId",
      header: "Người báo cáo",
      enableSorting: true,
      cell: ({ row }) => {
        const reporterId = row.getValue("reporterId") as string;
        return <div className="text-sm font-mono">{reporterId}</div>;
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
        const report = row.original;
        const isPending = report.status.toLowerCase() === 'pending';
        
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
              <>
                <Button
                  onClick={() => handleApprove(report.id)}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                  title="Chấp nhận"
                >
                  <Check className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={() => handleReject(report.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  title="Từ chối"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
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
                placeholder="Tìm kiếm báo cáo..."
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
                  <SelectItem value="Pending">Đang chờ xử lý</SelectItem>
                  <SelectItem value="Approved">Đã chấp nhận</SelectItem>
                  <SelectItem value="Rejected">Đã từ chối</SelectItem>
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

      {/* View Report Dialog */}
      {isViewDialogOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[85vh]">
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
            <div className="p-6 overflow-y-auto" style={{ height: 'calc(85vh - 73px)' }}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      ID báo cáo
                    </label>
                    <p className="text-sm mt-1 font-mono">{selectedReport.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Job ID
                    </label>
                    <p className="text-sm mt-1 font-mono">{selectedReport.jobId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Người báo cáo
                    </label>
                    <p className="text-sm mt-1 font-mono">{selectedReport.reporterId}</p>
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
              {selectedReport.status.toLowerCase() === 'pending' && (
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
