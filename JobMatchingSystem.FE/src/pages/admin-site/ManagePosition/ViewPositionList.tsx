import { useCallback, useEffect, useMemo, useState } from "react";
import { PositionService } from "@/services/position.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { Position } from "@/models/position";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { EditPositionDialog } from "./EditPositionDialog";
import { CreatePositionDialog } from "./CreatePositionDialog";
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

export default function ViewPositionList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
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
  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 10,
    search: "",
    sortBy: "",
    isDecending: false,
  });
  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(
    async (params: PaginationParamsInput) => {
      try {
        setLoading(true);
        setError(null);
        const response = await PositionService.getAllWithPagination(params);
        if (response.isSuccess && response.result) {
          setPositions(response.result.items);
          setPaginationInfo(response.result.pageInfo);
        } else {
          setError("Không thể tải danh sách vị trí");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu vị trí");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput]);

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
        return { ...prev, sortBy: undefined, isDecending: undefined };
      }
      const sort = newSorting[0];
      return { ...prev, sortBy: sort.id, isDecending: !!sort.desc };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPosition) return;

    try {
      setDeleteLoading(true);
      await PositionService.delete(selectedPosition.positionId.toString());
      toast.success("Xóa vị trí thành công");
      setIsDeleteDialogOpen(false);
      setSelectedPosition(null);
      getAllWithPagination(paginationInput);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa vị trí");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<Position>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        cell: ({ row }) => {
          return (
            (paginationInfo.currentPage - 1) * paginationInfo.pageSize +
            row.index +
            1
          );
        },
        enableSorting: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Tên vị trí",
        enableSorting: true,
        cell: ({ row }) => {
          const name = row.getValue("name") as string;
          return <span className="font-medium">{name || "Chưa cập nhật"}</span>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const position = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleEdit(position)}
                variant="outline"
                size="sm"
                title="Chỉnh sửa"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(position)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                title="Xóa vị trí"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [paginationInfo]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý vị trí</h1>
        <p className="text-muted-foreground">
          Theo dõi, tìm kiếm và cập nhật danh sách vị trí trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm vị trí..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm vị trí
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                aria-label="Làm mới"
                title="Làm mới dữ liệu"
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !positions.length ? (
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
              data={positions}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          {!error && paginationInfo && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1} -{" "}
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

      {/* Edit Position Dialog */}
      <EditPositionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        position={selectedPosition}
        onUpdateSuccess={handleRefresh}
      />

      {/* Create Position Dialog */}
      <CreatePositionDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateSuccess={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa vị trí?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vị trí "{selectedPosition?.name}".
              Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
