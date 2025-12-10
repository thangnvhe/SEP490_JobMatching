import { useState, useEffect, useCallback } from "react";
import { StageBoard } from "./StageBoard";
import { StageColumn, mapToStageColumns } from "./types";
import { JobStageServices } from "@/services/job-stage.service";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { JobStage } from "@/models/job-stage";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StageBoardDemoProps {
  jobId?: number;
}

export function StageBoardDemo({ jobId = 655 }: StageBoardDemoProps) {
  // Khai báo local state
  const [columns, setColumns] = useState<StageColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stages và candidates
  const fetchStagesAndCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stagesResponse = await JobStageServices.getJobStagesByJobId(jobId);
      if (!stagesResponse.isSuccess || !stagesResponse.result) {
        throw new Error("Không thể tải danh sách vòng tuyển dụng");
      }
      const jobStages = stagesResponse.result;

      // 2. Fetch candidates for each stage
      const candidatesByStage = new Map<number, CandidateStage[]>();

      await Promise.all(
        jobStages.map(async (stage: JobStage) => {
          try {
            const candidatesResponse =
              await CandidateStageServices.getCandidatesByJobStageId(
                stage.id,
                "", // status - empty for all
                "id", // sortBy
                "false" // isDescending
              );

            if (candidatesResponse.isSuccess && candidatesResponse.result) {
              candidatesByStage.set(stage.id, candidatesResponse.result);
            } else {
              candidatesByStage.set(stage.id, []);
            }
          } catch {
            candidatesByStage.set(stage.id, []);
          }
        })
      );

      // 3. Map to StageColumn[]
      const stageColumns = mapToStageColumns(jobStages, candidatesByStage);
      setColumns(stageColumns);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStagesAndCandidates();
  }, [fetchStagesAndCandidates]);

  // Handler functions
  const handleRefresh = () => {
    fetchStagesAndCandidates();
  };

  const handleColumnsChange = (newColumns: StageColumn[]) => {
    setColumns(newColumns);
  };

  const handleCandidateMoved = async (
    candidateId: number,
    fromStageId: number,
    toStageId: number
  ) => {
    console.log(
      `Candidate ${candidateId} moved from stage ${fromStageId} to stage ${toStageId}`
    );
    // TODO: Call API to update candidate stage
    // Example: await CandidateStageServices.updateCandidateStage(candidateId, toStageId);
  };

  return (
    <div className="h-[calc(100vh-100px)] w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 ">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Quy trình tuyển dụng
          </h1>
          <p className="text-muted-foreground">
            Kéo thả ứng viên giữa các vòng để cập nhật trạng thái
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="icon"
          aria-label="Làm mới"
          title="Làm mới dữ liệu"
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Content */}
      {loading && !columns.length ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Đang tải quy trình tuyển dụng...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Thử lại
          </Button>
        </div>
      ) : columns.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            Chưa có vòng tuyển dụng nào được thiết lập cho công việc này
          </p>
        </div>
      ) : (
        <StageBoard
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onCandidateMoved={handleCandidateMoved}
          onRefreshData={fetchStagesAndCandidates}
        />
      )}
    </div>
  );
}
