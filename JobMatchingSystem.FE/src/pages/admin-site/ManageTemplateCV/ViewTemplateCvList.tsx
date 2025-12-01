import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  FileText
} from "lucide-react";

export default function ViewTemplateCvList() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateCv[]>([]);
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
  const handleRefresh = useCallback(() => {
    getAllWithPagination(paginationInput);
  }, [getAllWithPagination, paginationInput]);

  const handleView = useCallback((template: TemplateCv) => {
    if (template.pathUrl) {
      window.open(template.pathUrl, '_blank');
    }
  }, []);

  const handleDownload = useCallback((template: TemplateCv) => {
    if (template.pathUrl) {
      const link = document.createElement('a');
      link.href = template.pathUrl;
      link.download = `${template.name}.html`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleDeleteTemplate = useCallback(async (template: TemplateCv) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa template "${template.name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(template.id.toString());
      await TemplateCvServices.delete(template.id.toString());
      toast({
        title: "Thành công",
        description: "Xóa template CV thành công",
      });
      handleRefresh();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi xóa template CV",
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
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center w-full h-full bg-gray-100">
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
        const isDeleting = deleteLoading === template.id.toString();
        
        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleView(template)}
              variant="outline"
              size="sm"
              title="Xem trước"
              disabled={isDeleting}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDownload(template)}
              variant="outline"
              size="sm"
              title="Tải xuống"
              disabled={isDeleting}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDeleteTemplate(template)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              title="Xóa template"
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
  ], [paginationInfo, deleteLoading, handleView, handleDownload, handleDeleteTemplate]);

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