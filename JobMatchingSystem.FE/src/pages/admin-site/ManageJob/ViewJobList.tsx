// Đặt file này tại: src/pages/Admin-Side/ManageJobPage.tsx
import * as React from "react";
import {
  SearchIcon,
  MoreHorizontalIcon,
  Eye,
  Pencil,
  Trash2,
  Check, // Icon cho "Approve" (Duyệt)
  X, // Icon cho "Reject" (Từ chối)
  Archive, // Icon cho "Close" (Đóng)
  Clock, // Icon cho "Pending"
  CheckCircle, // Icon cho "Open"
  XCircle, // Icon cho "Rejected"
  ArchiveIcon, // Icon cho "Closed"
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

type JobStatus = "pending" | "open" | "closed" | "rejected";

type Job = {
  id: string;
  title: string; // Tên tuyển dụng
  companyName: string; // Tên công ty đăng
  status: JobStatus;
  datePosted: string;
};

// Dữ liệu giả
const mockJobData: Job[] = [
  {
    id: "J001",
    title: "Senior React Developer",
    companyName: "TechCorp Solutions",
    status: "open",
    datePosted: "2024-05-10",
  },
  {
    id: "J002",
    title: "UI/UX Designer",
    companyName: "Innovate Hub",
    status: "pending",
    datePosted: "2024-05-12",
  },
  {
    id: "J003",
    title: "Marketing Manager",
    companyName: "Business Dynamics",
    status: "closed",
    datePosted: "2024-04-01",
  },
  {
    id: "J004",
    title: "Data Scientist",
    companyName: "TechCorp Solutions",
    status: "rejected",
    datePosted: "2024-05-09",
  },
  {
    id: "J005",
    title: "Junior Node.js Developer",
    companyName: "FutureSoft",
    status: "open",
    datePosted: "2024-05-11",
  },
  {
    id: "J006",
    title: "Project Manager",
    companyName: "Eco Builders Ltd.",
    status: "pending",
    datePosted: "2024-05-13",
  },
];

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH CỦA TRANG
// ------------------------------------------------------------------

export function ManageJobPage() {
  // State cho thanh search và combobox filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Lọc dữ liệu dựa trên state
  const filteredData = React.useMemo(() => {
    return mockJobData
      .filter((job) => {
        // Lọc theo status
        if (statusFilter === "all") return true;
        return job.status === statusFilter;
      })
      .filter((job) => {
        // Lọc theo search term (tìm theo tên tuyển dụng)
        return job.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [statusFilter, searchTerm]); // Chạy lại khi 2 state này thay đổi

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>

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
              placeholder="Tìm theo tên tuyển dụng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Combobox Filter (bên phải) */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Lọc theo trạng thái tin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Tin chờ duyệt</SelectItem>
            <SelectItem value="open">Tin đang mở</SelectItem>
            <SelectItem value="closed">Tin đã đóng</SelectItem>
            <SelectItem value="rejected">Tin bị reject</SelectItem>
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
              <TableHead>Tên tuyển dụng</TableHead>
              <TableHead className="hidden md:table-cell">Công ty</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày đăng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              // Trường hợp không có dữ liệu
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy tin tuyển dụng nào.
                </TableCell>
              </TableRow>
            ) : (
              // Lặp qua dữ liệu đã lọc
              filteredData.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {job.companyName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {job.datePosted}
                  </TableCell>
                  <TableCell>
                    {/* Dùng Badge để hiển thị status */}
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Dùng DropdownMenu cho các Actions */}
                    <JobActions jobId={job.id} currentStatus={job.status} />
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
 * Component hiển thị Badge dựa trên trạng thái
 */
function JobStatusBadge({ status }: { status: JobStatus }) {
  switch (status) {
    case "open":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
          <CheckCircle className="mr-1.5 size-3.5" />
          Đang mở
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500 text-white hover:bg-yellow-500"
        >
          <Clock className="mr-1.5 size-3.5" />
          Chờ duyệt
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="secondary">
          <ArchiveIcon className="mr-1.5 size-3.5" />
          Đã đóng
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1.5 size-3.5" />
          Bị reject
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/**
 * Component hiển thị DropdownMenu cho các hành động
 */
function JobActions({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: JobStatus;
}) {
  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleView = () => alert(`Xem chi tiết tin: ${jobId}`);
  const handleApprove = () => alert(`Duyệt tin: ${jobId}`);
  const handleReject = () => alert(`Từ chối tin: ${jobId}`);
  const handleCloseJob = () => alert(`Đóng tin: ${jobId}`);
  const handleDelete = () => alert(`Xóa vĩnh viễn tin: ${jobId}`);

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

        {/* Hiển thị "Duyệt" và "Từ chối" CHỈ KHI tin đang "pending" */}
        {currentStatus === "pending" && (
          <>
            <DropdownMenuItem
              onClick={handleApprove}
              className="text-green-600 focus:text-green-600"
            >
              <Check className="mr-2 size-4" />
              Duyệt tin (Approve)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReject}
              className="text-red-600 focus:text-red-600"
            >
              <X className="mr-2 size-4" />
              Từ chối (Reject)
            </DropdownMenuItem>
          </>
        )}

        {/* Hiển thị "Đóng tin" CHỈ KHI tin đang "open" */}
        {currentStatus === "open" && (
          <DropdownMenuItem onClick={handleCloseJob}>
            <Archive className="mr-2 size-4" />
            Đóng tin (Close)
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 size-4" />
          Xem chi tiết
        </DropdownMenuItem>

        {/* Chỉ hiển thị "Xóa" cho các tin đã đóng hoặc bị từ chối */}
        {(currentStatus === "closed" || currentStatus === "rejected") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" />
              Xóa vĩnh viễn
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
