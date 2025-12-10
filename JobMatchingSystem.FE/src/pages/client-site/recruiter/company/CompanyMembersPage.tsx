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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import icons
import {
  Search,
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
          <div className="font-medium text-sm">Hiring Manager</div>
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="flex space-x-4">
                  <div className="h-10 bg-gray-200 rounded w-80"></div>
                  <div className="h-10 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không thể tải danh sách thành viên
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thành viên công ty
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý danh sách Hiring Manager và nhân sự tuyển dụng
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tạo thành viên
            </Button>
          </div>

          {/* Search and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm thành viên..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
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
              {members.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {keyword || statusFilter !== "all"
                        ? "Không tìm thấy thành viên"
                        : "Chưa có thành viên nào"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {keyword || statusFilter !== "all"
                        ? "Thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc"
                        : "Hãy tạo thành viên đầu tiên cho công ty của bạn"}
                    </p>
                    {!keyword && statusFilter === "all" && (
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Tạo thành viên đầu tiên
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={members}
                  loading={loading}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                />
              )}

              {/* Pagination */}
              {paginationInfo.totalItem > 0 && (
                <div className="flex items-center justify-between mt-6 gap-6">
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
                        Trang {paginationInfo.currentPage} trên {paginationInfo.totalPage || 1}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={paginationInfo.currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                          disabled={paginationInfo.currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                          disabled={paginationInfo.currentPage >= paginationInfo.totalPage || paginationInfo.totalPage === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationInfo.totalPage)}
                          disabled={paginationInfo.currentPage >= paginationInfo.totalPage || paginationInfo.totalPage === 0}
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
      </div>

      {/* View Member Dialog */}
      {isViewDialogOpen && selectedMember && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Chi tiết thành viên
              </DialogTitle>
              <DialogDescription className="text-base">
                Thông tin chi tiết về thành viên {selectedMember.fullName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-4">
              {/* Member Header */}
              <div className="flex items-start space-x-6 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={selectedMember.avatarUrl || ""}
                    alt={selectedMember.fullName}
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(selectedMember.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {selectedMember.fullName}
                  </h3>
                  <p className="text-xl text-gray-600 mb-4">Hiring Manager</p>
                  <Badge
                    className={`${getStatusBadgeColor(
                      selectedMember.isActive
                    )} text-base px-4 py-2`}
                  >
                    {getStatusIcon(selectedMember.isActive)}
                    {getStatusLabel(selectedMember.isActive)}
                  </Badge>
                </div>
              </div>

              {/* Member Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 flex items-center mb-3">
                      <Mail className="w-5 h-5 mr-2" />
                      Email
                    </label>
                    <p className="text-lg text-gray-900 break-all">
                      {selectedMember.email}
                    </p>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 flex items-center mb-3">
                      <Phone className="w-5 h-5 mr-2" />
                      Số điện thoại
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedMember.phoneNumber || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 flex items-center mb-3">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Chức vụ
                    </label>
                    <p className="text-lg text-gray-900">Hiring Manager</p>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 flex items-center mb-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      Ngày tham gia
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedMember.createdAt
                        ? formatDate(selectedMember.createdAt)
                        : "Không xác định"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="px-8 py-3 text-base"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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