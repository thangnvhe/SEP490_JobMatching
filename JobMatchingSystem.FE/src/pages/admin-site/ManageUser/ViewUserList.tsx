// Đặt file này tại: src/pages/Admin-Side/ManageUserPage.tsx
import * as React from "react";
import {
  SearchIcon,
  MoreHorizontalIcon,
  Eye,
  Pencil,
  Trash2,
  User, // Icon cho Candidate
  UserRoundCog, // Icon cho Recruiter
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

type UserRole = "candidate" | "recruiter";
type UserStatus = "active" | "deactivated";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateJoined: string;
};

// Dữ liệu giả
const mockUserData: User[] = [
  {
    id: "U001",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "candidate",
    status: "active",
    dateJoined: "2024-01-15",
  },
  {
    id: "U002",
    fullName: "Trần Thị B",
    email: "hr.b@fpt.com",
    role: "recruiter",
    status: "active",
    dateJoined: "2024-02-10",
  },
  {
    id: "U003",
    fullName: "Lê Văn C",
    email: "levanc@outlook.com",
    role: "candidate",
    status: "deactivated",
    dateJoined: "2023-12-05",
  },
  {
    id: "U004",
    fullName: "Phạm Thị D",
    email: "tuyendung.d@viettel.vn",
    role: "recruiter",
    status: "deactivated",
    dateJoined: "2023-11-20",
  },
  {
    id: "U005",
    fullName: "Hoàng Văn E",
    email: "hoangvane@gmail.com",
    role: "candidate",
    status: "active",
    dateJoined: "2024-05-01",
  },
];

// ------------------------------------------------------------------
// PHẦN 2: COMPONENT CHÍNH CỦA TRANG
// ------------------------------------------------------------------

export function ManageUserPage() {
  // State cho thanh search và combobox filter
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterValue, setFilterValue] = React.useState("all");

  // Lọc dữ liệu dựa trên state
  const filteredData = React.useMemo(() => {
    return mockUserData
      .filter((user) => {
        // Lọc theo combobox
        if (filterValue === "all") return true;
        if (filterValue === "deactivated") {
          return user.status === "deactivated";
        }
        // Các trường hợp còn lại ("candidate", "recruiter")
        // sẽ tự động lọc ra những tài khoản "active"
        return user.role === filterValue && user.status === "active";
      })
      .filter((user) => {
        // Lọc theo search term (tìm theo email)
        return user.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [filterValue, searchTerm]); // Chạy lại khi 2 state này thay đổi

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>

      {/* ------------------------------------------- */}
      {/* PHẦN ĐIỀU KHIỂN (SEARCH VÀ FILTER)          */}
      {/* ------------------------------------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        {/* Thanh Search (bên trái) - Theo Email */}
        <div className="w-full md:w-auto md:flex-1 lg:max-w-xs">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm kiếm theo email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Combobox Filter (bên phải) */}
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Lọc theo tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tài khoản</SelectItem>
            <SelectItem value="candidate">Candidate (Active)</SelectItem>
            <SelectItem value="recruiter">Recruiter (Active)</SelectItem>
            <SelectItem value="deactivated">Tài khoản Deactive</SelectItem>
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
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              // Trường hợp không có dữ liệu
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              // Lặp qua dữ liệu đã lọc
              filteredData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {/* Dùng Badge cho Vai trò */}
                    <Badge
                      variant={
                        user.role === "recruiter" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {user.role === "recruiter" ? (
                        <UserRoundCog className="mr-1.5 size-3.5" />
                      ) : (
                        <User className="mr-1.5 size-3.5" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Dùng Badge cho Trạng thái */}
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Dùng DropdownMenu cho các Actions */}
                    <UserActions userId={user.id} />
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
 * Component hiển thị Badge dựa trên trạng thái (Active / Deactivated)
 */
function UserStatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-600">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="capitalize">
      Deactivated
    </Badge>
  );
}

/**
 * Component hiển thị DropdownMenu cho các hành động (View, Update, Delete)
 */
function UserActions({ userId }: { userId: string }) {
  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleView = () => {
    alert(`Đang xem người dùng: ${userId}`);
    // Ví dụ: navigate(`/admin/manage-user/view/${userId}`)
  };
  const handleUpdate = () => {
    alert(`Chỉnh sửa người dùng: ${userId}`);
    // Ví dụ: mở một Dialog/Modal để chỉnh sửa vai trò, trạng thái
  };
  const handleDelete = () => {
    // Nên có một AlertDialog ở đây để xác nhận
    alert(`Xóa người dùng: ${userId}`);
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
          Update User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Dùng data-variant="destructive" từ file dropdown-menu.tsx */}
        <DropdownMenuItem data-variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 size-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
