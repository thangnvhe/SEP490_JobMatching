import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Briefcase, 
  Clock, 
  Heart, 
  AlertCircle,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { DashboardServices } from "@/services/dashboard.service";
import type { CandidateDashboard } from "@/models/dashboard";
import { toast } from "sonner";

export default function CandidateDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<CandidateDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await DashboardServices.getCandidateDashboard();

      if (response.isSuccess && response.result) {
        setDashboard(response.result);
      } else {
        const errorMsg = "Không thể tải dữ liệu dashboard";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching candidate dashboard:", error);
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
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Saved Jobs Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
              <CardTitle className="text-2xl font-bold">Dashboard Ứng Viên</CardTitle>
              <p className="text-muted-foreground mt-1">
                Theo dõi đơn ứng tuyển và lịch phỏng vấn
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
        {/* Applied Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Đã Nộp Đơn</span>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalAppliedJobs}</div>
            <p className="text-xs text-muted-foreground mt-2">Tổng đơn ứng tuyển</p>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Phỏng Vấn Sắp Tới</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.upcomingInterviewCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Lịch sắp diễn ra</p>
          </CardContent>
        </Card>

        {/* Saved Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Đã Lưu</span>
              <Heart className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalSavedJobs}</div>
            <p className="text-xs text-muted-foreground mt-2">Công việc yêu thích</p>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Báo Cáo</span>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.totalReports}</div>
            <p className="text-xs text-muted-foreground mt-2">Vi phạm đã báo cáo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applied Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đơn Ứng Tuyển Gần Nhất</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")}>
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
            ) : dashboard.recentAppliedJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Chưa nộp đơn công việc nào</div>
            ) : (
              dashboard.recentAppliedJobs.map((job) => (
                <div key={job.jobId} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(job.appliedAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lịch Phỏng Vấn Sắp Tới</CardTitle>
              <Button variant="ghost" size="sm">
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
            ) : dashboard.upcomingStages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Không có phỏng vấn sắp tới</div>
            ) : (
              dashboard.upcomingStages.map((stage, index) => (
                <div key={index} className="border-l-2 border-border pl-4 py-2 hover:bg-muted/50 rounded-r transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium flex-1 min-w-0">{stage.jobTitle}</p>
                    <Badge variant="secondary" className="text-xs">
                      {stage.stageName}
                    </Badge>
                  </div>
                  {stage.scheduleTime && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(stage.scheduleTime).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Công Việc Yêu Thích ({dashboard.totalSavedJobs})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/saved-jobs")}>
              Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : dashboard.recentSavedJobs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Chưa lưu công việc nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.recentSavedJobs.map((job) => (
                <div key={job.jobId} className="border-l-2 border-border pl-4 py-3 bg-muted/50 rounded hover:bg-muted transition-colors">
                  <div className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{job.jobTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">Lưu: {formatDate(job.savedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
