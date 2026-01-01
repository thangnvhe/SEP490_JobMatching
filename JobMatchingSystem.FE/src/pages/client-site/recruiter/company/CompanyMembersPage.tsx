import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

// Import các UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import icons
import {
  UserPlus,
  RefreshCcw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Briefcase,
  Calendar,
} from "lucide-react";

// Import components
import { DataTable } from "@/components/ui/data-table";
import { CreateMemberDialog } from "@/components/dialogs/CreateMemberDialog";

// Import types và services
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { User } from "@/models/user";
import { UserServices } from "@/services/user.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";

// Helper function để format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function để tạo avatar initials
const getInitials = (fullName: string) => {
  const names = fullName.split(' ');
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
};

export default function CompanyMembersPage() {
  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedKeyword = useDebounce(keyword, 700);
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: '',
    isDecending: false,
  });

  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 10,
    search: '',
    sortBy: '',
    isDecending: false,
  });

  const pageSizeOptions = [5, 10, 20, 50];

  // Load members từ API với pagination/filter giống pattern ViewJobList
  const loadMembers = useCallback(async (params: PaginationParamsInput) => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const apiParams: any = {
        ...params,
        companyId,
        role: 'HiringManager',
      };

      if (statusFilter !== 'all') {
        apiParams.isActive = statusFilter === 'true';
      }

      const response = await UserServices.getAllWithPagination(apiParams);

      if (response.isSuccess && response.result) {
        const userData = response.result.items || [];
        const users: User[] = userData.map((user: any) => ({
          id: user.id,
          userName: user.userName || user.email,
          email: user.email,
          fullName: user.fullName || '',
          avatarUrl: user.avatarUrl || user.avatar || null,
          gender: user.gender || null,
          birthday: user.birthday || null,
          score: user.score || 100,
          isActive: user.isActive,
          createdAt: user.createdAt,
          phoneNumber: user.phoneNumber || user.phone || '',
          address: user.address || '',
          companyId: user.companyId,
          role: user.role,
        }));

        setMembers(users);
        if (response.result.pageInfo) {
          setPaginationInfo(response.result.pageInfo);
        }
      } else {
        setMembers([]);
        setError('Không thể tải danh sách thành viên');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      setError(error?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách thành viên');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter]);

  // Load company profile data để lấy companyId
  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user info to get companyId
        const userResponse = await UserServices.getUserProfile();
        
        if (!userResponse.isSuccess || !userResponse.result) {
          setError("Không thể tải thông tin người dùng");
          setLoading(false);
          return;
        }

        const userData = userResponse.result as User;

        if (!userData.companyId) {
          setError("Tài khoản chưa được liên kết với công ty nào");
          setLoading(false);
          return;
        }

        setCompanyId(userData.companyId);

      } catch (error) {
        console.error("Error loading company info:", error);
        setError("Có lỗi xảy ra khi tải thông tin công ty");
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, []);

  // Load members khi companyId + filter/pagination thay đổi
  useEffect(() => {
    if (!companyId) return;

    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };

    loadMembers(params);
  }, [companyId, debouncedKeyword, loadMembers, paginationInput]);

  // Handler functions
  const handleRefresh = () => {
    const params = { ...paginationInput, search: debouncedKeyword };
    loadMembers(params);
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);

    setPaginationInput(prev => {
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
    setPaginationInput(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: string) => {
    setPaginationInput(prev => ({ ...prev, size: parseInt(size), page: 1 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPaginationInput(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (member: User) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (member: User) => {
    try {
      await UserServices.changeStatus(member.id.toString(), false);
      
      toast.success("Xóa mềm thành viên thành công!");

      setStatusFilter('all');
      const params = { ...paginationInput, search: debouncedKeyword };
      loadMembers(params);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thành viên");
      console.error("Error soft deleting member:", error);
    }
  };

  const handleCreateSuccess = () => {
    // Đóng dialog
    setIsCreateDialogOpen(false);
    
    // Reload danh sách ngay lập tức để có dữ liệu chính xác từ server
    toast.success("Tạo thành viên thành công!");
    const params = { ...paginationInput, search: debouncedKeyword };
    loadMembers(params);
  };

  // Helper functions
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-3 w-3 mr-1" />
      : <XCircle className="h-3 w-3 mr-1" />;
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  };

  // Calculate start index for STT
  const startIndex = (paginationInfo.currentPage - 1) * paginationInfo.pageSize;
  const startItem = paginationInfo.totalItem
    ? (paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1
    : 0;
  const endItem = Math.min(
    paginationInfo.currentPage * paginationInfo.pageSize,
    paginationInfo.totalItem
  );

  // Define columns
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return startIndex + index + 1;
      },
      enableSorting: false,
    },
    {
      id: "fullName",
      accessorFn: (row) => row.fullName,
      header: "Thành viên",
      enableSorting: true,
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatarUrl || ''} alt={member.fullName} />
              <AvatarFallback className="text-xs">
                {getInitials(member.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{member.fullName}</div>
              <div className="text-xs text-muted-foreground">{member.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "position",
      accessorKey: "role",
      header: "Chức vụ",
      enableSorting: false,
      cell: ({ row: _ }) => {
        return (
          <div className="font-medium text-sm">Quản lý tuyển dụng</div>
        );
      },
    },
    {
      id: "phoneNumber",
      accessorKey: "phoneNumber",
      header: "Điện thoại",
      enableSorting: true,
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phoneNumber") as string;
        return (
          <div className="text-sm">
            {phoneNumber}
          </div>
        );
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge className={getStatusBadgeColor(isActive)}>
            {getStatusIcon(isActive)}
            {getStatusLabel(isActive)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center space-x-1">
            <Button
              onClick={() => handleView(member)}
              variant="outline"
              size="sm"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {member.isActive && (
              <Button
                onClick={() => handleDelete(member)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                title="Xóa mềm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ], [startIndex]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Thành viên công ty</h1>
        <p className="text-muted-foreground">
          Quản lý danh sách Hiring Manager và nhân sự tuyển dụng
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Tìm kiếm thành viên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-64"
              />
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Hoạt động</SelectItem>
                  <SelectItem value="false">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Tạo thành viên
              </Button>
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
          {loading && !members.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Đang tải danh sách thành viên...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Users className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Thử lại
              </Button>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Users className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {keyword || statusFilter !== "all"
                  ? "Không tìm thấy thành viên"
                  : "Chưa có thành viên nào"}
              </p>
              {!keyword && statusFilter === "all" && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tạo thành viên đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={members}
                loading={loading}
                sorting={sorting}
                onSortingChange={handleSortingChange}
              />

              {/* Pagination */}
              {paginationInfo.totalItem > 0 && (
                <div className="flex items-center justify-between mt-4 gap-6">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {startItem} - {endItem} của {paginationInfo.totalItem} kết quả
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
                        {paginationInfo.totalPage || 1}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={paginationInfo.currentPage === 1 || loading}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                          disabled={paginationInfo.currentPage === 1 || loading}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                          disabled={
                            paginationInfo.currentPage >= paginationInfo.totalPage ||
                            paginationInfo.totalPage === 0 ||
                            loading
                          }
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.totalPage)}
                          disabled={
                            paginationInfo.currentPage >= paginationInfo.totalPage ||
                            paginationInfo.totalPage === 0 ||
                            loading
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

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết thành viên</DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border">
                <Avatar className="h-16 w-16 border-2">
                  <AvatarImage
                    src={selectedMember.avatarUrl || ""}
                    alt={selectedMember.fullName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(selectedMember.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedMember.fullName}
                  </h3>
                  <Badge className={getStatusBadgeColor(selectedMember.isActive)}>
                    {getStatusIcon(selectedMember.isActive)}
                    {getStatusLabel(selectedMember.isActive)}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Thông tin liên hệ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedMember.email && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground">
                          {selectedMember.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedMember.phoneNumber && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Số điện thoại</p>
                        <p className="text-sm text-foreground">
                          {selectedMember.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Information */}
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Thông tin thành viên
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Chức vụ</p>
                      <p className="text-sm text-foreground">Quản lý tuyển dụng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                      <p className="text-sm text-foreground">
                        {selectedMember.createdAt
                          ? formatDate(selectedMember.createdAt)
                          : "Không xác định"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Member Dialog */}
      {companyId && (
        <CreateMemberDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          companyId={companyId}
          onCreateSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

export { CompanyMembersPage };