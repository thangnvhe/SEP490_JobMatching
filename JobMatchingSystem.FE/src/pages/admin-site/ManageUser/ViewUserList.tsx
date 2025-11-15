import { useCallback, useEffect, useMemo, useState } from "react";
import { UserServices } from "@/services/user.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { User } from "@/models/user";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Edit, KeyRound, Trash2, AlertTriangle } from "lucide-react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/useDebounce";

export default function ViewUserList() {
    // Khai báo local state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [keyword, setKeyword] = useState('');
    const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
        currentPage: 1,
        pageSize: 10,
        totalItem: 0,
        totalPage: 0,
        hasPreviousPage: false,
        hasNextPage: false,
    });
    const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
        page: 1,
        size: 10,
        search: '',
        sortBy: 'email',
        direction: 'asc',
    });
    const pageSizeOptions = [5, 10, 20, 50];
    const debouncedKeyword = useDebounce(keyword, 700);

    // Viết các hàm xử lý logic
    const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
        try {
            setLoading(true);
            setError(null);
            const response = await UserServices.getAllWithPagination(params);
            setUsers(response.result.items);
            setPaginationInfo(response.result.pager);
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi khi tải dữ liệu người dùng");
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        const params = {
            ...paginationInput,
            search: debouncedKeyword,
        };
        getAllWithPagination(params);
    }, [getAllWithPagination, debouncedKeyword, paginationInput]);

    // Handler functions
    const handleAddNew = () => {
        // TODO: Implement add new user
        console.log("Add new user");
    };

    const handleRefresh = () => {
        getAllWithPagination(paginationInput);
    };

    const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
        const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
        setSorting(newSorting);
        if (newSorting.length > 0) {
            const sort = newSorting[0];
            setPaginationInput(prev => ({
                ...prev,
                sortBy: sort.id,
                direction: sort.desc ? 'desc' : 'asc'
            }));
        }
    };

    const handlePageChange = (page: number) => {
        setPaginationInput(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (size: string) => {
        setPaginationInput(prev => ({ ...prev, size: parseInt(size), page: 1 }));
    };

    const handleView = (user: User) => {
        // TODO: Implement view user details
        console.log("View user:", user);
    };

    const handleEdit = (user: User) => {
        // TODO: Implement edit user
        console.log("Edit user:", user);
    };

    const handleDelete = (user: User) => {
        // TODO: Implement delete user
        console.log("Delete user:", user);
    };

    const handleOpenReset = (user: User) => {
        // TODO: Implement reset password
        console.log("Reset password for user:", user);
    };

    // Helper functions
    const getRoleBadgeColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'recruiter':
            case 'superrecruiter':
                return 'bg-blue-100 text-blue-800';
            case 'candidate':
                return 'bg-green-100 text-green-800';
            case 'staff':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: "id",
            accessorKey: "id",
            header: "STT",
            cell: ({ row }) => {
                const index = row.index
                return (paginationInfo.currentPage - 1) * paginationInfo.pageSize + index + 1
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
            id: "gender",
            accessorKey: "gender",
            header: "Giới tính",
            cell: ({ row }) => {
                const gender = row.getValue("gender") as boolean | null
                if (gender === null) return 'Chưa cập nhật'
                return gender ? 'Nam' : 'Nữ'
            },
            enableSorting: true,
        },
        {
            id: "birthday",
            accessorKey: "birthday",
            header: "Ngày sinh",
            cell: ({ row }) => {
                const birthday = row.getValue("birthday") as string | null
                if (!birthday) return 'Chưa cập nhật'
                return new Date(birthday).toLocaleDateString('vi-VN')
            },
            enableSorting: true,
        },
        {
            id: "isActive",
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive") as boolean
                return (
                    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </Badge>
                )
            },
            enableSorting: true,
        },
        {
            id: "role",
            accessorKey: "role",
            header: "Vai trò",
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                return (
                    <Badge className={getRoleBadgeColor(role || '')}>
                        {role === 'Admin' ? 'Quản trị viên' :
                            role === 'Recruiter' ? 'Nhà tuyển dụng' :
                                role === 'Candidate' ? 'Ứng viên' :
                                    role === 'Staff' ? 'Nhân viên' :
                                        role === 'SuperRecruiter' ? 'Nhà tuyển dụng cao cấp' : 'Không xác định'}
                    </Badge>
                )
            },
            enableSorting: true,
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const user = row.original
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
                            onClick={() => handleOpenReset(user)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            title="Đặt lại mật khẩu"
                        >
                            <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={() => handleDelete(user)}
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            title="Vô hiệu hóa người dùng"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            enableSorting: false,
        },
    ], [paginationInfo])


    // Viết html xử lý kết hợp các hàm logic trên
    return (
        <div className="p-6 space-y-6">
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
                            <Button onClick={handleAddNew} size="default" className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Thêm mới</span>
                            </Button>
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
                    {loading && !users.length ? (
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
                            data={users}
                            loading={loading}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                        />
                    )}
                    {!error && paginationInfo && (
                        <div className="flex items-center justify-between mt-4 gap-6">
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
                                            <ChevronsLeft />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                                            disabled={paginationInfo.currentPage === 1 || loading}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronLeft />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                                            disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ChevronRight />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(paginationInfo.totalPage)}
                                            disabled={paginationInfo.currentPage >= paginationInfo.totalPage || loading}
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
        </div>
    );
}
