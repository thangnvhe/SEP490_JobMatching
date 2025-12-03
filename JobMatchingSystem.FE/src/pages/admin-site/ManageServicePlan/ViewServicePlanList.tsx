import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTable } from "@/components/ui/data-table";
import CreateEditServicePlanDialog from "@/pages/admin-site/ManageServicePlan/CreateEditServicePlan";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { ServicePlan } from "@/models/service-plan";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { ServicePlanServices } from "@/services/service-plan.service";
import {
  RefreshCcw,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ViewServicePlanList() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicePlanToDelete, setServicePlanToDelete] = useState<ServicePlan | null>(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedServicePlan, setSelectedServicePlan] = useState<ServicePlan | null>(null);
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

  // API calls
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ServicePlanServices.getAllWithPagination(params);
      setServicePlans(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu gói dịch vụ");
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

  const handleView = (servicePlan: ServicePlan) => {
    // TODO: Implement view details modal
    console.log('Viewing service plan:', servicePlan);
  };

  const handleEdit = (servicePlan: ServicePlan) => {
    setSelectedServicePlan(servicePlan);
    setEditDialogOpen(true);
  };

  const handleDeleteServicePlan = (servicePlan: ServicePlan) => {
    setServicePlanToDelete(servicePlan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!servicePlanToDelete) return;

    try {
      setDeleteLoading(servicePlanToDelete.id.toString());
      await ServicePlanServices.delete(servicePlanToDelete.id.toString());
      toast.success("Xóa gói dịch vụ thành công");
      handleRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa gói dịch vụ");
    } finally {
      setDeleteLoading(null);
      setDeleteDialogOpen(false);
      setServicePlanToDelete(null);
    }
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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Columns definition
  const columns = useMemo<ColumnDef<ServicePlan>[]>(() => [
    {
      id: "id",
      accessorKey: "id",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return (paginationInfo.currentPage - 1) * paginationInfo.pageSize + index + 1;
      },
      enableSorting: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Tên gói",
      enableSorting: true,
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <span className="max-w-xs truncate" title={description}>
            {description}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return (
          <div className="font-medium">
            {formatPrice(price)}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "features",
      header: "Tính năng",
      cell: ({ row }) => {
        const servicePlan = row.original;
        
        const featureList = [
          servicePlan.jobPostAdditional && {
            label: `${servicePlan.jobPostAdditional} bài đăng`,
            color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
            tooltip: "Số lượng bài đăng tin tuyển dụng"
          },
          servicePlan.highlightJobDays && {
            label: `Nổi bật ${servicePlan.highlightJobDays} ngày`,
            color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
            tooltip: "Thời gian hiển thị tin nổi bật"
          },
          servicePlan.extensionJobDays && {
            label: `Gia hạn ${servicePlan.extensionJobDays} ngày`,
            color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
            tooltip: "Thời gian gia hạn tin đăng"
          },
          servicePlan.cvSaveAdditional && {
            label: `${servicePlan.cvSaveAdditional} CV`,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
            tooltip: "Số lượng CV được phép xem"
          },
        ].filter(Boolean) as { label: string; color: string; tooltip: string }[];

        return (
          <div className="flex flex-wrap gap-2 max-w-[300px]">
            {featureList.map((item, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center px-2.5 py-0.5 border ${item.color} transition-colors cursor-help`}
                    >
                      <span className="font-medium">{item.label}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const servicePlan = row.original;
        const isDeleting = deleteLoading === servicePlan.id.toString();

        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleView(servicePlan)}
              variant="outline"
              size="sm"
              title="Xem chi tiết"
              disabled={isDeleting}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleEdit(servicePlan)}
              variant="outline"
              size="sm"
              title="Chỉnh sửa"
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDeleteServicePlan(servicePlan)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              title="Xóa gói dịch vụ"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ], [paginationInfo, deleteLoading]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Gói Dịch vụ</h1>
        <p className="text-muted-foreground">Theo dõi, tìm kiếm và quản lý các gói dịch vụ trong hệ thống</p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm gói dịch vụ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex space-x-2">
              <CreateEditServicePlanDialog onSuccess={handleRefresh} />
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
          {loading && !servicePlans.length ? (
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
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={servicePlans}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
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

      {/* Edit Dialog */}
      <CreateEditServicePlanDialog
        servicePlan={selectedServicePlan}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn gói dịch vụ "{servicePlanToDelete?.name}". 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={!!deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa gói dịch vụ"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}