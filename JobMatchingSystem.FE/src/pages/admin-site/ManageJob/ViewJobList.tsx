// Đặt file này tại: src/pages/Admin-Side/ManageJobPage.tsx
import * as React from "react";
import {
  SearchIcon,
  Plus, // Icon cho "Create"
  Eye,
  Trash2,
  Check, // Icon cho "Approve" (Duyệt)
  X, // Icon cho "Reject" (Từ chối)
  Archive, // Icon cho "Close" (Đóng)
  Clock, // Icon cho "Pending"
  CheckCircle, // Icon cho "Open"
  XCircle, // Icon cho "Rejected"
  ArchiveIcon, // Icon cho "Closed"
  Edit, // Icon cho "Edit"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  description?: string; // Mô tả công việc
  location?: string; // Địa điểm
  salary?: string; // Mức lương
  requirements?: string; // Yêu cầu
};

// Dữ liệu giả
const mockJobData: Job[] = [
  {
    id: "J001",
    title: "Senior React Developer",
    companyName: "TechCorp Solutions",
    status: "open",
    datePosted: "2024-05-10",
    description:
      "We are looking for an experienced React developer to join our team...",
    location: "Ho Chi Minh City",
    salary: "15-25M VND",
    requirements: "3+ years React experience, TypeScript, Redux",
  },
  {
    id: "J002",
    title: "UI/UX Designer",
    companyName: "Innovate Hub",
    status: "pending",
    datePosted: "2024-05-12",
    description:
      "Creative UI/UX designer needed for our innovative projects...",
    location: "Hanoi",
    salary: "12-20M VND",
    requirements: "Figma, Adobe Creative Suite, 2+ years experience",
  },
  {
    id: "J003",
    title: "Marketing Manager",
    companyName: "Business Dynamics",
    status: "closed",
    datePosted: "2024-04-01",
    description: "Lead our marketing team and drive growth strategies...",
    location: "Da Nang",
    salary: "20-30M VND",
    requirements: "5+ years marketing experience, team leadership",
  },
  {
    id: "J004",
    title: "Data Scientist",
    companyName: "TechCorp Solutions",
    status: "rejected",
    datePosted: "2024-05-09",
    description: "Analyze complex data sets and build predictive models...",
    location: "Ho Chi Minh City",
    salary: "18-28M VND",
    requirements: "Python, Machine Learning, Statistics background",
  },
  {
    id: "J005",
    title: "Junior Node.js Developer",
    companyName: "FutureSoft",
    status: "open",
    datePosted: "2024-05-11",
    description: "Entry-level position for Node.js backend development...",
    location: "Remote",
    salary: "8-15M VND",
    requirements: "Node.js basics, JavaScript, REST APIs",
  },
  {
    id: "J006",
    title: "Project Manager",
    companyName: "Eco Builders Ltd.",
    status: "pending",
    datePosted: "2024-05-13",
    description: "Manage construction projects from planning to completion...",
    location: "Can Tho",
    salary: "16-24M VND",
    requirements: "Construction experience, PMP certification preferred",
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
      {/* PHẦN ĐIỀU KHIỂN (SEARCH, FILTER VÀ CREATE)   */}
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

        {/* Combobox Filter và Create Button (bên phải) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[240px]">
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

          {/* Nút Create Job */}
          <Button
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = "/admin/manage-job/create")}
          >
            <Plus className="mr-2 size-4" />
            Tạo tin tuyển dụng
          </Button>
        </div>
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
                    {/* Dùng Buttons cho các Actions */}
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
 * Component hiển thị Buttons cho các hành động
 */
function JobActions({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: JobStatus;
}) {
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleApprove = () => alert(`Duyệt tin: ${jobId}`);
  const handleReject = () => alert(`Từ chối tin: ${jobId}`);
  const handleCloseJob = () => alert(`Đóng tin: ${jobId}`);
  const handleDelete = () => alert(`Xóa vĩnh viễn tin: ${jobId}`);
  const handleEdit = () => {
    // Navigate to edit page
    window.location.href = `/admin/manage-job/edit/${jobId}`;
  };

  // Tìm job data để hiển thị trong dialog
  const jobData = mockJobData.find((job) => job.id === jobId);

  return (
    <div className="flex items-center gap-1">
      {/* Nút View - luôn hiển thị */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tin tuyển dụng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về tin tuyển dụng
            </DialogDescription>
          </DialogHeader>
          {jobData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tên công việc
                  </label>
                  <p className="text-sm">{jobData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Công ty
                  </label>
                  <p className="text-sm">{jobData.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Địa điểm
                  </label>
                  <p className="text-sm">{jobData.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mức lương
                  </label>
                  <p className="text-sm">{jobData.salary}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày đăng
                  </label>
                  <p className="text-sm">{jobData.datePosted}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <JobStatusBadge status={jobData.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả công việc
                </label>
                <p className="text-sm mt-1">{jobData.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Yêu cầu
                </label>
                <p className="text-sm mt-1">{jobData.requirements}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button onClick={handleEdit}>
                  <Edit className="mr-2 size-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nút Edit - luôn hiển thị */}
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <Edit className="size-4" />
      </Button>

      {/* Các nút action theo trạng thái */}
      {currentStatus === "pending" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleApprove}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            className="text-red-600 hover:text-red-700"
          >
            <X className="size-4" />
          </Button>
        </>
      )}

      {currentStatus === "open" && (
        <Button variant="ghost" size="sm" onClick={handleCloseJob}>
          <Archive className="size-4" />
        </Button>
      )}

      {(currentStatus === "closed" || currentStatus === "rejected") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
