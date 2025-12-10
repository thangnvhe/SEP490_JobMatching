import { CandidateStage } from "@/models/candidate-stage";
import { JobStage } from "@/models/job-stage";

// Types for Recruitment Stage Board
export interface StageColumn {
  id: string;
  stageId: number;
  title: string;
  stageNumber: number;
  candidates: CandidateStage[];
  color?: string;
}

export interface StageBoardProps {
  columns: StageColumn[];
  onColumnsChange?: (columns: StageColumn[]) => void;
  onCandidateMoved?: (
    candidateId: number,
    fromStageId: number,
    toStageId: number
  ) => void;
  onCandidateUpdated?: (updatedCandidate: CandidateStage) => void;
  onRefreshData?: () => void;
}

// Helper to convert JobStage[] and CandidateStage[] to StageColumn[]
export function mapToStageColumns(
  jobStages: JobStage[],
  candidatesByStage: Map<number, CandidateStage[]>
): StageColumn[] {
  const stageColors = ["blue", "yellow", "purple", "green", "orange", "teal", "pink", "red"];

  return jobStages
    .sort((a, b) => a.stageNumber - b.stageNumber)
    .map((stage, index) => ({
      id: `stage-${stage.id}`,
      stageId: stage.id,
      title: stage.name,
      stageNumber: stage.stageNumber,
      candidates: candidatesByStage.get(stage.id) || [],
      color: stageColors[index % stageColors.length],
    }));
}
