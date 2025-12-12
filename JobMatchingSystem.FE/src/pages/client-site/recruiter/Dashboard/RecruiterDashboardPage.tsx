import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, TrendingUp, ShoppingCart } from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { RecruiterDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function RecruiterDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await DashboardServices.getRecruiterDashboard();

        if (response.isSuccess && response.result) {
          setDashboard(response.result);
        } else {
          toast.error("Không thể tải dữ liệu dashboard");
        }
      } catch (error) {
        console.error("Error fetching recruiter dashboard:", error);
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

  const getStatusBadge = (status: number) => {
    const statusMap: Record<number, { label: string; variant: any }> = {
      0: { label: "Chờ duyệt", variant: "secondary" },
      1: { label: "Từ chối", variant: "destructive" },
      2: { label: "Đã duyệt", variant: "default" },
      3: { label: "Đang mở", variant: "default" },
      4: { label: "Đã đóng", variant: "outline" },
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
        <h1 className="text-3xl font-bold tracking-tight text-green-800">Dashboard Nhà Tuyển Dụng</h1>
        <p className="text-gray-600 text-lg mt-2">Xem tổng quan về tin tuyển dụng, ứng viên và chi phí</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Jobs Created */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Tin Tuyển Dụng</span>
              <Briefcase className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboard.jobsCreated}</div>
            <p className="text-xs text-gray-500 mt-2">{dashboard.jobsApproved} đã được duyệt</p>
          </CardContent>
        </Card>

        {/* Candidates Applied */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Ứng Viên Nộp Đơn</span>
              <Users className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{dashboard.candidatesApplied}</div>
            <p className="text-xs text-gray-500 mt-2">Tổng ứng viên đã nộp đơn</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Chi Phí</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboard.totalSpent)}</div>
            <p className="text-xs text-gray-500 mt-2">Tổng chi phí dịch vụ</p>
          </CardContent>
        </Card>

        {/* Plans Purchased */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Gói Dịch Vụ</span>
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.purchasedPlans.length}</div>
            <p className="text-xs text-gray-500 mt-2">Gói đã mua</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Created Jobs */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Tin Mới Tạo</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/jobs")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentCreatedJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có tin tuyển dụng nào</div>
            ) : (
              dashboard.recentCreatedJobs.map((job) => (
                <div key={job.jobId} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-sm text-gray-500">{formatTime(job.createdAt)}</p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Approved Jobs */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-800">Tin Đã Duyệt</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentApprovedJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có tin nào được duyệt</div>
            ) : (
              dashboard.recentApprovedJobs.map((job) => (
                <div key={job.jobId} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-sm text-gray-500">{formatTime(job.createdAt)}</p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Candidates */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-800">Ứng Viên Mới</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/candidates")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentCandidates.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có ứng viên nào</div>
            ) : (
              dashboard.recentCandidates.map((candidate) => (
                <div key={candidate.candidateJobId} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{candidate.candidateName}</p>
                      <p className="text-sm text-gray-600 truncate">{candidate.jobTitle}</p>
                      <p className="text-xs text-gray-500">{formatTime(candidate.appliedAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Purchased Plans */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-orange-50 border-b border-orange-200">
            <CardTitle className="text-orange-800">Gói Dịch Vụ Đã Mua</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.purchasedPlans.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa mua gói dịch vụ nào</div>
            ) : (
              dashboard.purchasedPlans.map((plan) => (
                <div key={plan.orderId} className="border-l-4 border-orange-500 pl-4 py-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{plan.planName}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(plan.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(plan.purchasedAt)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
