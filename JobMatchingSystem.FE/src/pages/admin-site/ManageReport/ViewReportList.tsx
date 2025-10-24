// Đặt file này tại: src/pages/Admin-Side/ManageReportPage.tsx
import * as React from "react";
import {
  SearchIcon,
  MoreHorizontalIcon,
  Eye, // Xem chi tiết
  CheckCheck, // Đã xử lý
  ShieldBan, // Từ chối (báo cáo sai)
  Clock, // Chờ xử lý
  ShieldCheck, // Đã xử lý (icon)
} from "lucide-react";

// Import các UI components của bạn
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ------------------------------------------------------------------
// PHẦN 1: DỮ LIỆU GIẢ VÀ TYPES (Bạn sẽ thay thế bằng API)
// ------------------------------------------------------------------

// Trạng thái của báo cáo (report), không phải của tin tuyển dụng
type ReportStatus = "pending" | "processed" | "rejected";

type JobReport = {
  id: string; // ID của report (hoặc job ID)
  jobTitle: string; // Tên tin tuyển dụng
  companyName: string; // Tên công ty đăng
  reportCount: number; // Số lượng báo cáo
  status: ReportStatus;
  lastReportedDate: string;
};

// Dữ liệu giả
const mockReportData: JobReport[] = [
  {
    id: "R001",
    jobTitle: "Senior React Developer",
    companyName: "TechCorp Solutions",
    reportCount: 15,
    status: "pending",
    lastReportedDate: "2024-05-13",
  },
  {
    id: "R002",
    jobTitle: "UI/UX Designer",
    companyName: "Innovate Hub",
    reportCount: 2,
    status: "rejected", // Admin xem và thấy báo cáo này là sai
    lastReportedDate: "2024-05-12",
  },
  {
    id: "R003",
    jobTitle: "Data Scientist",
    companyName: "TechCorp Solutions",
    reportCount: 8,
    status: "processed", // Admin đã xử lý (ví dụ: gỡ tin)
    lastReportedDate: "2024-05-09",
  },
  {
    id: "R004",
    jobTitle: "Marketing Manager",
    companyName: "Business Dynamics",
    reportCount: 5,
    status: "pending",
    lastReportedDate: "2024-05-11",
  },
];

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH CỦA TRANG
// ------------------------------------------------------------------

export function ManageReportPage() {
  // State cho thanh search và combobox filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Lọc dữ liệu dựa trên state
  const filteredData = React.useMemo(() => {
    return mockReportData
      .filter((report) => {
        // Lọc theo status
        if (statusFilter === "all") return true;
        // Yêu cầu của bạn là "reject" và "xử lý"
        // 'processed' (đã xử lý)
        // 'rejected' (báo cáo bị từ chối/reject)
        return report.status === statusFilter;
      })
      .filter((report) => {
        // Lọc theo search term (tìm theo tên tuyển dụng)
        return report.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [statusFilter, searchTerm]); // Chạy lại khi 2 state này thay đổi

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Reports</h1>

      {/* ------------------------------------------- */}
      {/* PHẦN ĐIỀU KHIỂN (SEARCH VÀ FILTER)          */}
      {/* ------------------------------------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Thanh Search (bên trái) - Theo Tên tuyển dụng */}
        <div className="w-full md:w-auto md:flex-1 lg:max-w-xs">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm theo tên tin tuyển dụng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Combobox Filter (bên phải) */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="processed">Đã xử lý (Processed)</SelectItem>
            <SelectItem value="rejected">Đã từ chối (Rejected)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ------------------------------------------- */}
      {/* PHẦN BẢNG DỮ LIỆU (TABLE)                  */}
      {/* ------------------------------------------- */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tin tuyển dụng</TableHead>
              <TableHead className="hidden md:table-cell">Công ty</TableHead>
              <TableHead className="text-center">Số lượng báo cáo</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              // Trường hợp không có dữ liệu
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy báo cáo nào.
                </TableCell>
              </TableRow>
            ) : (
              // Lặp qua dữ liệu đã lọc
              filteredData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.jobTitle}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {report.companyName}
                  </TableCell>
                  <TableCell className="text-center font-medium text-red-600">
                    {report.reportCount}
                  </TableCell>
                  <TableCell>
                    {/* Dùng Badge để hiển thị status */}
                    <ReportStatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Dùng DropdownMenu cho các Actions */}
                    <ReportActions
                      reportId={report.id}
                      currentStatus={report.status}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// PHẦN 3: CÁC COMPONENT PHỤ
// ------------------------------------------------------------------

/**
 * Component hiển thị Badge dựa trên trạng thái báo cáo
 */
function ReportStatusBadge({ status }: { status: ReportStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 text-white hover:bg-yellow-500"
        >
          <Clock className="mr-1.5 size-3.5" />
          Chờ xử lý
        </Badge>
      );
    case "processed":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
          <ShieldCheck className="mr-1.5 size-3.5" />
          Đã xử lý
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="secondary">
          <ShieldBan className="mr-1.5 size-3.5" />
          Đã từ chối
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/**
 * Component hiển thị DropdownMenu cho các hành động (Xem, Xử lý, Từ chối)
 */
function ReportActions({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: ReportStatus;
}) {
  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleView = () => {
    alert(`Xem chi tiết báo cáo: ${reportId}`);
    // Ví dụ: Mở 1 Dialog hiển thị danh sách các lý do báo cáo
  };

  const handleProcess = () => {
    // "Xử lý" ở đây có nghĩa là admin xác nhận báo cáo là ĐÚNG
    // và sẽ có hành động (ví dụ: gỡ tin tuyển dụng)
    alert(`Xử lý báo cáo: ${reportId} (Tin tuyển dụng này sẽ bị gỡ)`);
  };

  const handleReject = () => {
    // "Từ chối" ở đây có nghĩa là admin xác nhận báo cáo là SAI
    // và bỏ qua báo cáo này
    alert(`Từ chối báo cáo: ${reportId} (Báo cáo này là sai, bỏ qua)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Luôn cho phép "Xem chi tiết" */}
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 size-4" />
          Xem chi tiết
        </DropdownMenuItem>

        {/* Chỉ hiển thị "Xử lý" và "Từ chối" khi báo cáo đang "pending" */}
        {currentStatus === "pending" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleProcess}
              className="text-green-600 focus:text-green-600"
            >
              <CheckCheck className="mr-2 size-4" />
              Xử lý (Confirm Report)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject} data-variant="destructive">
              <ShieldBan className="mr-2 size-4" />
              Từ chối (Reject Report)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
