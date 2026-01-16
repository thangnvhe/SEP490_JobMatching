import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  AlertTriangle,
  RefreshCcw,
  MapPin,
  ExternalLink
} from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { HiringManagerDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function HiringManagerDashboardPage() {
  const [dashboard, setDashboard] = useState<HiringManagerDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DashboardServices.getHiringManagerDashboard();

      if (response.isSuccess && response.result) {
        setDashboard(response.result);
      } else {
        const errorMsg = "Không thể tải dữ liệu dashboard";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching hiring manager dashboard:", error);
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

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
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
          {Array.from({ length: 2 }).map((_, i) => (
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
              <CardTitle className="text-2xl font-bold">Dashboard Người Phỏng Vấn</CardTitle>
              <p className="text-muted-foreground mt-1">
                Quản lý ứng viên, lịch phỏng vấn và đánh giá
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviewed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Đã Đánh Giá</span>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalReviewedCandidates}</div>
            <p className="text-xs text-muted-foreground mt-2">Tổng ứng viên</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Chờ Đánh Giá</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.pendingReviewCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Ứng viên cần xem xét</p>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Phỏng Vấn Sắp Tới</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.upcomingInterviewCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Trong 7 ngày tới</p>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Thống Kê Tháng</span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Duyệt:</span>
                <span className="text-lg font-bold text-green-600">{dashboard.approvedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Từ chối:</span>
                <span className="text-lg font-bold text-destructive">{dashboard.rejectedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Chờ Đánh Giá ({dashboard.pendingReviewCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.pendingReviews.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có ứng viên chờ đánh giá</div>
            ) : (
              dashboard.pendingReviews.map((review) => (
                <div key={review.candidateStageId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{review.candidateName}</p>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {review.stageName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.jobTitle}</p>
                  {review.submittedAt && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Nộp: {formatTime(review.submittedAt)}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 mt-2">
                    {review.interviewLocation && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {review.interviewLocation}
                      </p>
                    )}
                    {review.googleMeetLink && (
                      <a 
                        href={review.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Google Meet
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Phỏng Vấn Sắp Tới ({dashboard.upcomingInterviewCount})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : dashboard.upcomingInterviews.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có phỏng vấn sắp tới</div>
            ) : (
              dashboard.upcomingInterviews.map((interview) => (
                <div key={interview.candidateStageId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{interview.candidateName}</p>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {interview.stageName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                  {interview.interviewDateTime && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(interview.interviewDateTime)}
                    </p>
                  )}
                  <div className="flex flex-col gap-1 mt-2">
                    {interview.interviewLocation && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {interview.interviewLocation}
                      </p>
                    )}
                    {interview.googleMeetLink && (
                      <a 
                        href={interview.googleMeetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Google Meet
                      </a>
                    )}
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
