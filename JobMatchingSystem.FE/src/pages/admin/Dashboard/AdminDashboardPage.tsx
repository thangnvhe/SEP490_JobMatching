import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Briefcase, AlertCircle, TrendingUp, ShoppingCart } from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { AdminDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await DashboardServices.getAdminDashboard();

        if (response.isSuccess && response.result) {
          setDashboard(response.result);
        } else {
          toast.error("Không thể tải dữ liệu dashboard");
        }
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        toast.error("Có lỗi xảy ra khi tải dashboard");
      } finally {
        setIsLoading(false);
      }
    };

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
    const statusMap: Record<number, { label: string; variant: any }> = {
      0: { label: "Chờ duyệt", variant: "secondary" },
      1: { label: "Đã duyệt", variant: "default" },
      2: { label: "Bị từ chối", variant: "destructive" },
      3: { label: "Bị khóa", variant: "outline" },
    };
    const info = statusMap[status] || { label: "Không xác định", variant: "outline" };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Không thể tải dữ liệu dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
        <h1 className="text-3xl font-bold tracking-tight text-red-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg mt-2">Quản lý toàn bộ hệ thống, công ty, việc làm và doanh thu</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Companies */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Công Ty Mới</span>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{dashboard.newCompanies}</div>
            <p className="text-xs text-gray-500 mt-2">{dashboard.approvedCompanies} đã duyệt</p>
          </CardContent>
        </Card>

        {/* Jobs */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Việc Làm Mới</span>
              <Briefcase className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboard.newJobs}</div>
            <p className="text-xs text-gray-500 mt-2">{dashboard.openedJobs} đang mở</p>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Báo Cáo Mới</span>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.newReports}</div>
            <p className="text-xs text-gray-500 mt-2">Cần xử lý</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Doanh Thu</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboard.monthlyRevenue)}</div>
            <p className="text-xs text-gray-500 mt-2">Tháng này</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Đơn Hàng</span>
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{dashboard.successfulOrders}</div>
            <p className="text-xs text-gray-500 mt-2">Hoàn tất</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Companies */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800">Công Ty Mới</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/companies")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentCompanies.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có công ty mới</div>
            ) : (
              dashboard.recentCompanies.map((company) => (
                <div key={company.companyId} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{company.name}</p>
                      <p className="text-sm text-gray-500">{formatTime(company.createdAt)}</p>
                    </div>
                    {getCompanyStatusBadge(company.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approved Companies */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Công Ty Đã Duyệt</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentApprovedCompanies.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có công ty được duyệt</div>
            ) : (
              dashboard.recentApprovedCompanies.map((company) => (
                <div key={company.companyId} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{company.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(company.createdAt)}</p>
                    </div>
                    {getCompanyStatusBadge(company.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Việc Làm Mới</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/jobs")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có việc làm mới</div>
            ) : (
              dashboard.recentJobs.map((job) => (
                <div key={job.jobId} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-sm text-gray-500">{formatTime(job.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-800">Đơn Hàng Gần Nhất</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có đơn hàng</div>
            ) : (
              dashboard.recentOrders.map((order) => (
                <div key={order.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">Đơn #{order.id}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(order.amount)}</p>
                      <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
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
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader className="bg-indigo-50 border-b border-indigo-200">
            <CardTitle className="text-indigo-800">Gói Dịch Vụ Được Mua Nhiều Nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboard.topServicePlans.map((plan) => (
                <div key={plan.serviceId} className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <p className="font-medium text-indigo-900">{plan.name}</p>
                  <p className="text-lg font-bold text-indigo-600 mt-2">{plan.purchaseCount}</p>
                  <p className="text-xs text-gray-600">Lần mua</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
