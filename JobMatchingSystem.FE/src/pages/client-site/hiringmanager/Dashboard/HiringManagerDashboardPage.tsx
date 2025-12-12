import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { HiringManagerDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function HiringManagerDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<HiringManagerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await DashboardServices.getHiringManagerDashboard();

        if (response.isSuccess && response.result) {
          setDashboard(response.result);
        } else {
          toast.error("Không thể tải dữ liệu dashboard");
        }
      } catch (error) {
        console.error("Error fetching hiring manager dashboard:", error);
        toast.error("Có lỗi xảy ra khi tải dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Dashboard Người Phỏng Vấn</h1>
        <p className="text-gray-600 text-lg mt-2">Quản lý ứng viên, lịch phỏng vấn và đánh giá</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Reviewed */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Đã Đánh Giá</span>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{dashboard.totalReviewedCandidates}</div>
            <p className="text-xs text-gray-500 mt-2">Tổng ứng viên</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Chờ Đánh Giá</span>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.pendingReviewCount}</div>
            <p className="text-xs text-gray-500 mt-2">Ứng viên cần xem xét</p>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Phỏng Vấn Sắp Tới</span>
              <Users className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dashboard.upcomingInterviewCount}</div>
            <p className="text-xs text-gray-500 mt-2">Trong 7 ngày tới</p>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span>Thống Kê Tháng</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Duyệt:</span>
                <span className="text-lg font-bold text-green-600">{dashboard.approvedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Từ chối:</span>
                <span className="text-lg font-bold text-red-600">{dashboard.rejectedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Reviews */}
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="bg-orange-50 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-800">Chờ Đánh Giá ({dashboard.pendingReviewCount})</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.pendingReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có ứng viên chờ đánh giá</div>
            ) : (
              dashboard.pendingReviews.map((review) => (
                <div key={review.candidateStageId} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900">{review.candidateName}</p>
                    <Badge variant="secondary" className="text-xs">
                      {review.stageName}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{review.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">Nộp: {formatTime(review.submittedAt)}</p>
                  {review.interviewLocation && (
                    <p className="text-xs text-gray-500">📍 {review.interviewLocation}</p>
                  )}
                  {review.googleMeetLink && (
                    <a href={review.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      🔗 Google Meet
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Phỏng Vấn Sắp Tới ({dashboard.upcomingInterviewCount})</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dashboard.upcomingInterviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Không có phỏng vấn sắp tới</div>
            ) : (
              dashboard.upcomingInterviews.map((interview) => (
                <div key={interview.candidateStageId} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900">{interview.candidateName}</p>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      {interview.stageName}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">📅 {formatTime(interview.interviewDateTime)}</p>
                  {interview.interviewLocation && (
                    <p className="text-xs text-gray-500">📍 {interview.interviewLocation}</p>
                  )}
                  {interview.googleMeetLink && (
                    <a href={interview.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      🔗 Google Meet
                    </a>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
