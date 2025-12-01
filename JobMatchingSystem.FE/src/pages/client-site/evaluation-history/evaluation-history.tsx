import { useCallback, useEffect, useMemo, useState } from "react";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { CandidateStage } from "@/models/candidate-stage";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";

export default function EvaluationHistory() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateStages, setCandidateStages] = useState<CandidateStage[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Mặc định lấy tất cả

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
    isHistory: true, // Quan trọng: Chỉ lấy lịch sử
    status: undefined
  });

  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CandidateStageServices.getAllCandidateStagesWithPaginationForHiringManager(params);
      setCandidateStages(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải lịch sử đánh giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chuẩn bị params, xử lý status filter
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
      status: statusFilter === 'all' ? undefined : statusFilter
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput, statusFilter]);

  // Handler functions
  const handleRefresh = () => {
    // Reset về trang 1 và reload
    setPaginationInput(prev => ({ ...prev, page: 1 }));
    const params = {
      ...paginationInput,
      page: 1,
      search: keyword, // Dùng giá trị hiện tại chưa debounce để refresh ngay
      status: statusFilter === 'all' ? undefined : statusFilter
    };
    getAllWithPagination(params);
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    setPaginationInput(prev => {
      if (!newSorting.length) {
        return { ...prev, sortBy: undefined, isDecending: undefined };
      }
      const sort = newSorting[0];
      return { ...prev, sortBy: sort.id, isDecending: !!sort.desc };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput(prev => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPaginationInput(prev => ({ ...prev, page: 1 })); // Reset về trang 1 khi filter
  };

  // Helper functions
  const columns = useMemo<ColumnDef<CandidateStage>[]>(() => [
    {
      id: "id",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index
        return (paginationInfo.currentPage - 1) * paginationInfo.pageSize + index + 1
      },
      enableSorting: false,
    },
    {
      id: "candidateName",
      accessorKey: "user.fullName", // Truy cập nested object
      header: "Ứng viên",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.user?.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.original.user?.email}</div>
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "jobStageTitle",
      accessorKey: "jobStageTitle",
      header: "Vòng phỏng vấn",
      enableSorting: true,
    },
    {
      id: "interviewDate",
      accessorKey: "interviewDate",
      header: "Ngày phỏng vấn",
      cell: ({ row }) => {
        const date = row.getValue("interviewDate") as string | null
        if (!date) return '-'
        return new Date(date).toLocaleDateString('vi-VN')
      },
      enableSorting: true,
    },
    {
      id: "hiringManagerFeedback",
      accessorKey: "hiringManagerFeedback",
      header: "Nhận xét",
      cell: ({ row }) => {
        const feedback = row.getValue("hiringManagerFeedback") as string;
        return <div className="max-w-[300px] truncate" title={feedback}>{feedback || 'Không có nhận xét'}</div>
      },
      enableSorting: false,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Kết quả",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        let badgeClass = 'bg-gray-100 text-gray-800';

        if (status === 'Passed') badgeClass = 'bg-green-100 text-green-800 hover:bg-green-100';
        else if (status === 'Failed') badgeClass = 'bg-red-100 text-red-800 hover:bg-red-100';
        else if (status === 'Schedule') badgeClass = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';

        return (
          <Badge className={`${badgeClass} border-0`}>
            {status}
          </Badge>
        )
      },
      enableSorting: true,
    },
  ], [paginationInfo])

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Lịch sử đánh giá</h1>
        <p className="text-muted-foreground">Xem lại kết quả các buổi phỏng vấn đã thực hiện</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm ứng viên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-64"
              />

              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
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
          {loading && !candidateStages.length ? (
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
              data={candidateStages}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}

          {!error && paginationInfo && (
            <div className="flex items-center justify-between mt-4 gap-6 flex-wrap">
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
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
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