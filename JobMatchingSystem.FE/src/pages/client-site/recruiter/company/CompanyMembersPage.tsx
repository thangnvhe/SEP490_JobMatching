import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { toast } from "sonner";

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
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  CheckCircle,
  XCircle,
  Clock,
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
import type { HiringManager } from "@/models/hiring-manager";
import type { User } from "@/models/user";
import { UserServices } from "@/services/user.service";

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

// Helper function để format date ngắn
const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper function để tạo avatar initials
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function CompanyMembersPage() {
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);

  // Khai báo local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<HiringManager[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<HiringManager[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<HiringManager | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const pageSizeOptions = [5, 10, 20, 50];

  // Load members from API
  const loadMembers = async (companyId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy danh sách user theo companyId và role HiringManager với pagination
      const response = await UserServices.getAllWithPagination({
        page: 1,
        size: 100, // Lấy nhiều để hiển thị tất cả
        companyId: companyId,
        role: 'HiringManager'
      });
      
      if (response.isSuccess && response.result) {
        // response.result có structure: { items: User[], pageInfo: PageInfo }
        const userData = response.result.items || [];
        
        // Map dữ liệu từ API thành HiringManager format
        const hiringManagers: HiringManager[] = userData.map((user: any) => ({
          id: user.id,
          firstName: user.fullName ? user.fullName.split(' ')[0] : '',
          lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
          email: user.email,
          phoneNumber: user.phoneNumber || user.phone || '',
          position: 'Hiring Manager', // Default position
          department: 'Nhân sự', // Default department  
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: undefined, // API chưa có thông tin này
          companyId: user.companyId,
          avatar: user.avatarUrl || user.avatar || undefined
        }));
        
        setMembers(hiringManagers);
      } else {
        setMembers([]);
        setError('Không thể tải danh sách thành viên');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      setError(error?.message || 'Có lỗi xảy ra khi tải danh sách thành viên');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load company profile data để lấy companyId
  useEffect(() => {
    const loadCompanyInfo = async () => {
      if (!authState.isAuthenticated) {
        setError("Vui lòng đăng nhập để xem thông tin thành viên");
        setLoading(false);
        return;
      }

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
        
        // Load members from API
        await loadMembers(userData.companyId);

      } catch (error) {
        console.error("Error loading company info:", error);
        setError("Có lỗi xảy ra khi tải thông tin công ty");
        setLoading(false);
      }
    };

    loadCompanyInfo();
  }, [authState.isAuthenticated]);

  // Filter members based on keyword and status
  useEffect(() => {
    let filtered = members;

    // Filter by keyword
    if (keyword.trim()) {
      const searchTerm = keyword.toLowerCase();
      filtered = filtered.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.phoneNumber.includes(searchTerm) ||
        member.position.toLowerCase().includes(searchTerm) ||
        member.department.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(member => member.isActive === isActive);
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [members, keyword, statusFilter]);

  // Handler functions
  const handleRefresh = () => {
    if (companyId) {
      loadMembers(companyId);
    }
  };

  const handleSortingChange = (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleView = (member: HiringManager) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (member: HiringManager) => {
    // TODO: Implement edit functionality
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.log('Edit member:', member);
    toast.info("Tính năng chỉnh sửa sẽ được cập nhật sớm");
  };

  const handleDelete = async (member: HiringManager) => {
    // TODO: Implement delete functionality
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success("Xóa thành viên thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thành viên");
      console.error("Error deleting member:", error);
    }
  };

  const handleToggleActive = async (member: HiringManager) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => prev.map(m => 
        m.id === member.id 
          ? { ...m, isActive: !m.isActive }
          : m
      ));
      
      toast.success(`${member.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} thành viên thành công!`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái thành viên");
      console.error("Error toggling member status:", error);
    }
  };

  const handleCreateSuccess = () => {
    // Đóng dialog
    setIsCreateDialogOpen(false);
    
    // Reload danh sách ngay lập tức để có dữ liệu chính xác từ server
    if (companyId) {
      toast.success("Tạo thành viên thành công!");
      loadMembers(companyId);
    }
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

  // Calculate pagination
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = filteredMembers.slice(startIndex, endIndex);

  // Define columns
  const columns = useMemo<ColumnDef<HiringManager>[]>(() => [
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
      id: "member",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: "Thành viên",
      enableSorting: true,
      cell: ({ row }) => {
        const member = row.original;
        const fullName = `${member.firstName} ${member.lastName}`;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatar} alt={fullName} />
              <AvatarFallback className="text-xs">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{fullName}</div>
              <div className="text-xs text-muted-foreground">{member.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "position",
      accessorKey: "position",
      header: "Chức vụ",
      enableSorting: true,
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div>
            <div className="font-medium text-sm">{member.position}</div>
            <div className="text-xs text-muted-foreground">{member.department}</div>
          </div>
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
      id: "lastLogin",
      accessorKey: "lastLoginAt",
      header: "Lần đăng nhập cuối",
      enableSorting: true,
      cell: ({ row }) => {
        const lastLoginAt = row.getValue("lastLogin") as string | undefined;
        return (
          <div className="text-sm">
            {lastLoginAt ? formatDateShort(lastLoginAt) : 'Chưa đăng nhập'}
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.getValue("status") as boolean;
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
            
            <Button
              onClick={() => handleEdit(member)}
              variant="outline"
              size="sm"
              title="Chỉnh sửa"
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleToggleActive(member)}
              variant="outline"
              size="sm"
              className={member.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
              title={member.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              {member.isActive ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => handleDelete(member)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Thành viên công ty</h1>
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
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
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
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMembers.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {keyword || statusFilter !== 'all' ? 'Không tìm thấy thành viên' : 'Chưa có thành viên nào'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {keyword || statusFilter !== 'all' 
                        ? 'Thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc'
                        : 'Hãy tạo thành viên đầu tiên cho công ty của bạn'
                      }
                    </p>
                    {!keyword && statusFilter === 'all' && (
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
                  data={paginatedData}
                  loading={loading}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                />
              )}
              
              {/* Pagination */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between mt-6 gap-6">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {startIndex + 1} - {endIndex} của {totalItems} kết quả
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium">Dòng trên trang</p>
                      <Select
                        value={pageSize.toString()}
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
                        Trang {currentPage} trên {totalPages}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronsLeft />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage >= totalPages}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Chi tiết thành viên
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về thành viên {selectedMember.firstName} {selectedMember.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Member Header */}
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.avatar} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedMember.firstName, selectedMember.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedMember.position}</p>
                  <Badge className={getStatusBadgeColor(selectedMember.isActive)}>
                    {getStatusIcon(selectedMember.isActive)}
                    {getStatusLabel(selectedMember.isActive)}
                  </Badge>
                </div>
              </div>

              {/* Member Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{selectedMember.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Phone className="w-4 h-4 mr-1" />
                      Số điện thoại
                    </label>
                    <p className="text-gray-900">{selectedMember.phoneNumber}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Briefcase className="w-4 h-4 mr-1" />
                      Phòng ban
                    </label>
                    <p className="text-gray-900">{selectedMember.department}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Ngày tham gia
                    </label>
                    <p className="text-gray-900">{formatDate(selectedMember.createdAt)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      Lần đăng nhập cuối
                    </label>
                    <p className="text-gray-900">
                      {selectedMember.lastLoginAt ? formatDate(selectedMember.lastLoginAt) : 'Chưa đăng nhập'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(selectedMember);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
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