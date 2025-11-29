import { useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utilsCommon";
import { StageColumn as StageColumnType } from "./types";
import { CandidateStage } from "@/models/candidate-stage";
import { CandidateCard } from "./CandidateCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageColumnProps {
  column: StageColumnType;
  candidates: CandidateStage[];
  onViewDetail?: (candidate: CandidateStage) => void;
  onCandidateUpdated?: (updatedCandidate: CandidateStage) => void;
}

const columnColors: Record<string, string> = {
  blue: "border-t-blue-500",
  green: "border-t-emerald-500",
  yellow: "border-t-amber-500",
  red: "border-t-rose-500",
  purple: "border-t-violet-500",
  pink: "border-t-pink-500",
  orange: "border-t-orange-500",
  teal: "border-t-teal-500",
};

export function StageColumnContainer({
  column,
  candidates,
  onViewDetail,
  onCandidateUpdated,
}: StageColumnProps) {
  const candidateIds = useMemo(
    () => candidates.map((c) => c.id),
    [candidates]
  );

  // Setup droppable for the entire column
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl bg-muted/50 border border-border/50 w-[320px] min-w-[320px] min-h-full",
        "border-t-4 shadow-sm transition-all duration-200",
        column.color ? columnColors[column.color] : "border-t-slate-500",
        isOver && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {column.stageNumber}
          </span>
          <h3 className="font-semibold text-sm text-foreground">
            {column.title}
          </h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Column Content - entire area is droppable */}
      <div className="flex-1">
        <ScrollArea className="h-full max-h-[calc(100vh-280px)]">
          <div className="p-2 space-y-2 ">
            <SortableContext
              items={candidateIds}
              strategy={verticalListSortingStrategy}
            >
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onViewDetail={() => onViewDetail?.(candidate)}
                  onCandidateUpdated={onCandidateUpdated}
                />
              ))}
            </SortableContext>

            {/* Drop zone placeholder when empty or as bottom padding */}
            {candidates.length === 0 && (
              <div
                className={cn(
                  "h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg",
                  "flex items-center justify-center text-muted-foreground text-sm",
                  isOver && "border-primary/50 bg-primary/5"
                )}
              >
                Kéo thả ứng viên vào đây
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

