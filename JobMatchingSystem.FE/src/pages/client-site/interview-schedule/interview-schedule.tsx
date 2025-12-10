import { CalendarApp } from "@/components/calendar/CalendarApp"
import type { CalendarEvent } from "@/components/calendar/calendar-types"
import { PaginationParamsInput } from "@/models/base";
import { CandidateStage } from "@/models/candidate-stage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { InterviewScheduleDetailDialog } from "./InterviewScheduleDetailDialog";
import { Loader2 } from "lucide-react";

// Màu sắc cho các trạng thái khác nhau
const statusColors: Record<string, string> = {
  "Pending": "#f59e0b",    // Vàng cam - chờ phỏng vấn
  "Pass": "#22c55e",       // Xanh lá - đã pass
  "Fail": "#ef4444",       // Đỏ - không đạt
  "Scheduled": "#3b82f6",  // Xanh dương - đã lên lịch
  "default": "#8b5cf6",    // Tím - mặc định
};

// Helper function để parse date và time thành Date object
const parseDateTime = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
};

export default function InterviewSchedule() {

  // local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateStages, setCandidateStages] = useState<CandidateStage[]>([]);
  const [paginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 100, // Lấy nhiều để hiển thị trên lịch
    search: '',
    sortBy: '',
    isDecending: false,
    status: 'Schedule',
  });

  // State cho UpdateResultDialog
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateStage | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CandidateStageServices.getAllCandidateStagesWithPaginationForHiringManager(params);
      setCandidateStages(response.result.items);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu buổi phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    getAllWithPagination(paginationInput);
  }, [getAllWithPagination, paginationInput]);

  // Convert candidateStages thành CalendarEvent[]
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return candidateStages
      .filter(stage => stage.interviewDate && stage.interviewStartTime)
      .map(stage => ({
        id: stage.id.toString(),
        title: `${stage.jobStageTitle} - ${stage.user?.fullName || 'Ứng viên'}`,
        start: parseDateTime(stage.interviewDate, stage.interviewStartTime),
        end: parseDateTime(stage.interviewDate, stage.interviewEndTime || stage.interviewStartTime),
        color: statusColors[stage.status] || statusColors.default,
      }));
  }, [candidateStages]);

  // Handler khi click vào event trên lịch
  const handleEventClick = useCallback((event: CalendarEvent) => {
    const candidate = candidateStages.find(c => c.id.toString() === event.id);
    if (candidate) {
      setSelectedCandidate(candidate);
      setIsUpdateDialogOpen(true);
    }
  }, [candidateStages]);

  // Handler khi update result thành công
  const handleUpdateSuccess = useCallback(() => {
    setSelectedCandidate(null);
    setIsUpdateDialogOpen(false);
    // Reload data
    getAllWithPagination(paginationInput);
  }, [getAllWithPagination, paginationInput]);

  // Handler khi cancel update
  const handleCancelUpdate = useCallback(() => {
    setSelectedCandidate(null);
  }, []);

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lịch Phỏng Vấn</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi các buổi phỏng vấn của bạn
        </p>
      </div>

      {loading && candidateStages.length === 0 ? (
        <div className="flex items-center justify-center h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải lịch phỏng vấn...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <CalendarApp
          events={calendarEvents}
          onEventClick={handleEventClick}
          readonly={true}
          className="w-full"
        />
      )}

      {/* Dialog chi tiết và cập nhật kết quả phỏng vấn */}
      <InterviewScheduleDetailDialog
        candidate={selectedCandidate}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdateSuccess={handleUpdateSuccess}
        onCancel={handleCancelUpdate}
      />
    </div>
  )
}