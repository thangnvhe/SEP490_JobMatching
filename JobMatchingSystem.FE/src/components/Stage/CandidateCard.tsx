import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { CandidateStage } from "@/models/candidate-stage";
import { GripVertical, Mail, Phone, Calendar, Eye, CalendarPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScheduleInterviewDialog } from "./ScheduleInterviewDialog";

interface CandidateCardProps {
  candidate: CandidateStage;
  isDragging?: boolean;
  isOverlay?: boolean;
  onViewDetail?: () => void;
  onCandidateUpdated?: (updatedCandidate: CandidateStage) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Schedule: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Passed: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  Failed: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300" },
  InProgress: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
};

export function CandidateCard({
  candidate,
  isDragging,
  isOverlay,
  onViewDetail,
  onCandidateUpdated,
}: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: candidate.id,
    data: {
      type: "item",
      item: candidate,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  if (isOverlay) {
    return (
      <div
        className={cn(
          "group relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-lg cursor-grabbing",
          "ring-2 ring-primary/30 scale-105"
        )}
      >
        <CandidateContent candidate={candidate} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm",
        "hover:shadow-md hover:border-primary/50 transition-all duration-200",
        dragging && "opacity-50 ring-2 ring-primary/30"
      )}
    >
      {/* Drag Handle */}
      <button
        className={cn(
          "absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
          "p-1 rounded hover:bg-muted transition-opacity cursor-grab active:cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <CandidateContent 
        candidate={candidate} 
        onViewDetail={onViewDetail} 
        onCandidateUpdated={onCandidateUpdated}
      />
    </div>
  );
}

function CandidateContent({
  candidate,
  onViewDetail,
  onCandidateUpdated,
}: {
  candidate: CandidateStage;
  onViewDetail?: () => void;
  onCandidateUpdated?: (updatedCandidate: CandidateStage) => void;
}) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  const user = candidate.user;
  const status = candidate.status || "Pending";
  const statusStyle = statusColors[status] || statusColors.Pending;

  // Get initials from fullName
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={user.avatarUrl || ""} alt={user?.fullName || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(user?.fullName || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {user?.fullName || "Unknown"}
            </h4>
            <span
              className={cn(
                "inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full mt-1",
                statusStyle.bg,
                statusStyle.text
              )}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5">
        {user?.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">{user.email}</span>
          </div>
        )}
        {user?.phoneNumber && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{user.phoneNumber}</span>
          </div>
        )}
      </div>

      {/* Interview Schedule */}
      {candidate.interviewDate && candidate.interviewDate !== "0001-01-01" && (
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">
            {new Date(candidate.interviewDate).toLocaleDateString("vi-VN")}
            {candidate.interviewStartTime && (
              <> • {candidate.interviewStartTime.slice(0, 5)}</>
            )}
            {candidate.interviewEndTime && (
              <> - {candidate.interviewEndTime.slice(0, 5)}</>
            )}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setScheduleDialogOpen(true);
          }}
        >
          <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
          Đặt lịch
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.();
          }}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Chi tiết
        </Button>
      </div>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        candidate={candidate}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onScheduleSuccess={onCandidateUpdated}
      />
    </>
  );
}

