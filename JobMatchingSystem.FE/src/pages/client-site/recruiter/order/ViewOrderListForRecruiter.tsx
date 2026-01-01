import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderServices } from "@/services/order.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { Order, OrderStatus } from "@/models/order";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

export default function ViewOrderListForRecruiter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: "",
    isDecending: false,
  });
  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>(
    {
      page: 1,
      size: 10,
      search: "",
      sortBy: "",
      isDecending: false,
    }
  );

  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(
    async (params: PaginationParamsInput) => {
      try {
        setLoading(true);
        setError(null);
        
        const apiParams: any = { ...params };
        
        if (statusFilter !== 'all') {
            apiParams.status = statusFilter;
        }

        const response = await OrderServices.getOrderForRecruiter(apiParams);
        if (response.result) {
            setOrders(response.result.items as unknown as Order[]);
            setPaginationInfo(response.result.pageInfo);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Lỗi khi tải danh sách đơn hàng"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput]);

  const handleRefresh = () => {
    getAllWithPagination({
        ...paginationInput,
        search: debouncedKeyword
    });
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
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPaginationInput((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusBadge = (status: OrderStatus) => {
      switch (status) {
          case "Success":
              return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Thành công</Badge>;
          case "Failed":
              return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Thất bại</Badge>;
          case "Pending":
              return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Đang chờ</Badge>;
          default:
              return <Badge variant="outline">{status}</Badge>;
      }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "index",
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
        id: "transferContent",
        accessorKey: "transferContent",
        header: "Nội dung CK",
        enableSorting: true,
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Số tiền",
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.getValue("amount"))}</span>,
        enableSorting: true,
      },
      {
        id: "buyerName",
        accessorKey: "buyerName",
        header: "Tên người mua",
        enableSorting: true,
      },
      {
        id: "serviceName",
        accessorKey: "serviceName",
        header: "Tên gói dịch vụ",
        cell: ({ row }) => <span className="font-medium">{row.getValue("serviceName")}</span>,
        enableSorting: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            return date ? format(new Date(date), "dd/MM/yyyy HH:mm") : "";
        },
        enableSorting: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        enableSorting: true,
      },
    ],
    [paginationInfo]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Lịch sử mua hàng
        </h1>
        <p className="text-muted-foreground">
          Xem và theo dõi lịch sử giao dịch mua gói dịch vụ của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Tìm kiếm nội dung..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Success">Thành công</SelectItem>
                  <SelectItem value="Failed">Thất bại</SelectItem>
                  <SelectItem value="Pending">Đang chờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                title="Làm mới"
                disabled={loading}
              >
                <RefreshCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !orders.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
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
              data={orders}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          
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
    </div>
  );
}

