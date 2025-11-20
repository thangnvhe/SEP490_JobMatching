import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ExternalLink,
  Check,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
// Import types và services
import { CompanyServices } from "@/services/company.service";
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

export function ManageCompanyPage() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectedCompanyId, setRejectedCompanyId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort state
  const [sortBy, setSortBy] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  
  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch companies
  const getAllCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API với đầy đủ parameters
      const response = await CompanyServices.getAllCompanies({
        page: currentPage,
        size: pageSize,
        search: debouncedKeyword,
        sortBy: sortBy,
        isDecending: isDescending,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      if (response?.isSuccess && response?.result) {
        const pagedData = response.result as any;
        // Xử lý response từ backend - API trả về pageInfo chứ không phải pager
        const items = pagedData.items || [];
        const pageInfo = pagedData.pageInfo || {};
        setCompanies(items);
        setTotalItems(pageInfo.totalItem || 0);
      } else {
        setError("Không thể tải danh sách công ty");
        setCompanies([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải dữ liệu công ty");
      setCompanies([]);
      setTotalItems(0);
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, statusFilter, sortBy, isDescending]);

  // Không cần filter client-side nữa vì backend đã xử lý
  useEffect(() => {
    setFilteredCompanies(companies);
  }, [companies]);

  // Load companies on component mount and when dependencies change
  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  // Handler functions
  const handleRefresh = () => {
    getAllCompanies();
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

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (company: Company) => {
    try {
      await CompanyServices.deleteCompany(String(company.id));
      setCompanies(prev => prev.filter(c => c.id !== company.id));
      setFilteredCompanies(prev => prev.filter(c => c.id !== company.id));
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleToggleActive = async (companyId: number | undefined) => {
    if (!companyId) return;
    try {
      // Call API to toggle company status
      // This might need to be implemented in CompanyServices
      console.log("Toggle active status for company:", companyId);
      // For now, just refresh the data
      await getAllCompanies();
    } catch (error) {
      console.error("Error toggling company status:", error);
    }
  };

  const handleApprove = async (companyId: number | undefined) => {
    if (!companyId) return;
    try {
      await CompanyServices.acceptCompany(String(companyId));
      setIsViewDialogOpen(false);
      await getAllCompanies();
    } catch (error) {
      console.error("Error approving company:", error);
    }
  };

  const handleReject = (companyId: number | undefined) => {
    if (!companyId) return;
    setRejectedCompanyId(companyId);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectedCompanyId) return;
    try {
      await CompanyServices.rejectCompany(String(rejectedCompanyId), rejectReason);
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setRejectedCompanyId(null);
      setIsViewDialogOpen(false);
      await getAllCompanies();
    } catch (error) {
      console.error("Error rejecting company:", error);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <Clock className="h-3 w-3 mr-1" />;
      case 1:
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 2:
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Chờ duyệt';
      case 1:
        return 'Đã duyệt';
      case 2:
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  // Calculate pagination (server-side)
  const paginatedData = filteredCompanies;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedTotalItems = totalItems;
  
  // Đảm bảo currentPage không vượt quá totalPages
  const safePage = Math.min(currentPage, totalPages);

  // Define columns
  const columns = useMemo<ColumnDef<Company>[]>(() => [
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
      id: "companyName",
      accessorKey: "name",
      header: "Tên công ty",
      enableSorting: true,
      cell: ({ row }) => {
        const name = row.getValue("companyName") as string;
        return (
          <div title={name} className="max-w-[200px] truncate text-sm font-medium">
            {truncateText(name, 50)}
          </div>
        );
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div title={email} className="max-w-[180px] truncate text-sm text-muted-foreground">
            {truncateText(email, 40)}
          </div>
        );
      },
    },
    {
      id: "taxCode",
      accessorKey: "taxCode",
      header: "Mã số thuế",
      enableSorting: true,
      cell: ({ row }) => {
        const taxCode = row.getValue("taxCode") as string;
        return (
          <div className="text-sm">
            {taxCode || 'Chưa có'}
          </div>
        );
      },
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Địa chỉ",
      enableSorting: true,
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        return (
          <div title={address} className="max-w-[150px] truncate text-sm">
            {address ? truncateText(address, 30) : 'Chưa có'}
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
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
        const company = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => handleView(company)}
              variant="outline"
              size="sm"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {/* Toggle Active/Inactive */}
            <Button
              onClick={() => handleToggleActive(company.id)}
              variant="outline"
              size="sm"
              className={company.status === 1 ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
              title={company.status === 1 ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              {company.status === 1 ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
            
            {(company.status === 2) && (
              <Button
                onClick={() => handleDelete(company)}
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
                placeholder="Tìm kiếm công ty..."
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
                  <SelectItem value="0">Chờ duyệt</SelectItem>
                  <SelectItem value="1">Đã duyệt</SelectItem>
                  <SelectItem value="2">Bị từ chối</SelectItem>
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
          {loading && !companies.length ? (
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
              data={paginatedData}
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

      {/* View Company Dialog - Custom Full Screen */}
      {isViewDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-xl overflow-hidden w-full h-full max-w-7xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết công ty
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Content */}
            {selectedCompany && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6" style={{ height: 'calc(100% - 73px)' }}>
                {/* Left Column - Company Information */}
                <div className="space-y-4 overflow-y-auto pr-3">
                {/* Company Header */}
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
                      {getFullImageUrl(selectedCompany.logo) ? (
                        <img
                          src={getFullImageUrl(selectedCompany.logo)!}
                          alt={`${selectedCompany.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedCompany.name}
                    </h3>
                    <Badge className={`${getStatusBadgeColor(selectedCompany.status)} text-xs px-2 py-1`}>
                      {getStatusIcon(selectedCompany.status)}
                      {getStatusLabel(selectedCompany.status)}
                    </Badge>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <label className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wide">
                        Email liên hệ
                      </label>
                      <div className="flex items-center text-gray-900">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{selectedCompany.email}</span>
                      </div>
                    </div>

                    {selectedCompany.phoneContact && (
                      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <label className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wide">
                          Số điện thoại
                        </label>
                        <div className="flex items-center text-gray-900">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">{selectedCompany.phoneContact}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <label className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wide">
                        Mã số thuế
                      </label>
                      <div className="flex items-center text-gray-900">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">{selectedCompany.taxCode || 'Chưa có'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <label className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wide">
                        Địa chỉ
                      </label>
                      <div className="flex items-start text-gray-900">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-2 mt-0.5">
                          <MapPin className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium leading-relaxed">{selectedCompany.address || 'Chưa có'}</span>
                      </div>
                    </div>

                    {selectedCompany.website && (
                      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <label className="text-xs font-semibold text-gray-700 block mb-1 uppercase tracking-wide">
                          Website
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedCompany.website, '_blank')}
                          className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 text-sm py-3"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </div>
                          Truy cập website công ty
                        </Button>
                      </div>
                    )}

                    {selectedCompany.description && (
                      <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <label className="text-xs font-semibold text-gray-700 block mb-2 uppercase tracking-wide">
                          Mô tả công ty
                        </label>
                        <p className="text-sm text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-lg">
                          {selectedCompany.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Pending Companies */}
                  {selectedCompany.status === 0 && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDialogOpen(false)}
                        className="flex-1 text-sm py-3"
                        size="sm"
                      >
                        Đóng
                      </Button>
                      <Button 
                        onClick={() => handleApprove(selectedCompany.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-3"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Duyệt công ty
                      </Button>
                      <Button 
                        onClick={() => handleReject(selectedCompany.id)}
                        variant="destructive"
                        className="flex-1 text-sm py-3"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                  
                  {/* Close button for non-pending companies */}
                  {selectedCompany.status !== 0 && (
                    <div className="flex justify-center pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewDialogOpen(false)}
                        className="px-8 text-sm py-3"
                        size="sm"
                      >
                        Đóng
                      </Button>
                    </div>
                  )}
                </div>
              </div>              {/* Right Column - Business License */}
              <div className="space-y-4 overflow-y-auto pl-3">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 h-full border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Giấy phép kinh doanh
                    </h4>
                  </div>

                  {getFullImageUrl(selectedCompany.licenseFile) ? (
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300 shadow-sm">
                      <div className="mb-4 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="text-base font-bold text-gray-900 mb-1">
                          Giấy phép kinh doanh
                        </h5>
                      </div>
                      
                      {/* Display the license image directly */}
                      <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden mb-4">
                        <img
                          src={getFullImageUrl(selectedCompany.licenseFile)!}
                          alt="Giấy phép kinh doanh"
                          className="w-full h-full object-contain bg-gray-50"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => window.open(getFullImageUrl(selectedCompany.licenseFile)!, '_blank')}
                        className="w-full text-sm py-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở trong tab mới
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-400 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h5 className="text-lg font-bold text-gray-900 mb-2">
                        Chưa có giấy phép kinh doanh
                      </h5>
                      <p className="text-sm text-gray-500">
                        Công ty chưa tải lên giấy phép kinh doanh
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối công ty</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vui lòng nhập lý do từ chối công ty này.
            </p>
            <div>
              <label className="text-sm font-medium block mb-1">Lý do từ chối *</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason('');
                setRejectedCompanyId(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmReject}
              variant="destructive"
              disabled={!rejectReason.trim()}
            >
              <X className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}