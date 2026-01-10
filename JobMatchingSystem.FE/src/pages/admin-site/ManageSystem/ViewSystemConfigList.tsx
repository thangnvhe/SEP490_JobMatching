import { useCallback, useEffect, useMemo, useState } from "react";
import { SystemConfigService } from "@/services/system-config.service";
import { SystemConfig } from "@/models/system-config";
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
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { EditSystemConfigDialog } from "./EditSystemConfigDialog";
import { CreateSystemConfigDialog } from "./CreateSystemConfigDialog";
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

/**
 * Component hiển thị danh sách System Config
 * Theo nguyên tắc SRP: chỉ xử lý việc hiển thị và quản lý danh sách config
 */
export default function ViewSystemConfigList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<SystemConfig[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedKeyword = useDebounce(keyword, 700);
  const pageSizeOptions = [5, 10, 20, 50];

  // Định nghĩa mô tả cho các config (wrapped in useMemo)
  const configDescriptions = useMemo(() => ({
    job: {
      JobQuota: "Hạn mức số lượng job",
      SaveCV: "Số lượng CV được lưu",
    },
    report_company: {
      Fraudulent: "Hình phạt khi bị report là lừa đảo",
      Spam: "Hình phạt khi bị report là spam",
      Inappropriate: "Hình phạt nội dung không phù hợp",
      Other: "Hình phạt cho các loại report khác",
    },
    report_reporter: {
      Fraudulent: "Hình phạt khi report sai loại lừa đảo",
      Spam: "Hình phạt khi report sai loại spam",
      Inappropriate: "Hình phạt report sai loại không phù hợp",
      Other: "Hình phạt cho các loại report sai khác",
    },
    education_level: {
      "Cao đẳng": "Cấp độ 1",
      "Đại học": "Cấp độ 2",
      "Kỹ sư": "Cấp độ 2",
      "Cử nhân": "Cấp độ 2",
      "Thạc sĩ": "Cấp độ 3",
      "Tiến sĩ": "Cấp độ 4",
    },
    save_cv: {
      SaveCVCount: "Số lượng CV được phép lưu",
    },
  }), []);

  // Lấy danh sách tất cả config types với label
  const configTypes = useMemo(() => {
    const typeLabels: Record<string, string> = {
      job: "Job - Hạn mức công việc",
      report_company: "Report Company - Hình phạt công ty",
      report_reporter: "Report Reporter - Hình phạt người report",
      education_level: "Education Level - Cấp độ học vấn",
      save_cv: "Save CV - Lưu CV",
    };
    const types = Array.from(new Set(configs.map((c) => c.type)))
      .sort()
      .map((type) => ({ value: type, label: typeLabels[type] || type }));
    return types;
  }, [configs]);

  // Fetch tất cả configs
  const fetchAllConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await SystemConfigService.getAllConfigs();
      
      if (response.isSuccess && response.result) {
        setConfigs(response.result);
      } else {
        setError(response.errorMessages?.[0] || "Không thể tải danh sách cấu hình");
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { errorMessages?: string[] } } })
        .response?.data?.errorMessages?.[0] || "Lỗi khi tải dữ liệu cấu hình";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllConfigs();
  }, [fetchAllConfigs]);

  // Filter configs theo keyword và type
  useEffect(() => {
    let filtered = [...configs];

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    // Filter by keyword
    if (debouncedKeyword) {
      const lowerKeyword = debouncedKeyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerKeyword) ||
          c.type.toLowerCase().includes(lowerKeyword) ||
          c.value.toLowerCase().includes(lowerKeyword)
      );
    }

    setFilteredConfigs(filtered);
    // Reset về trang 1 khi filter thay đổi
    setCurrentPage(1);
  }, [configs, debouncedKeyword, typeFilter]);

  // Tính toán pagination info
  const paginationInfo = useMemo(() => {
    const totalItem = filteredConfigs.length;
    const totalPage = Math.ceil(totalItem / pageSize);
    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPage;

    return {
      totalItem,
      totalPage,
      currentPage,
      pageSize,
      hasPreviousPage,
      hasNextPage,
    };
  }, [filteredConfigs.length, currentPage, pageSize]);

  // Tính toán paginated data
  const paginatedConfigs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredConfigs.slice(startIndex, endIndex);
  }, [filteredConfigs, currentPage, pageSize]);

  // Handlers cho pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchAllConfigs();
  };

  const handleEdit = (config: SystemConfig) => {
    setSelectedConfig(config);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (config: SystemConfig) => {
    setSelectedConfig(config);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedConfig) return;

    try {
      setDeleteLoading(true);
      const response = await SystemConfigService.deleteConfig(selectedConfig.id);
      
      if (response.isSuccess) {
        toast.success("Xóa cấu hình thành công");
        setIsDeleteDialogOpen(false);
        setSelectedConfig(null);
        fetchAllConfigs();
      } else {
        toast.error(response.errorMessages?.[0] || "Không thể xóa cấu hình");
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { errorMessages?: string[] } } })
        .response?.data?.errorMessages?.[0] || "Lỗi khi xóa cấu hình";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchAllConfigs();
  };

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);
  };

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<SystemConfig>[]>(() => {
    return [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
        enableSorting: true,
        cell: ({ row }) => {
          return <span className="font-medium">{row.original.id}</span>;
        },
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Loại",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {row.original.type}
            </Badge>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        header: "Tên cấu hình",
        enableSorting: true,
        cell: ({ row }) => {
          return <span className="font-medium">{row.original.name}</span>;
        },
      },
      {
        id: "description",
        header: "Mô tả",
        enableSorting: false,
        cell: ({ row }) => {
          const config = row.original;
          const typeDesc = configDescriptions[config.type as keyof typeof configDescriptions];
          const description = typeDesc ? (typeDesc as Record<string, string>)[config.name] || "" : "";
          return (
            <span className="text-sm text-muted-foreground">
              {description || "—"}
            </span>
          );
        },
      },
      {
        id: "value",
        accessorKey: "value",
        header: "Giá trị",
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <span className="font-mono text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
              {row.original.value}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => {
          const config = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleEdit(config)}
                variant="outline"
                size="sm"
                title="Chỉnh sửa"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(config)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                title="Xóa cấu hình"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [configDescriptions]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý cấu hình hệ thống</h1>
        <p className="text-muted-foreground">
          Theo dõi, tìm kiếm và cập nhật các cấu hình hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, loại hoặc giá trị..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-sm"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {configTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm cấu hình
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
          {loading && !configs.length ? (
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
            <>
              <DataTable
                columns={columns}
                data={paginatedConfigs}
                loading={loading}
                sorting={sorting}
                onSortingChange={handleSortingChange}
              />

              {/* Pagination */}
              {paginationInfo.totalItem > 0 && (
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateSystemConfigDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Edit Dialog */}
      <EditSystemConfigDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleSuccess}
        config={selectedConfig}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cấu hình "<strong>{selectedConfig?.name}</strong>" không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
