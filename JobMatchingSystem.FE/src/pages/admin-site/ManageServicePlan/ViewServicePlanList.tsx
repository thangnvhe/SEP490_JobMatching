import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTable } from "@/components/ui/data-table";
import CreateServicePlanDialog from "@/components/service-plan/CreateServicePlanDialog";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { ServicePlan } from "@/models/service-plan";
import type { PageInfo, PaginationParamsInput } from "@/models/base";
import { ServicePlanServices } from "@/services/service-plan.service";
import { 
  RefreshCcw, 
  Eye, 
  Trash2, 
  Edit,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function ViewServicePlanList() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
  const { toast } = useToast();

  // API calls
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Calling API with params:', params);
      
      // Try pagination first
      try {
        const response = await ServicePlanServices.getAllWithPagination(params);
        console.log('Pagination API response:', response);
        
        // Check if response has the expected structure
        if (response && response.result && Array.isArray(response.result.items)) {
          setServicePlans(response.result.items);
          setPaginationInfo(response.result.pageInfo);
          return;
        }
      } catch (paginationError) {
        console.warn('Pagination API failed, trying getAll:', paginationError);
      }

      // Fallback to getAll if pagination fails
      try {
        const fallbackResponse = await ServicePlanServices.getAll();
        console.log('Fallback getAll response:', fallbackResponse);
        
        if (fallbackResponse && Array.isArray(fallbackResponse.result)) {
          const allItems = fallbackResponse.result;
          
          // Client-side filtering if search exists
          const filteredItems = params.search 
            ? allItems.filter(item => 
                item.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
                item.description?.toLowerCase().includes(params.search!.toLowerCase())
              )
            : allItems;
            
          // Client-side pagination
          const startIndex = (params.page - 1) * params.size;
          const endIndex = startIndex + params.size;
          const pageItems = filteredItems.slice(startIndex, endIndex);
          
          setServicePlans(pageItems);
          setPaginationInfo({
            currentPage: params.page,
            pageSize: params.size,
            totalItem: filteredItems.length,
            totalPage: Math.ceil(filteredItems.length / params.size),
            hasPreviousPage: params.page > 1,
            hasNextPage: endIndex < filteredItems.length,
            sortBy: params.sortBy || '',
            isDecending: params.isDescending || false,
          });
        } else {
          setServicePlans([]);
          setPaginationInfo({
            currentPage: 1,
            pageSize: 10,
            totalItem: 0,
            totalPage: 0,
            hasPreviousPage: false,
            hasNextPage: false,
            sortBy: '',
            isDecending: false,
          });
        }
      } catch (fallbackError) {
        console.error('Both pagination and getAll failed:', fallbackError);
        throw fallbackError;
      }
    } catch (err: any) {
      console.error('API error:', err);
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu gói dịch vụ");
      setServicePlans([]);
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
  const handleRefresh = useCallback(() => {
    getAllWithPagination(paginationInput);
  }, [getAllWithPagination, paginationInput]);

  const handleView = useCallback((servicePlan: ServicePlan) => {
    console.log('Viewing service plan:', servicePlan);
    // TODO: Implement view details modal
  }, []);

  const handleEdit = useCallback((servicePlan: ServicePlan) => {
    console.log('Editing service plan:', servicePlan);
    // TODO: Implement edit dialog
  }, []);

  const handleDeleteServicePlan = useCallback(async (servicePlan: ServicePlan) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa gói dịch vụ "${servicePlan.name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(servicePlan.id.toString());
      await ServicePlanServices.delete(servicePlan.id.toString());
      toast({
        title: "Thành công",
        description: "Xóa gói dịch vụ thành công",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi xóa gói dịch vụ",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  }, [toast, handleRefresh]);

  const handleSortingChange = useCallback((updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
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
  }, [sorting]);

  const handlePageChange = useCallback((page: number) => {
    setPaginationInput(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: string) => {
    setPaginationInput(prev => ({ ...prev, size: parseInt(size), page: 1 }));
  }, []);

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
          <Badge variant="outline" className="flex items-center gap-1 w-fit font-semibold text-green-700 bg-green-50">
            <DollarSign className="h-3 w-3" />
            {formatPrice(price)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "features",
      header: "Tính năng",
      cell: ({ row }) => {
        const servicePlan = row.original;
        const features = [
          servicePlan.jobPostAdditional && `${servicePlan.jobPostAdditional} bài đăng thêm`,
          servicePlan.highlightJobDays && `Nổi bật ${servicePlan.highlightJobDays} ngày`,
          servicePlan.extensionJobDays && `Gia hạn ${servicePlan.extensionJobDays} ngày`,
          servicePlan.cvSaveAdditional && `${servicePlan.cvSaveAdditional} CV thêm`,
        ].filter(Boolean);
        
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{features.length - 2} khác
              </Badge>
            )}
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
  ], [paginationInfo, deleteLoading, handleView, handleEdit, handleDeleteServicePlan, formatPrice]);

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
              <CreateServicePlanDialog onSuccess={handleRefresh} />
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
              data={servicePlans || []}
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
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    Trang {paginationInfo.currentPage} trên {paginationInfo.totalPage}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!paginationInfo.hasPreviousPage}
                    >
                      Đầu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={!paginationInfo.hasPreviousPage}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={!paginationInfo.hasNextPage}
                    >
                      Sau
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={!paginationInfo.hasNextPage}
                    >
                      Cuối
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}