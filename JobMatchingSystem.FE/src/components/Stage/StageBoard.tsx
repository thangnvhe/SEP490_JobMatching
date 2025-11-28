import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { StageColumn, StageBoardProps } from "./types";
import { CandidateStage } from "@/models/candidate-stage";
import { StageColumnContainer } from "./StageColumn";
import { CandidateCard } from "./CandidateCard";
import { CandidateDetailDialog } from "./CandidateDetailDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function StageBoard({
  columns: initialColumns,
  onColumnsChange,
  onCandidateMoved,
}: StageBoardProps) {
  const [columns, setColumns] = useState<StageColumn[]>(initialColumns);
  const [activeCandidate, setActiveCandidate] = useState<CandidateStage | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateStage | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find column containing a candidate
  const findColumnByCandidateId = useCallback(
    (candidateId: UniqueIdentifier): StageColumn | undefined => {
      return columns.find((column) =>
        column.candidates.some((c) => c.id === candidateId)
      );
    },
    [columns]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "item") {
      setActiveCandidate(activeData.item);
    }
  };

  // Handle drag over (when candidate hovers over another container)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== "item") return;

    const activeColumn = findColumnByCandidateId(activeId);
    let overColumnId: string | undefined;

    // Determine if we're hovering over a column or a candidate
    if (overData?.type === "column") {
      overColumnId = overId as string;
    } else if (overData?.type === "item") {
      const overColumn = findColumnByCandidateId(overId);
      overColumnId = overColumn?.id;
    }

    if (!activeColumn || !overColumnId) return;

    // If moving to a different column
    if (activeColumn.id !== overColumnId) {
      setColumns((prevColumns) => {
        const sourceColumn = prevColumns.find(
          (col) => col.id === activeColumn.id
        );
        const destColumn = prevColumns.find((col) => col.id === overColumnId);

        if (!sourceColumn || !destColumn) return prevColumns;

        const activeCandidateIndex = sourceColumn.candidates.findIndex(
          (c) => c.id === activeId
        );
        const activeCandidateData = sourceColumn.candidates[activeCandidateIndex];

        if (!activeCandidateData) return prevColumns;

        // Find the position to insert
        let newIndex = destColumn.candidates.length;

        if (overData?.type === "item") {
          const overCandidateIndex = destColumn.candidates.findIndex(
            (c) => c.id === overId
          );
          if (overCandidateIndex >= 0) {
            newIndex = overCandidateIndex;
          }
        }

        // Create new columns with candidate moved
        return prevColumns.map((column) => {
          if (column.id === activeColumn.id) {
            return {
              ...column,
              candidates: column.candidates.filter((c) => c.id !== activeId),
            };
          }
          if (column.id === overColumnId) {
            const newCandidates = [...column.candidates];
            newCandidates.splice(newIndex, 0, activeCandidateData);
            return {
              ...column,
              candidates: newCandidates,
            };
          }
          return column;
        });
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const draggedCandidate = activeCandidate;
    const fromColumn = findColumnByCandidateId(active.id);

    setActiveCandidate(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const overData = over.data.current;

    // If dropped on same column, reorder candidates
    if (overData?.type === "item") {
      const activeColumn = findColumnByCandidateId(activeId);
      const overColumn = findColumnByCandidateId(overId);

      if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
        setColumns((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id !== activeColumn.id) return column;

            const activeIndex = column.candidates.findIndex(
              (c) => c.id === activeId
            );
            const overIndex = column.candidates.findIndex(
              (c) => c.id === overId
            );

            return {
              ...column,
              candidates: arrayMove(column.candidates, activeIndex, overIndex),
            };
          });
        });
      }
    }

    // Notify parent of changes
    onColumnsChange?.(columns);

    // Notify if candidate moved to different stage
    const toColumn = columns.find((col) =>
      col.candidates.some((c) => c.id === activeId)
    );

    if (
      draggedCandidate &&
      fromColumn &&
      toColumn &&
      fromColumn.stageId !== toColumn.stageId
    ) {
      onCandidateMoved?.(
        draggedCandidate.id,
        fromColumn.stageId,
        toColumn.stageId
      );
    }
  };

  // Handle view detail
  const handleViewDetail = (candidate: CandidateStage) => {
    setSelectedCandidate(candidate);
    setDetailDialogOpen(true);
  };

  return (
    <div className="h-full w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="h-full w-full">
          <div className="flex gap-4 p-6 min-h-full">
            {columns.map((column) => (
              <StageColumnContainer
                key={column.id}
                column={column}
                candidates={column.candidates}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Drag Overlay - renders the dragged candidate */}
        {createPortal(
          <DragOverlay dropAnimation={null}>
            {activeCandidate && (
              <CandidateCard candidate={activeCandidate} isOverlay />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}

