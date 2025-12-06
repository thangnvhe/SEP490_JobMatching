import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTable } from "@/components/ui/data-table";
import CreateTemplateCvDialog from "@/components/template-cv/CreateTemplateCvDialog";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { TemplateCv } from "@/models/template-cv";
import type { PageInfo, PaginationParamsInput } from "@/models/base";
import { TemplateCvServices } from "@/services/template-cv.service";
import { 
  RefreshCcw, 
  Eye, 
  Trash2, 
  Download,
  Image as ImageIcon,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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

export default function ViewTemplateCvList() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateCv[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCv | null>(null);
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
    isDecending: false,
  });

  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  // API calls
  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TemplateCvServices.getAllWithPagination(params);
      setTemplates(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu template CV");
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

  const handleView = (template: TemplateCv) => {
    if (template.pathUrl) {
      window.open(template.pathUrl, '_blank');
    }
  };

  const handleDownload = (template: TemplateCv) => {
    if (template.pathUrl) {
      const link = document.createElement('a');
      link.href = template.pathUrl;
      link.download = `${template.name}.html`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (template: TemplateCv) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;

    try {
      setDeleteLoading(true);
      await TemplateCvServices.delete(selectedTemplate.id.toString());
      toast.success("Xóa template CV thành công");
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      getAllWithPagination(paginationInput);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi xóa template CV"
      );
    } finally {
      setDeleteLoading(false);
    }
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

  // Columns definition
  const columns = useMemo<ColumnDef<TemplateCv>[]>(() => [
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
      header: "Tên Template",
      enableSorting: true,
    },
    {
      id: "imageUrl",
      accessorKey: "imageUrl",
      header: "Ảnh xem trước",
      cell: ({ row }) => {
        const imageUrl = row.getValue("imageUrl") as string | null;
        return imageUrl ? (
          <div className="flex items-center justify-center w-16 h-12 rounded border overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove('hidden');
                  fallback.classList.add('flex');
                }
              }}
            />
            <div className="hidden items-center justify-center w-full h-full bg-gray-100">
              <ImageIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-16 h-12 rounded border bg-gray-100">
            <ImageIcon className="h-4 w-4 text-gray-400" />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "pathUrl",
      accessorKey: "pathUrl",
      header: "File Template",
      cell: ({ row }) => {
        const pathUrl = row.getValue("pathUrl") as string;
        return pathUrl ? (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <FileText className="h-3 w-3" />
            HTML
          </Badge>
        ) : (
          <span className="text-gray-400">Không có file</span>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleView(template)}
              variant="outline"
              size="sm"
              title="Xem trước"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDownload(template)}
              variant="outline"
              size="sm"
              title="Tải xuống"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDelete(template)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
              title="Xóa template"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ], [paginationInfo]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Template CV</h1>
        <p className="text-muted-foreground">Theo dõi, tìm kiếm và quản lý các template CV trong hệ thống</p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm template CV..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex space-x-2">
              <CreateTemplateCvDialog onSuccess={handleRefresh} />
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
          {loading && !templates.length ? (
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
              data={templates}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa template CV?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa template "{selectedTemplate?.name}".
              Bạn không thể hoàn tác hành động này.
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