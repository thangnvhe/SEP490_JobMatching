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
  ChevronsRight,
  ExternalLink
} from "lucide-react";

// Import các UI components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { CompanyServices } from "@/services/company.service";
import { type Company } from "@/models/company";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
        
        console.log('API Debug:', { 
          totalItem: pageInfo.totalItem, 
          totalPage: pageInfo.totalPage, 
          currentPage: pageInfo.currentPage, 
          pageSize: pageInfo.pageSize,
          itemsLength: items.length 
        });
        
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

  const handleEdit = (company: Company) => {
    // TODO: Navigate to edit page
    console.log("Edit company:", company);
  };

  const handleApprove = async (companyId: number | undefined) => {
    if (!companyId) return;
    try {
      await CompanyServices.acceptCompany(String(companyId));
      // Remove from list after approval
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      setFilteredCompanies(prev => prev.filter(c => c.id !== companyId));
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
      // Remove from list after rejection  
      setCompanies(prev => prev.filter(c => c.id !== rejectedCompanyId));
      setFilteredCompanies(prev => prev.filter(c => c.id !== rejectedCompanyId));
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setRejectedCompanyId(null);
    } catch (error) {
      console.error("Error rejecting company:", error);
    }
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

  // Helper functions
  const getStatusBadgeColor = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <Clock className="h-3 w-3 mr-1" />;
      case 2:
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 3:
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Chờ duyệt';
      case 2:
        return 'Đã duyệt';
      case 3:
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

  console.log('Pagination Debug:', { 
    totalItems, 
    pageSize, 
    totalPages, 
    currentPage, 
    safePage,
    filteredCompaniesLength: filteredCompanies.length 
  });

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
            <Button
              onClick={() => handleEdit(company)}
              variant="outline"
              size="sm"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {/* Actions based on status */}
            {company.status === 1 && (
              <>
                <Button
                  onClick={() => handleApprove(company.id)}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700"
                  title="Duyệt"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleReject(company.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  title="Từ chối"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {(company.status === 3) && (
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
                  <SelectItem value="1">Chờ duyệt</SelectItem>
                  <SelectItem value="2">Đã duyệt</SelectItem>
                  <SelectItem value="3">Bị từ chối</SelectItem>
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

      {/* View Company Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết công ty</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về công ty
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Company Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tên công ty
                    </label>
                    <p className="text-sm mt-1 font-semibold">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm mt-1">{selectedCompany.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Mã số thuế
                    </label>
                    <p className="text-sm mt-1">{selectedCompany.taxCode || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Điện thoại
                    </label>
                    <p className="text-sm mt-1">{selectedCompany.phoneContact || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Website
                    </label>
                    <div className="mt-1">
                      {selectedCompany.website ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedCompany.website, '_blank')}
                          className="h-8"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Xem website công ty
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </label>
                    <div className="mt-1">
                      <Badge className={getStatusBadgeColor(selectedCompany.status)}>
                        {getStatusIcon(selectedCompany.status)}
                        {getStatusLabel(selectedCompany.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Địa chỉ
                  </label>
                  <p className="text-sm mt-1">{selectedCompany.address || 'Chưa có'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mô tả
                  </label>
                  <div className="text-sm mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selectedCompany.description || 'Chưa có mô tả'}
                  </div>
                </div>
              </div>

              {/* Right Column - Documents */}
              <div className="space-y-6">
                {selectedCompany.licenseFile && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Giấy phép kinh doanh
                    </label>
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedCompany.licenseFile, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Xem giấy phép kinh doanh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Dialog Footer */}
          {selectedCompany && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Đóng
              </Button>
              <div className="flex space-x-2">
                {selectedCompany.status === 1 && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedCompany.id);
                        setIsViewDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Duyệt
                    </Button>
                    <Button
                      onClick={() => {
                        handleReject(selectedCompany.id);
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
                    handleEdit(selectedCompany);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Company Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối công ty</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối công ty này.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lý do từ chối *</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full mt-1"
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