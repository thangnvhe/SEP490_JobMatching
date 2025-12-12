import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Clock, Heart, AlertCircle } from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { CandidateDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function CandidateDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await DashboardServices.getCandidateDashboard();

        if (response.isSuccess && response.result) {
          setDashboard(response.result);
        } else {
          toast.error("Không thể tải dữ liệu dashboard");
        }
      } catch (error) {
        console.error("Error fetching candidate dashboard:", error);
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-200">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">Dashboard Ứng Viên</h1>
        <p className="text-gray-600 text-lg mt-2">Theo dõi đơn ứng tuyển và lịch phỏng vấn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Applied Jobs */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Đã Nộp Đơn</span>
              <Briefcase className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{dashboard.totalAppliedJobs}</div>
            <p className="text-xs text-gray-500 mt-2">Tổng đơn ứng tuyển</p>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Phỏng Vấn Sắp Tới</span>
              <Clock className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboard.upcomingInterviewCount}</div>
            <p className="text-xs text-gray-500 mt-2">Lịch sắp diễn ra</p>
          </CardContent>
        </Card>

        {/* Saved Jobs */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Đã Lưu</span>
              <Heart className="h-5 w-5 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{dashboard.totalSavedJobs}</div>
            <p className="text-xs text-gray-500 mt-2">Công việc yêu thích</p>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Báo Cáo</span>
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.totalReports}</div>
            <p className="text-xs text-gray-500 mt-2">Vi phạm đã báo cáo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applied Jobs */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-800">Đơn Ứng Tuyển Gần Nhất</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.recentAppliedJobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa nộp đơn công việc nào</div>
            ) : (
              dashboard.recentAppliedJobs.map((job) => (
                <div key={job.jobId} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{job.jobTitle}</p>
                      <p className="text-sm text-gray-500">{formatTime(job.appliedAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Lịch Phỏng Vấn Sắp Tới</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.upcomingStages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có phỏng vấn sắp tới</div>
            ) : (
              dashboard.upcomingStages.map((stage, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900">{stage.jobTitle}</p>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {stage.stageName}
                    </Badge>
                  </div>
                  {stage.scheduleTime && (
                    <p className="text-sm text-gray-600">📅 {new Date(stage.scheduleTime).toLocaleString("vi-VN")}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Jobs */}
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-800">Công Việc Yêu Thích ({dashboard.totalSavedJobs})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/saved-jobs")}>
              Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dashboard.recentSavedJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Chưa lưu công việc nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.recentSavedJobs.map((job) => (
                <div key={job.jobId} className="border-l-4 border-red-500 pl-4 py-2 p-3 bg-red-50 rounded">
                  <p className="font-medium text-gray-900">{job.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">Lưu: {formatDate(job.savedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
