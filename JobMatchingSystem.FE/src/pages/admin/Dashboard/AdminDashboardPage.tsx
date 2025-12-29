import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Building2, 
  Briefcase, 
  AlertCircle, 
  TrendingUp, 
  ShoppingCart,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { AdminDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DashboardServices.getAdminDashboard();

      if (response.isSuccess && response.result) {
        setDashboard(response.result);
      } else {
        const errorMsg = "Không thể tải dữ liệu dashboard";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      const errorMsg = "Có lỗi xảy ra khi tải dashboard";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const getCompanyStatusBadge = (status: number) => {
    const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      0: { label: "Chờ duyệt", variant: "secondary" },
      1: { label: "Đã duyệt", variant: "default" },
      2: { label: "Bị từ chối", variant: "destructive" },
      3: { label: "Bị khóa", variant: "outline" },
    };
    const info = statusMap[status] || { label: "Không xác định", variant: "outline" };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
                  <Skeleton key={j} className="h-16 w-full" />
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
              <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
              <p className="text-muted-foreground mt-1">
                Quản lý toàn bộ hệ thống, công ty, việc làm và doanh thu
              </p>
            </div>
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
        </CardHeader>
      </Card>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Companies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Công Ty Mới</span>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.newCompanies}</div>
            <p className="text-xs text-muted-foreground mt-2">{dashboard.approvedCompanies} đã duyệt</p>
          </CardContent>
        </Card>

        {/* Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Việc Làm Mới</span>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.newJobs}</div>
            <p className="text-xs text-muted-foreground mt-2">{dashboard.openedJobs} đang mở</p>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Báo Cáo Mới</span>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.newReports}</div>
            <p className="text-xs text-muted-foreground mt-2">Cần xử lý</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Doanh Thu</span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboard.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-2">Tháng này</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Đơn Hàng</span>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.successfulOrders}</div>
            <p className="text-xs text-muted-foreground mt-2">Hoàn tất</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Công Ty Mới</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/companies")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dashboard.recentCompanies.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có công ty mới</div>
            ) : (
              dashboard.recentCompanies.map((company) => (
                <div key={company.companyId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(company.createdAt)}</p>
                    </div>
                    {getCompanyStatusBadge(company.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approved Companies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Công Ty Đã Duyệt</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/companies")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dashboard.recentApprovedCompanies.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có công ty được duyệt</div>
            ) : (
              dashboard.recentApprovedCompanies.map((company) => (
                <div key={company.companyId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(company.createdAt)}</p>
                    </div>
                    {getCompanyStatusBadge(company.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Việc Làm Mới</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/jobs")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dashboard.recentJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có việc làm mới</div>
            ) : (
              dashboard.recentJobs.map((job) => (
                <div key={job.jobId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(job.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đơn Hàng Gần Nhất</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : dashboard.recentOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có đơn hàng</div>
            ) : (
              dashboard.recentOrders.map((order) => (
                <div key={order.id} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Đơn #{order.id}</p>
                      <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Service Plans */}
      {dashboard.topServicePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gói Dịch Vụ Được Mua Nhiều Nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.topServicePlans.map((plan) => (
                <div key={plan.serviceId} className="bg-muted/50 rounded-lg p-4 border">
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-2xl font-bold mt-2">{plan.purchaseCount}</p>
                  <p className="text-xs text-muted-foreground">Lần mua</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
