import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  FileText,
  RefreshCcw,
  AlertTriangle,
  User as UserIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { CandidateJobServices } from "@/services/candidate-job.service";
import { CandidateJob, CandidateJobStatus } from "@/models/job";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { StageBoardDemo } from "@/components/Stage/StageBoardDemo";

const RecruitmentProcessManagement = () => {
  // URL search params
  const { jobId } = useParams();

  // State management
  const [candidateJobs, setCandidateJobs] = useState<CandidateJob[]>([]);
  const [activeTab, setActiveTab] = useState<"screening" | "process">(
    "screening"
  );

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Sorting
  const [keyword, setKeyword] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const debouncedKeyword = useDebounce(keyword, 700);

  // Pagination state
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
      isDescending: false,
      status: '',
    }
  );
  const pageSizeOptions = [5, 10, 20, 50];


  // Fetch candidate jobs with pagination
  const fetchCandidateJobs = useCallback(async (params: PaginationParamsInput) => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await CandidateJobServices.getCandidateJobsByJobId(
        parseInt(jobId),
        {
          ...params,
          search: debouncedKeyword,
        }
      );

      if (response.isSuccess && response.result) {
        setCandidateJobs(response.result.items || []);
        setPaginationInfo(response.result.pageInfo);
      } else {
        setCandidateJobs([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Lỗi khi tải danh sách ứng viên"
      );
      setCandidateJobs([]);
    } finally {
      setLoading(false);
    }
  },
    [jobId, debouncedKeyword]
  );

  // Load candidate jobs when job selected (for screening tab)
  useEffect(() => {
    if (jobId && activeTab === "screening") {
      fetchCandidateJobs(paginationInput);
    }
  }, [jobId, activeTab, paginationInput, fetchCandidateJobs]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "screening" | "process");
    setPaginationInput((prev) => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    if (activeTab === "screening") {
      fetchCandidateJobs(paginationInput);
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
        return { ...prev, sortBy: undefined, isDescending: undefined };
      }
      const sort = newSorting[0];
      return { ...prev, sortBy: sort.id, isDescending: !!sort.desc };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleApprove = useCallback(async (candidateJob: CandidateJob) => {
    try {
      await CandidateJobServices.approveCandidateJob(candidateJob.id);
      toast.success("Đã duyệt ứng viên thành công");
      fetchCandidateJobs(paginationInput);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi duyệt ứng viên");
    }
  }, [fetchCandidateJobs, paginationInput]);

  const handleReject = useCallback(async (candidateJob: CandidateJob) => {
    try {
      await CandidateJobServices.rejectCandidateJob(candidateJob.id);
      toast.success("Đã từ chối ứng viên");
      fetchCandidateJobs(paginationInput);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi từ chối ứng viên");
    }
  }, [fetchCandidateJobs, paginationInput]);

  // Status helpers
  const getStatusLabel = (status: CandidateJobStatus) => {
    switch (status) {
      case CandidateJobStatus.Pending:
        return "Chờ xử lý";
      case CandidateJobStatus.RejectCv:
        return "Từ chối CV";
      case CandidateJobStatus.Processing:
        return "Đang xử lý";
      case CandidateJobStatus.Fail:
        return "Không đạt";
      case CandidateJobStatus.Pass:
        return "Đạt";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: CandidateJobStatus) => {
    switch (status) {
      case CandidateJobStatus.Pending:
        return "bg-gray-100 text-gray-800";
      case CandidateJobStatus.RejectCv:
        return "bg-red-100 text-red-800";
      case CandidateJobStatus.Processing:
        return "bg-blue-100 text-blue-800";
      case CandidateJobStatus.Fail:
        return "bg-orange-100 text-orange-800";
      case CandidateJobStatus.Pass:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Columns definition
  const columns = useMemo<ColumnDef<CandidateJob>[]>(
    () => [
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
        id: "cvId",
        accessorKey: "cvId",
        header: "CV ID",
        enableSorting: true,
      },
      {
        id: "appliedAt",
        accessorKey: "appliedAt",
        header: "Ngày ứng tuyển",
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.getValue("appliedAt") as string;
          return (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {new Date(date).toLocaleDateString("vi-VN")}
              </span>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Trạng thái",
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.getValue("status") as CandidateJobStatus;
          return (
            <Badge className={getStatusColor(status)}>
              {getStatusLabel(status)}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => {
          const candidateJob = row.original;
          const isPending = candidateJob.status === CandidateJobStatus.Pending;

          return (
            <div className="flex items-center space-x-2">
              {isPending && (
                <>
                  <Button
                    onClick={() => handleApprove(candidateJob)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
                    title="Duyệt CV"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleReject(candidateJob)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                    title="Từ chối CV"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" title="Xem chi tiết">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [paginationInfo, handleApprove, handleReject]
  );

  return (
    <div className="p-6 space-y-6">


      {/* Tabs */}
      {jobId && (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="screening">Danh sách sàng lọc</TabsTrigger>
            <TabsTrigger value="process">Quy trình tuyển dụng</TabsTrigger>
          </TabsList>

          {/* Tab 1: Screening List */}
          <TabsContent value="screening" className="mt-4">

            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Danh sách ứng viên</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="icon"
                      disabled={loading}
                      title="Làm mới dữ liệu"
                    >
                      <RefreshCcw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && !candidateJobs.length ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Đang tải danh sách ứng viên...
                      </p>
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
                ) : candidateJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Chưa có ứng viên nào ứng tuyển vào tin này
                    </p>
                  </div>
                ) : (
                  <>
                    <DataTable
                      columns={columns}
                      data={candidateJobs}
                      loading={loading}
                      sorting={sorting}
                      onSortingChange={handleSortingChange}
                    />

                    {/* Pagination */}
                    {paginationInfo.totalItem > 0 && (
                      <div className="flex items-center justify-between mt-4 gap-6">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị{" "}
                          {(paginationInfo.currentPage - 1) *
                            paginationInfo.pageSize +
                            1}{" "}
                          -{" "}
                          {Math.min(
                            paginationInfo.currentPage *
                            paginationInfo.pageSize,
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
                                disabled={
                                  paginationInfo.currentPage === 1 || loading
                                }
                                className="h-8 w-8 p-0"
                              >
                                <ChevronsLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePageChange(paginationInfo.currentPage - 1)
                                }
                                disabled={
                                  paginationInfo.currentPage === 1 || loading
                                }
                                className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
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
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePageChange(paginationInfo.totalPage)
                                }
                                disabled={
                                  paginationInfo.currentPage >=
                                  paginationInfo.totalPage || loading
                                }
                                className="h-8 w-8 p-0"
                              >
                                <ChevronsRight className="h-4 w-4" />
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
          </TabsContent>

          {/* Tab 2: Recruitment Process */}
          <TabsContent value="process" className="mt-4">
            <StageBoardDemo jobId={parseInt(jobId)} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RecruitmentProcessManagement;
