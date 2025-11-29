import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  CollisionDetection,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { StageColumn, StageBoardProps } from "./types";
import { CandidateStage } from "@/models/candidate-stage";
import { StageColumnContainer } from "./StageColumn";
import { CandidateCard } from "./CandidateCard";
import { CandidateDetailDialog } from "./CandidateDetailDialog";
import { UpdateResultDialog } from "./UpdateResultDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Interface for pending move operation
interface PendingMoveOperation {
  candidate: CandidateStage;
  fromStageId: number;
  toStageId: number;
  toStageName: string;
  previousColumns: StageColumn[];
}

export function StageBoard({
  columns: initialColumns,
  onColumnsChange,
  onCandidateMoved,
  onCandidateUpdated,
  onRefreshData,
}: StageBoardProps) {
  const [columns, setColumns] = useState<StageColumn[]>(initialColumns);
  const [activeCandidate, setActiveCandidate] = useState<CandidateStage | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateStage | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // State for update result dialog
  const [updateResultDialogOpen, setUpdateResultDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMoveOperation | null>(null);
  
  // Track the original column state before drag
  const columnsBeforeDragRef = useRef<StageColumn[]>([]);

  // Sync local state when prop changes (e.g., after refresh)
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // Custom collision detection - prioritizes columns over items
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Step 1: Try pointerWithin first - most accurate when pointer is inside a droppable
      const pointerCollisions = pointerWithin(args);
      
      // Step 2: Filter to find column collisions (columns are our main drop targets)
      const columnCollisions = pointerCollisions.filter(
        (collision) => collision.data?.droppableContainer?.data?.current?.type === "column"
      );

      // If pointer is inside a column, return that column
      if (columnCollisions.length > 0) {
        return columnCollisions;
      }

      // Step 3: If pointer is inside an item (candidate card), return that
      const itemCollisions = pointerCollisions.filter(
        (collision) => collision.data?.droppableContainer?.data?.current?.type === "item"
      );
      if (itemCollisions.length > 0) {
        return itemCollisions;
      }

      // Step 4: Fallback - use rectIntersection for edge cases (pointer between columns)
      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) {
        // Prioritize column collisions from rectIntersection
        const rectColumnCollisions = rectCollisions.filter(
          (collision) => collision.data?.droppableContainer?.data?.current?.type === "column"
        );
        if (rectColumnCollisions.length > 0) {
          return rectColumnCollisions;
        }
        return rectCollisions;
      }

      // Step 5: Last resort - closestCenter for when pointer is completely outside
      return closestCenter(args);
    },
    []
  );

  // Handle candidate update (e.g., after scheduling)
  const handleCandidateUpdated = useCallback((updatedCandidate: CandidateStage) => {
    setColumns((prevColumns) => {
      return prevColumns.map((column) => ({
        ...column,
        candidates: column.candidates.map((candidate) =>
          candidate.id === updatedCandidate.id ? updatedCandidate : candidate
        ),
      }));
    });
    // Also notify parent if needed
    onCandidateUpdated?.(updatedCandidate);
  }, [onCandidateUpdated]);

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

  // Find column by its id
  const findColumnById = useCallback(
    (columnId: string): StageColumn | undefined => {
      return columns.find((col) => col.id === columnId);
    },
    [columns]
  );

  // Find column containing a candidate
  const findColumnByCandidateId = useCallback(
    (candidateId: number | string): StageColumn | undefined => {
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
      // Save the columns state before drag starts
      columnsBeforeDragRef.current = JSON.parse(JSON.stringify(columns));
    }
  };

  // Handle drag end - clean and simplified logic
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const draggedCandidate = activeCandidate;

    // Reset active state
    setActiveCandidate(null);

    // If no drop target, revert to original state
    if (!over) {
      setColumns(columnsBeforeDragRef.current);
      return;
    }

    const activeId = active.id as number;
    const overId = over.id;
    const overData = over.data.current;

    // Get source column from saved state (before any modifications)
    const fromColumn = columnsBeforeDragRef.current.find((col) =>
      col.candidates.some((c) => c.id === activeId)
    );

    if (!fromColumn || !draggedCandidate) {
      setColumns(columnsBeforeDragRef.current);
      return;
    }

    // Determine target column based on what we dropped on
    let targetColumnId: string | null = null;
    
    if (overData?.type === "column") {
      // Dropped directly on a column
      targetColumnId = overId as string;
    } else if (overData?.type === "item") {
      // Dropped on an item - find its parent column
      const parentColumn = findColumnByCandidateId(overId);
      targetColumnId = parentColumn?.id || null;
    } else {
      // Fallback: check if overId matches a column id
      const matchedColumn = findColumnById(overId as string);
      if (matchedColumn) {
        targetColumnId = matchedColumn.id;
      }
    }
    
    if (!targetColumnId) {
      setColumns(columnsBeforeDragRef.current);
      return;
    }

    const toColumn = findColumnById(targetColumnId);
    
    if (!toColumn) {
      setColumns(columnsBeforeDragRef.current);
      return;
    }

    // Same column - handle reorder within column
    if (fromColumn.id === toColumn.id) {
      if (overData?.type === "item" && overId !== activeId) {
        setColumns((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id !== fromColumn.id) return column;

            const activeIndex = column.candidates.findIndex((c) => c.id === activeId);
            const overIndex = column.candidates.findIndex((c) => c.id === overId);

            if (activeIndex === -1 || overIndex === -1) return column;

            return {
              ...column,
              candidates: arrayMove(column.candidates, activeIndex, overIndex),
            };
          });
        });
      }
      return;
    }

    // Different column - move candidate to new column
    const updatedColumns = columnsBeforeDragRef.current.map((column) => {
      // Remove from source column
      if (column.id === fromColumn.id) {
        return {
          ...column,
          candidates: column.candidates.filter((c) => c.id !== activeId),
        };
      }

      // Add to target column
      if (column.id === toColumn.id) {
        // Determine insert position
        let insertIndex = column.candidates.length;
        
        if (overData?.type === "item") {
          const overIndex = column.candidates.findIndex((c) => c.id === overId);
          if (overIndex !== -1) {
            insertIndex = overIndex;
          }
        }

        const newCandidates = [...column.candidates];
        newCandidates.splice(insertIndex, 0, draggedCandidate);
        
        return {
          ...column,
          candidates: newCandidates,
        };
      }

      return column;
    });

    // Update state with new columns
    setColumns(updatedColumns);

    // Show update result dialog for stage change
    if (fromColumn.stageId !== toColumn.stageId) {
      setPendingMove({
        candidate: draggedCandidate,
        fromStageId: fromColumn.stageId,
        toStageId: toColumn.stageId,
        toStageName: toColumn.title,
        previousColumns: columnsBeforeDragRef.current,
      });
      setUpdateResultDialogOpen(true);
    } else {
      onColumnsChange?.(updatedColumns);
    }
  };

  // Handle update result success
  const handleUpdateResultSuccess = () => {
    if (pendingMove) {
      // Notify parent about the move
      onCandidateMoved?.(
        pendingMove.candidate.id,
        pendingMove.fromStageId,
        pendingMove.toStageId
      );
    }
    
    // Clear pending move
    setPendingMove(null);
    
    // Refresh data from API
    onRefreshData?.();
  };

  // Handle update result cancel - revert to original state
  const handleUpdateResultCancel = () => {
    if (pendingMove) {
      // Revert to original columns state
      setColumns(pendingMove.previousColumns);
    }
    setPendingMove(null);
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
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="h-full w-full">
          <div className="flex gap-4 p-4 min-h-full">
            {columns.map((column) => (
              <StageColumnContainer
                key={column.id}
                column={column}
                candidates={column.candidates}
                onViewDetail={handleViewDetail}
                onCandidateUpdated={handleCandidateUpdated}
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

      {/* Update Result Dialog - shown when moving candidate to different stage */}
      <UpdateResultDialog
        candidate={pendingMove?.candidate || null}
        toStageId={pendingMove?.toStageId || null}
        toStageName={pendingMove?.toStageName}
        open={updateResultDialogOpen}
        onOpenChange={setUpdateResultDialogOpen}
        onUpdateSuccess={handleUpdateResultSuccess}
        onCancel={handleUpdateResultCancel}
      />
    </div>
  );
}

