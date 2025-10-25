// Đặt file này tại: src/pages/Admin-Side/ManageCompanyPage.tsx
import * as React from "react";
import {
  SearchIcon,
  MoreHorizontalIcon,
  Eye,
  Pencil,
  Trash2,
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

// Định nghĩa kiểu trạng thái
type CompanyStatus = "active" | "pending" | "deactivated";

// Định nghĩa kiểu dữ liệu Company
type Company = {
  id: string;
  name: string;
  email: string;
  status: CompanyStatus;
  dateJoined: string;
  jobsPosted: number;
};

// Dữ liệu giả
const mockCompanyData: Company[] = [
  {
    id: "C001",
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    status: "active",
    dateJoined: "2024-01-15",
    jobsPosted: 12,
  },
  {
    id: "C002",
    name: "Innovate Hub",
    email: "info@innovate.com",
    status: "pending",
    dateJoined: "2024-02-10",
    jobsPosted: 0,
  },
  {
    id: "C003",
    name: "Business Dynamics",
    email: "hr@businessinc.com",
    status: "deactivated",
    dateJoined: "2023-12-05",
    jobsPosted: 5,
  },
  {
    id: "C004",
    name: "Eco Builders Ltd.",
    email: "support@eco.com",
    status: "active",
    dateJoined: "2024-03-20",
    jobsPosted: 8,
  },
  {
    id: "C005",
    name: "FutureSoft",
    email: "careers@futuresoft.com",
    status: "pending",
    dateJoined: "2024-05-01",
    jobsPosted: 0,
  },
];

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH CỦA TRANG
// ------------------------------------------------------------------

export function ManageCompanyPage() {
  // State cho thanh search và combobox filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Lọc dữ liệu dựa trên state
  const filteredData = React.useMemo(() => {
    return mockCompanyData
      .filter((company) => {
        // Lọc theo status
        if (statusFilter === "all") return true;
        // "Đã duyệt" bao gồm cả "active" và "deactivated"
        if (statusFilter === "approved") {
          return ["active", "deactivated"].includes(company.status);
        }
        return company.status === statusFilter;
      })
      .filter((company) => {
        // Lọc theo search term (tìm theo tên)
        return company.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [statusFilter, searchTerm]); // Chạy lại khi 2 state này thay đổi

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Companies</h1>

      {/* ------------------------------------------- */}
      {/* PHẦN ĐIỀU KHIỂN (SEARCH VÀ FILTER)          */}
      {/* ------------------------------------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Thanh Search (bên trái) */}
        <div className="w-full md:w-auto md:flex-1 lg:max-w-xs">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm kiếm công ty..."
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
            <SelectItem value="pending">Chưa được duyệt</SelectItem>
            <SelectItem value="approved">Đã duyệt (Tất cả)</SelectItem>
            <SelectItem value="active">Đang active</SelectItem>
            <SelectItem value="deactivated">Đã deactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ------------------------------------------- */}
      {/* PHẦN BẢNG DỮ LIỆU (TABLE)                  */}
      {/* ------------------------------------------- */}
      <div className="rounded-lg border">
        {/* Dùng component Table của bạn */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên công ty</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">
                Jobs đã đăng
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              // Trường hợp không có dữ liệu
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy công ty nào.
                </TableCell>
              </TableRow>
            ) : (
              // Lặp qua dữ liệu đã lọc
              filteredData.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {company.email}
                  </TableCell>
                  <TableCell>
                    {/* Dùng Badge để hiển thị status */}
                    <CompanyStatusBadge status={company.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    {company.jobsPosted}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Dùng DropdownMenu cho các Actions */}
                    <CompanyActions companyId={company.id} />
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
// PHẦN 3: CÁC COMPONENT PHỤ (ĐỂ GIÚP MÃ SẠCH SẼ)
// ------------------------------------------------------------------

/**
 * Component hiển thị Badge dựa trên trạng thái
 */
function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  // Mặc định là 'secondary' (màu xám cho 'pending')
  let variant: "default" | "secondary" | "destructive" = "secondary";
  let text = "Pending";

  if (status === "active") {
    variant = "default"; // 'default' sẽ là màu 'primary' (màu xanh dương)
    text = "Active";
  } else if (status === "deactivated") {
    variant = "destructive"; // Màu đỏ
    text = "Deactivated";
  }

  return <Badge variant={variant}>{text}</Badge>;
}

/**
 * Component hiển thị DropdownMenu cho các hành động (View, Update, Delete)
 */
function CompanyActions({ companyId }: { companyId: string }) {
  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleView = () => {
    alert(`Đang xem công ty: ${companyId}`);
    // Ví dụ: navigate(`/admin/manage-company/view/${companyId}`)
  };
  const handleUpdate = () => {
    alert(`Chỉnh sửa công ty: ${companyId}`);
    // Ví dụ: mở một Dialog/Modal để chỉnh sửa
  };
  const handleDelete = () => {
    // Nên có một AlertDialog ở đây để xác nhận
    alert(`Xóa công ty: ${companyId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* size="icon-sm" từ file button.tsx của bạn */}
        <Button variant="ghost" size="icon-sm">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpdate}>
          <Pencil className="mr-2 size-4" />
          Update Company
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Dùng data-variant="destructive" từ file dropdown-menu.tsx */}
        <DropdownMenuItem data-variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 size-4" />
          Delete Company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
