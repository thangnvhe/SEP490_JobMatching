// Đặt file này tại: src/pages/Admin-Side/ManageUserPage.tsx
import * as React from "react";
import {
  SearchIcon,
  Plus, // Icon cho "Create"
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

type UserRole = "candidate" | "recruiter";
type UserStatus = "active" | "deactivated";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateJoined: string;
  phone?: string; // Số điện thoại
  address?: string; // Địa chỉ
  companyName?: string; // Tên công ty (cho recruiter)
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
    phone: "0123456789",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
  },
  {
    id: "U002",
    fullName: "Trần Thị B",
    email: "hr.b@fpt.com",
    role: "recruiter",
    status: "active",
    dateJoined: "2024-02-10",
    phone: "0987654321",
    address: "456 Lê Lợi, Q3, TP.HCM",
    companyName: "FPT Corporation",
  },
  {
    id: "U003",
    fullName: "Lê Văn C",
    email: "levanc@outlook.com",
    role: "candidate",
    status: "deactivated",
    dateJoined: "2023-12-05",
    phone: "0369852147",
    address: "789 Trần Hưng Đạo, Q5, TP.HCM",
  },
  {
    id: "U004",
    fullName: "Phạm Thị D",
    email: "tuyendung.d@viettel.vn",
    role: "recruiter",
    status: "deactivated",
    dateJoined: "2023-11-20",
    phone: "0741852963",
    address: "321 Cách Mạng Tháng 8, Q10, TP.HCM",
    companyName: "Viettel Group",
  },
  {
    id: "U005",
    fullName: "Hoàng Văn E",
    email: "hoangvane@gmail.com",
    role: "candidate",
    status: "active",
    dateJoined: "2024-05-01",
    phone: "0521478963",
    address: "654 Võ Văn Tần, Q3, TP.HCM",
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
      {/* PHẦN ĐIỀU KHIỂN (SEARCH, FILTER VÀ CREATE)   */}
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

        {/* Combobox Filter và Create Button (bên phải) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Lọc theo tài khoản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tài khoản</SelectItem>
              <SelectItem value="candidate">Candidate (Active)</SelectItem>
              <SelectItem value="recruiter">Recruiter (Active)</SelectItem>
              <SelectItem value="deactivated">Tài khoản Deactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Nút Create User */}
          <Button
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = "/admin/manage-user/create")}
          >
            <Plus className="mr-2 size-4" />
            Tạo người dùng
          </Button>
        </div>
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
                    {/* Dùng Buttons cho các Actions */}
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
 * Component hiển thị Buttons cho các hành động (View, Update, Delete)
 */
function UserActions({ userId }: { userId: string }) {
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  // TODO: Bạn sẽ viết logic thật cho các hàm này
  const handleUpdate = () => {
    // Navigate to edit page
    window.location.href = `/admin/manage-user/edit/${userId}`;
  };
  const handleDelete = () => {
    // Nên có một AlertDialog ở đây để xác nhận
    alert(`Xóa người dùng: ${userId}`);
  };

  // Tìm user data để hiển thị trong dialog
  const userData = mockUserData.find((user) => user.id === userId);

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
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về người dùng
            </DialogDescription>
          </DialogHeader>
          {userData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Họ tên
                  </label>
                  <p className="text-sm">{userData.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Số điện thoại
                  </label>
                  <p className="text-sm">{userData.phone || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Vai trò
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        userData.role === "recruiter" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {userData.role === "recruiter" ? (
                        <UserRoundCog className="mr-1.5 size-3.5" />
                      ) : (
                        <User className="mr-1.5 size-3.5" />
                      )}
                      {userData.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <UserStatusBadge status={userData.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày tham gia
                  </label>
                  <p className="text-sm">{userData.dateJoined}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Địa chỉ
                </label>
                <p className="text-sm mt-1">
                  {userData.address || "Chưa cập nhật"}
                </p>
              </div>
              {userData.companyName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Công ty
                  </label>
                  <p className="text-sm mt-1">{userData.companyName}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button onClick={handleUpdate}>
                  <Pencil className="mr-2 size-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nút Edit - luôn hiển thị */}
      <Button variant="ghost" size="sm" onClick={handleUpdate}>
        <Pencil className="size-4" />
      </Button>

      {/* Nút Delete - luôn hiển thị */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
