import { useCallback, useEffect, useMemo, useState } from "react";
import { TaxonomyService } from "@/services/taxonomy.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { Taxonomy, TaxonomyTreeNode } from "@/models/taxonomy";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";
import { CreateTaxonomyDialog } from "./CreateTaxonomyDialog";
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
import { cn } from "@/lib/utils";

export default function ViewTaxonomyList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
  const [parentForCreate, setParentForCreate] = useState<Taxonomy | null>(null);

  // Tree state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [childrenMap, setChildrenMap] = useState<Map<number, Taxonomy[]>>(new Map());

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
    isDescending: false,
    hasParent: false,
  });
  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(
    async (params: PaginationParamsInput) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TaxonomyService.getAllWithPagination(params);
        setTaxonomies(response.result.items);
        setPaginationInfo(response.result.pageInfo);
        // Reset tree state when fetching new data
        setExpandedIds(new Set());
        setChildrenMap(new Map());
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu kỹ năng");
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

  const handlePageChange = (page: number) => {
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleEdit = (taxonomy: Taxonomy) => {
    setSelectedTaxonomy(taxonomy);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (taxonomy: Taxonomy) => {
    setSelectedTaxonomy(taxonomy);
    setIsDeleteDialogOpen(true);
  };

  const handleAddChild = (taxonomy: Taxonomy) => {
    setParentForCreate(taxonomy);
    setIsCreateDialogOpen(true);
  };

  const handleAddRoot = () => {
    setParentForCreate(null);
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    if (parentForCreate) {
      // Clear cached children for the parent to force reload
      setChildrenMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(parentForCreate.id);
        return newMap;
      });
      // Re-expand the parent to reload children
      if (expandedIds.has(parentForCreate.id)) {
        setExpandedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(parentForCreate.id);
          return newSet;
        });
        // Re-expand after a short delay to trigger reload
        setTimeout(() => {
          handleToggleExpand(parentForCreate);
        }, 100);
      }
    }
    handleRefresh();
  };

  const confirmDelete = async () => {
    if (!selectedTaxonomy) return;

    try {
      setDeleteLoading(true);
      await TaxonomyService.delete(selectedTaxonomy.id.toString());
      toast.success("Xóa kỹ năng thành công");
      setIsDeleteDialogOpen(false);
      setSelectedTaxonomy(null);
      getAllWithPagination(paginationInput);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa kỹ năng");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle expand/collapse for a node
  const handleToggleExpand = async (taxonomy: Taxonomy) => {
    const id = taxonomy.id;
    const hasChildren = taxonomy.childrenIds && taxonomy.childrenIds.length > 0;

    if (!hasChildren) return;

    if (expandedIds.has(id)) {
      // Collapse
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      // Expand - fetch children if not already loaded
      if (!childrenMap.has(id)) {
        try {
          setLoadingIds((prev) => new Set(prev).add(id));
          const response = await TaxonomyService.getTaxonomyByParentId(id.toString());
          setChildrenMap((prev) => new Map(prev).set(id, response.result));
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu con");
          return;
        } finally {
          setLoadingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      }

      setExpandedIds((prev) => new Set(prev).add(id));
    }
  };

  // Build flat list with tree structure for rendering
  const treeData = useMemo(() => {
    const result: TaxonomyTreeNode[] = [];
    const baseIndex = (paginationInfo.currentPage - 1) * paginationInfo.pageSize;

    const addNode = (taxonomy: Taxonomy, level: number, parentHierarchy: string, childIndex: number) => {
      const hasChildren = taxonomy.childrenIds && taxonomy.childrenIds.length > 0;
      const isExpanded = expandedIds.has(taxonomy.id);
      const isLoading = loadingIds.has(taxonomy.id);
      
      // Calculate hierarchy index
      const hierarchyIndex = parentHierarchy 
        ? `${parentHierarchy}.${childIndex}` 
        : `${baseIndex + childIndex}`;

      result.push({
        ...taxonomy,
        level,
        isExpanded,
        isLoading,
        hasChildren,
        hierarchyIndex,
      });

      if (isExpanded && childrenMap.has(taxonomy.id)) {
        const children = childrenMap.get(taxonomy.id) || [];
        children.forEach((child, idx) => addNode(child, level + 1, hierarchyIndex, idx + 1));
      }
    };

    taxonomies.forEach((taxonomy, idx) => addNode(taxonomy, 0, "", idx + 1));

    return result;
  }, [taxonomies, expandedIds, childrenMap, loadingIds, paginationInfo.currentPage, paginationInfo.pageSize]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý kỹ năng</h1>
        <p className="text-muted-foreground">
          Theo dõi, tìm kiếm và cập nhật danh sách kỹ năng trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm kỹ năng gốc..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleAddRoot}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm kỹ năng gốc
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
          {loading && !taxonomies.length ? (
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
            <div className="rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">STT</TableHead>
                    <TableHead>Tên kỹ năng</TableHead>
                    <TableHead className="w-40">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : treeData.length > 0 ? (
                    treeData.map((node) => {
                      const hasChildren = node.childrenIds && node.childrenIds.length > 0;

                      return (
                        <TableRow
                          key={`${node.id}-${node.level}`}
                          className={cn(
                            node.level > 0 && "bg-muted/30",
                            node.level > 1 && "bg-muted/50"
                          )}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {node.hierarchyIndex}
                          </TableCell>
                          <TableCell>
                            <div
                              className="flex items-center gap-2"
                              style={{ paddingLeft: `${node.level * 24}px` }}
                            >
                              {hasChildren ? (
                                <button
                                  onClick={() => handleToggleExpand(node)}
                                  className="p-1 hover:bg-muted rounded-sm transition-colors"
                                  disabled={node.isLoading}
                                >
                                  {node.isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  ) : node.isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRightIcon className="h-4 w-4" />
                                  )}
                                </button>
                              ) : (
                                <span className="w-6" />
                              )}
                              <span className="font-medium">{node.name || "Chưa cập nhật"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleAddChild(node)}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
                                title="Thêm kỹ năng con"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleEdit(node)}
                                variant="outline"
                                size="sm"
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(node)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                                title="Xóa kỹ năng"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Không có dữ liệu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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

      {/* Edit Taxonomy Dialog */}
      <EditTaxonomyDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        taxonomy={selectedTaxonomy}
        onUpdateSuccess={handleRefresh}
      />

      {/* Create Taxonomy Dialog */}
      <CreateTaxonomyDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateSuccess={handleCreateSuccess}
        parentTaxonomy={parentForCreate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa kỹ năng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa kỹ năng "{selectedTaxonomy?.name}".
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
