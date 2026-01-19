import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { RecruiterDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function RecruiterDashboardPage() {
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DashboardServices.getRecruiterDashboard(selectedMonth, selectedYear);

      if (response.isSuccess && response.result) {
        setDashboard(response.result);
      } else {
        const errorMsg = "Không thể tải dữ liệu dashboard";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching recruiter dashboard:", error);
      const errorMsg = "Có lỗi xảy ra khi tải dashboard";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth, selectedYear]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const getStatusLabel = (status: number | string) => {
    // Nếu là string, trả về trực tiếp
    if (typeof status === 'string') {
      const statusMap: { [key: string]: string } = {
        'Draft': 'Đang chờ duyệt',
        'Rejected': 'Bị từ chối',
        'Moderated': 'Đã kiểm duyệt',
        'Opened': 'Đang mở',
        'Closed': 'Đã đóng'
      };
      return statusMap[status] || status;
    }
    
    // Nếu là number, convert sang string
    // Mapping: 0=Draft, 1=Rejected, 2=Moderated, 3=Opened, 4=Closed
    const statusMap: { [key: number]: string } = {
      0: 'Đang chờ duyệt',
      1: 'Bị từ chối',
      2: 'Đã kiểm duyệt',
      3: 'Đang mở',
      4: 'Đã đóng'
    };
    return statusMap[status] || 'Không xác định';
  };

  const getStatusBadgeClass = (status: number | string) => {
    if (typeof status === 'string') {
      switch (status) {
        case 'Opened':
          return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'Moderated':
          return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case 'Draft':
          return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'Closed':
          return 'bg-red-100 text-red-800 hover:bg-red-100';
        case 'Rejected':
          return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      }
    }
    
    // Nếu là number
    // Mapping: 0=Draft, 1=Rejected, 2=Moderated, 3=Opened, 4=Closed
    switch (status) {
      case 3: // Opened
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 2: // Moderated
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 0: // Draft
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 4: // Closed
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 1: // Rejected
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Tạo danh sách tháng và năm để filter
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  if (isLoading && !dashboard) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Không thể tải dữ liệu</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchDashboard} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Dashboard Nhà Tuyển Dụng</CardTitle>
              <p className="text-muted-foreground mt-1">
                Quản lý công việc, ứng viên và gói dịch vụ
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter Month */}
              <Select
                value={selectedMonth !== undefined ? selectedMonth.toString() : "all"}
                onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tất cả tháng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tháng</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filter Year */}
              <Select
                value={selectedYear !== undefined ? selectedYear.toString() : "all"}
                onValueChange={(value) => setSelectedYear(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tất cả năm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={fetchDashboard} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jobs Created */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Công Việc Đã Tạo</span>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.jobsCreated}</div>
            <p className="text-xs text-muted-foreground mt-2">Tổng số công việc</p>
          </CardContent>
        </Card>

        {/* Jobs Approved */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Công Việc Đã Duyệt</span>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.jobsApproved}</div>
            <p className="text-xs text-muted-foreground mt-2">Đã được phê duyệt</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Tổng Chi Tiêu</span>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboard.totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-2">Tổng số tiền đã chi</p>
          </CardContent>
        </Card>

        {/* Candidates Applied */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Ứng Viên Đã Ứng Tuyển</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.candidatesApplied}</div>
            <p className="text-xs text-muted-foreground mt-2">Tổng số ứng viên</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Created Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Công Việc Đã Tạo Gần Đây ({dashboard.recentCreatedJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.recentCreatedJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có công việc nào</div>
            ) : (
              dashboard.recentCreatedJobs.map((job) => (
                <div key={job.jobId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{job.title}</p>
                    <Badge className={`text-xs shrink-0 ${getStatusBadgeClass(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tạo: {formatTime(job.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Approved Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Công Việc Đã Duyệt Gần Đây ({dashboard.recentApprovedJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.recentApprovedJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có công việc nào</div>
            ) : (
              dashboard.recentApprovedJobs.map((job) => (
                <div key={job.jobId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{job.title}</p>
                    <Badge className={`text-xs shrink-0 ${getStatusBadgeClass(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Tạo: {formatTime(job.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Purchased Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Gói Dịch Vụ Đã Mua ({dashboard.purchasedPlans.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.purchasedPlans.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Chưa mua gói dịch vụ nào</div>
            ) : (
              dashboard.purchasedPlans.map((plan) => (
                <div key={plan.orderId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{plan.planName}</p>
                    <Badge variant="default" className="text-xs shrink-0">
                      {formatCurrency(plan.amount)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Mua: {formatTime(plan.purchasedAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Ứng Viên Gần Đây ({dashboard.recentCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.recentCandidates.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Chưa có ứng viên nào ứng tuyển</div>
            ) : (
              dashboard.recentCandidates.map((candidate) => (
                <div key={candidate.candidateJobId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{candidate.candidateName}</p>
                    {/* {candidate.cvId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          // TODO: Navigate to CV detail
                          console.log('View CV:', candidate.cvId);
                        }}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        CV
                      </Button>
                    )} */}
                  </div>
                  <p className="text-sm text-muted-foreground">{candidate.jobTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Ứng tuyển: {formatTime(candidate.appliedAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

