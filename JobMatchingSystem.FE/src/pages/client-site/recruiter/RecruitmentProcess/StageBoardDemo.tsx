import { useState, useEffect, useCallback } from "react";
import { StageBoard } from "./StageBoard";
import { StageColumn, mapToStageColumns } from "./types";
import { JobStageServices } from "@/services/job-stage.service";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { JobStage } from "@/models/job-stage";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StageBoardDemoProps {
  jobId?: number;
}

export function StageBoardDemo({ jobId = 655 }: StageBoardDemoProps) {
  // Khai báo local state
  const [columns, setColumns] = useState<StageColumn[]>([]);
  const [lastStageId, setLastStageId] = useState<number | undefined>(undefined);
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
              // Filter out candidates with "Failed" status
              // These will be shown in the screening list instead
              const filteredCandidates = candidatesResponse.result.filter(
                (candidate: CandidateStage) => candidate.status !== "Failed"
              );
              candidatesByStage.set(stage.id, filteredCandidates);
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

      // 4. Tìm stage cuối cùng (có stageNumber cao nhất)
      const lastStage = jobStages.reduce((max, stage) => 
        stage.stageNumber > max.stageNumber ? stage : max
      , jobStages[0]);
      
      console.log("📊 [StageBoardDemo] All job stages:", jobStages.map(s => ({ id: s.id, stageNumber: s.stageNumber, name: s.name })));
      console.log("🎯 [StageBoardDemo] Last stage ID (highest stageNumber):", lastStage?.id);
      
      setLastStageId(lastStage?.id);
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
          lastStageId={lastStageId}
          onColumnsChange={handleColumnsChange}
          onCandidateMoved={handleCandidateMoved}
          onRefreshData={fetchStagesAndCandidates}
        />
      )}
    </div>
  );
}
