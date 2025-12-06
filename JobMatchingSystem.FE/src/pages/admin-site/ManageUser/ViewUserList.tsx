import { useCallback, useEffect, useMemo, useState } from "react";
import { UserServices } from "@/services/user.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";
import { ViewUserDetailDialog } from "@/pages/admin-site/ManageUser/ViewUserDetailDialog";
import { EditUserDialog } from "@/pages/admin-site/ManageUser/EditUserDialog";
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

export default function ViewUserList() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      isDecending: false,
    }
  );
  const pageSizeOptions = [5, 10, 20, 50];
  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(
    async (params: PaginationParamsInput) => {
      try {
        setLoading(true);
        setError(null);
        const response = await UserServices.getAllWithPagination(params);
        setUsers(response.result.items);
        setPaginationInfo(response.result.pageInfo);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Lỗi khi tải dữ liệu người dùng"
        );
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
        return {
          ...prev,
          sortBy: undefined,
          isDecending: undefined,
        };
      }

      const sort = newSorting[0];
      return {
        ...prev,
        sortBy: sort.id,
        isDecending: !!sort.desc,
      };
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput((prev) => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };


  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);
      // Gửi FormData giống như EditUserDialog
      const payload = new FormData();
      payload.append("fullName", selectedUser.fullName?.trim() || "");
      payload.append("email", selectedUser.email?.trim() || "");
      payload.append("phoneNumber", selectedUser.phoneNumber?.trim() || "");
      payload.append("address", selectedUser.address?.trim() || "");

      if (selectedUser.gender !== null && selectedUser.gender !== undefined) {
        payload.append("gender", selectedUser.gender ? "true" : "false");
      }

      if (selectedUser.birthday) {
        const birthdayDate =
          selectedUser.birthday !== "0001-01-01T00:00:00"
            ? selectedUser.birthday.split("T")[0]
            : "";
        if (birthdayDate) {
          payload.append("birthday", birthdayDate);
        }
      }

      if (selectedUser.score !== null && selectedUser.score !== undefined) {
        payload.append("score", selectedUser.score.toString());
      }

      payload.append("isActive", "false");

      await UserServices.update(selectedUser.id.toString(), payload);
      toast.success("Vô hiệu hóa người dùng thành công");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      // Refresh danh sách sau khi vô hiệu hóa thành công
      getAllWithPagination(paginationInput);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Lỗi khi vô hiệu hóa người dùng"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "Chưa cập nhật";
    const roleMap: Record<string, string> = {
      Admin: "Quản trị viên",
      Recruiter: "Nhà tuyển dụng",
      Candidate: "Ứng viên",
      HiringManager: "Quản lý tuyển dụng",
    };
    return roleMap[role] || role;
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
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
        id: "fullName",
        accessorKey: "fullName",
        header: "Họ tên",
        enableSorting: true,
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
      },
      {
        id: "isActive",
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <Badge
              className={
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {isActive ? "Hoạt động" : "Vô hiệu hóa"}
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: "role",
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => {
          const role = row.getValue("role") as string | undefined;
          return <Badge variant="outline">{getRoleLabel(role)}</Badge>;
        },
        enableSorting: true,
      },
      {
        id: "score",
        accessorKey: "score",
        header: "Điểm đánh giá",
        cell: ({ row }) => {
          const score = row.getValue("score") as number | null;
          if (score === null || score === undefined) return "Chưa có";
          return score;
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleView(user)}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleEdit(user)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(user)}
                variant="outline"
                size="sm"
                className="text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600"
                title="Vô hiệu hóa người dùng"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [paginationInfo]
  );

  // Viết html xử lý kết hợp các hàm logic trên
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý người dùng
        </h1>
        <p className="text-muted-foreground">
          Theo dõi, tìm kiếm và cập nhật danh sách người dùng trong hệ thống
        </p>
      </div>
      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-80"
              />
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
                <RefreshCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && !users.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
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
              data={users}
              loading={loading}
              sorting={sorting}
              onSortingChange={handleSortingChange}
            />
          )}
          {!error && paginationInfo && (
            <div className="flex items-center justify-between mt-4 gap-6">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1}{" "}
                -{" "}
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
                    Trang {paginationInfo.currentPage} trên{" "}
                    {paginationInfo.totalPage}
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
                      onClick={() =>
                        handlePageChange(paginationInfo.currentPage - 1)
                      }
                      disabled={paginationInfo.currentPage === 1 || loading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft />
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
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(paginationInfo.totalPage)}
                      disabled={
                        paginationInfo.currentPage >=
                          paginationInfo.totalPage || loading
                      }
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

      {/* User Detail Dialog */}
      <ViewUserDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        user={selectedUser}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUpdateSuccess={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn vô hiệu hóa người dùng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ vô hiệu hóa người dùng "{selectedUser?.fullName || selectedUser?.email}".
              Người dùng sẽ không thể đăng nhập vào hệ thống nữa.
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
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              {deleteLoading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Vô hiệu hóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
