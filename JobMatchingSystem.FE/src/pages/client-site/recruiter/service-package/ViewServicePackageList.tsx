import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ExtensionJob } from "@/models/extension-job";
import { HighlightJob } from "@/models/highlight-job";
import { ExtensionJobServices } from "@/services/extension-job.service";
import { HighlightJobServices } from "@/services/highlight-job.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ViewServicePackageList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extensionJobs, setExtensionJobs] = useState<ExtensionJob[]>([]);
  const [highlightJobs, setHighlightJobs] = useState<HighlightJob[]>([]);
  const [extensionSorting, setExtensionSorting] = useState<SortingState>([]);
  const [highlightSorting, setHighlightSorting] = useState<SortingState>([]);
  const [activeTab, setActiveTab] = useState("extension");

  const getAllExtensionJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ExtensionJobServices.getMyExtensionJobs();
      
      // Xử lý case API trả về 404 hoặc result không phải array
      if (!response.isSuccess || !Array.isArray(response.result)) {
        setExtensionJobs([]);
        return;
      }
      
      setExtensionJobs(response.result);
    } catch (err: any) {
      // Xử lý case 404 - không có dữ liệu
      if (err.response?.status === 404) {
        setExtensionJobs([]);
        setError(null);
        return;
      }
      
      setError(
        err.response?.data?.message || "Lỗi khi tải dữ liệu gia hạn tin tuyển dụng"
      );
      setExtensionJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllHighlightJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await HighlightJobServices.getMyHighlightJobs();
      
      // Xử lý case API trả về 404 hoặc result không phải array
      if (!response.isSuccess || !Array.isArray(response.result)) {
        setHighlightJobs([]);
        return;
      }
      
      setHighlightJobs(response.result);
    } catch (err: any) {
      // Xử lý case 404 - không có dữ liệu
      if (err.response?.status === 404) {
        setHighlightJobs([]);
        setError(null);
        return;
      }
      
      setError(
        err.response?.data?.message || "Lỗi khi tải dữ liệu nổi bật tin tuyển dụng"
      );
      setHighlightJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "extension") {
      getAllExtensionJobs();
    } else {
      getAllHighlightJobs();
    }
  }, [activeTab, getAllExtensionJobs, getAllHighlightJobs]);

  const handleRefresh = useCallback(() => {
    if (activeTab === "extension") {
      getAllExtensionJobs();
    } else {
      getAllHighlightJobs();
    }
  }, [activeTab, getAllExtensionJobs, getAllHighlightJobs]);

  const extensionColumns = useMemo<ColumnDef<ExtensionJob>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "STT",
        cell: ({ row }) => {
          const index = row.index;
          return index + 1;
        },
        enableSorting: false,
      },
      {
        id: "recuiterId",
        accessorKey: "recuiterId",
        header: "Mã nhà tuyển dụng",
        enableSorting: true,
      },
      {
        id: "extensionJobDays",
        accessorKey: "extensionJobDays",
        header: "Số ngày gia hạn",
        cell: ({ row }) => {
          const days = row.getValue("extensionJobDays") as number;
          return (
            <Badge variant="outline" className="font-medium">
              {days} ngày
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: "extensionJobDaysCount",
        accessorKey: "extensionJobDaysCount",
        header: "Số lần gia hạn còn lại",
        cell: ({ row }) => {
          const count = row.getValue("extensionJobDaysCount") as number;
          return (
            <Badge
              className={
                count > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {count} lần
            </Badge>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  const highlightColumns = useMemo<ColumnDef<HighlightJob>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "STT",
        cell: ({ row }) => {
          const index = row.index;
          return index + 1;
        },
        enableSorting: false,
      },
      {
        id: "recuiterId",
        accessorKey: "recuiterId",
        header: "Mã nhà tuyển dụng",
        enableSorting: true,
      },
      {
        id: "highlightJobDays",
        accessorKey: "highlightJobDays",
        header: "Số ngày nổi bật",
        cell: ({ row }) => {
          const days = row.getValue("highlightJobDays") as number;
          return (
            <Badge variant="outline" className="font-medium">
              {days} ngày
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: "highlightJobDaysCount",
        accessorKey: "highlightJobDaysCount",
        header: "Số lần nổi bật còn lại",
        cell: ({ row }) => {
          const count = row.getValue("highlightJobDaysCount") as number;
          return (
            <Badge
              className={
                count > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {count} lần
            </Badge>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  const renderContent = useCallback((
    isLoading: boolean,
    hasError: string | null,
    data: any[],
    columns: ColumnDef<any>[],
    sorting: SortingState,
    onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>,
    emptyMessage: string
  ) => {
    if (isLoading && data.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-500">{hasError}</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        sorting={sorting}
        onSortingChange={onSortingChange}
      />
    );
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý gói dịch vụ
        </h1>
        <p className="text-muted-foreground">
          Theo dõi và quản lý các gói gia hạn và nổi bật tin tuyển dụng của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="extension">Gói gia hạn</TabsTrigger>
                  <TabsTrigger value="highlight">Gói nổi bật</TabsTrigger>
                </TabsList>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="icon"
                  aria-label="Làm mới"
                  title="Làm mới dữ liệu"
                  disabled={loading}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="extension" className="mt-0">
              {renderContent(
                loading,
                error,
                extensionJobs,
                extensionColumns,
                extensionSorting,
                setExtensionSorting,
                "Bạn chưa có gói gia hạn nào"
              )}
            </TabsContent>

            <TabsContent value="highlight" className="mt-0">
              {renderContent(
                loading,
                error,
                highlightJobs,
                highlightColumns,
                highlightSorting,
                setHighlightSorting,
                "Bạn chưa có gói nổi bật nào"
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
