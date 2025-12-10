import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Trash2, CheckCircle, RefreshCcw, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ExternalLink, XCircle } from "lucide-react";
// Import các UI components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
// Import types và services
import { CompanyServices } from "@/services/company.service";
import { getStatusString, type Company } from "@/models/company";
import { useDebounce } from "@/hooks/useDebounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { PageInfo, PaginationParamsInput } from "@/models/base";

// Helper function để cắt ngắn text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper function để chuyển đổi status sang tiếng Việt
const getStatusLabel = (status: number): string => {
  const statusString = getStatusString(status);
  switch (statusString) {
    case 'Pending':
      return 'Chờ duyệt';
    case 'Approved':
      return 'Đã duyệt';
    case 'Rejected':
      return 'Bị từ chối';
    default:
      return 'Chờ duyệt';
  }
};

// Helper function để lấy màu badge cho status
const getStatusBadgeColor = (status: number): string => {
  switch (status) {
    case 0: // Pending
      return 'bg-yellow-100 text-yellow-800';
    case 1: // Approved
      return 'bg-green-100 text-green-800';
    case 2: // Rejected
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

import { ViewCompanyDetailDialog } from "./ViewCompanyDetailDialog";

export function ManageCompanyPage() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company>({} as Company);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [acceptedCompanyId, setAcceptedCompanyId] = useState<number>(0);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectedCompanyId, setRejectedCompanyId] = useState<number>(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletedCompany, setDeletedCompany] = useState<Company | null>(null);

  // Pagination states
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
    status: 'all',
  });

  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Fetch companies
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CompanyServices.getAllCompaniesWithPagination(params);
      setCompanies(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu công ty');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);

    setPaginationInput((prev) => {
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
        page: 1, // Reset to first page when sorting
      };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    // Convert "deleted" → "-1" để backend hiểu
    const statusValue = status === 'deleted' ? '-1' : status;
    setPaginationInput((prev) => ({ ...prev, page: 1, status: statusValue }));
  };

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (companyId: number) => {
    try {
      await CompanyServices.changeStatus(String(companyId));
      await getAllWithPagination(paginationInput);
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const acceptCompany = async (companyId: number) => {
    try {
      await CompanyServices.acceptCompany(String(companyId));
      await getAllWithPagination(paginationInput);
    } catch (error: any) {
      console.error('Error accepting company:', error);
    }
  };

  const rejectCompany = async (companyId: number, rejectReason: string) => {
    try {
      await CompanyServices.rejectCompany(String(companyId), rejectReason);
      await getAllWithPagination(paginationInput);
    } catch (error: any) {
      console.error('Error rejecting company:', error);
    }
  };


  // Define columns
  const columns = useMemo<ColumnDef<Company>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return (
          (paginationInfo.currentPage - 1) * paginationInfo.pageSize +
          index +
          1
        );
      },
      enableSorting: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Tên công ty",
      enableSorting: true,
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
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
      id: "licenseFile",
      accessorKey: "licenseFile",
      header: "Giấy phép kinh doanh",
      enableSorting: false,
      cell: ({ row }) => {
        const company = row.original;
        return (
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open(company.licenseFile, '_blank')}
            className="text-blue-600 hover:text-blue-800 h-auto p-0 font-normal"
            title="Giấy phép kinh doanh"
          >
            Xem
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
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
            {getStatusLabel(status)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Hoạt động",
      cell: ({ row }) => {
        const company = row.original;
        const isActive = company.isActive !== false; // Mặc định là true nếu không có field này
        return (
          <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
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
        const isActive = company.isActive  // Mặc định là true nếu không có field này

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

            {isActive && (
              <>
                {company.status === 0 && (
                  <>
                    <Button
                      onClick={() => {
                        setAcceptedCompanyId(company.id);
                        setIsAcceptDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
                      title="Duyệt công ty"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setRejectedCompanyId(company.id);
                        setIsRejectDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                      title="Từ chối công ty"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {company.status === 1 && (
                  <Button
                    onClick={() => {
                      setDeletedCompany(company);
                      setIsDeleteDialogOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                    title="Xóa công ty"
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
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý công ty
        </h1>
        <p className="text-muted-foreground">
          Theo dõi, tìm kiếm và cập nhật danh sách công ty trong hệ thống
        </p>
      </div>
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
              data={companies}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}

          {/* Pagination */}
          {!error && paginationInfo && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1}{" "}
                -{" "}
                {Math.min(
                  paginationInfo.currentPage * paginationInfo.pageSize,
                  paginationInfo.totalItem
                )}{" "}
                của {paginationInfo.totalItem} kết quả
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
                    Trang {paginationInfo.currentPage} trên{" "}
                    {paginationInfo.totalPage}
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
                      onClick={() =>
                        handlePageChange(paginationInfo.currentPage - 1)
                      }
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(paginationInfo.currentPage + 1)
                      }
                      disabled={
                        paginationInfo.currentPage >=
                        paginationInfo.totalPage || loading
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={
                        paginationInfo.currentPage >=
                        paginationInfo.totalPage || loading
                      }
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
      <ViewCompanyDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        company={selectedCompany}
      />

      {/* Accept Confirmation Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận duyệt công ty</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn duyệt công ty này không?
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAcceptDialogOpen(false);
                setAcceptedCompanyId(0);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                if (acceptedCompanyId) {
                  await acceptCompany(acceptedCompanyId);
                  setIsAcceptDialogOpen(false);
                  setAcceptedCompanyId(0);
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận duyệt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                setRejectedCompanyId(0);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={async () => {
                if (rejectedCompanyId && rejectReason.trim()) {
                  await rejectCompany(rejectedCompanyId, rejectReason);
                  setIsRejectDialogOpen(false);
                  setRejectReason('');
                  setRejectedCompanyId(0);
                }
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận vô hiệu hóa công ty</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn vô hiệu hóa công ty <span className="font-semibold">{deletedCompany?.name}</span> không?
            </p>
            <p className="text-sm text-red-600">
              Hành động này sẽ vô hiệu hóa công ty và không thể hoàn tác.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletedCompany(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deletedCompany) {
                  await handleDelete(deletedCompany.id);
                  setIsDeleteDialogOpen(false);
                  setDeletedCompany(null);
                }
              }}
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}