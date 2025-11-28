import type { CandidateStage } from "@/models/candidate-stage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Link2,
  MessageSquare,
  User,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utilsCommon";
import { getImageUrl } from "@/lib/utilsCommon";

interface CandidateDetailDialogProps {
  candidate: CandidateStage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Schedule: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  Pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  Passed: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Failed: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  InProgress: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
};

export function CandidateDetailDialog({
  candidate,
  open,
  onOpenChange,
}: CandidateDetailDialogProps) {
  if (!candidate) return null;

  const user = candidate.user;
  const cv = candidate.cv;
  const status = candidate.status || "Pending";
  const statusStyle = statusColors[status] || statusColors.Pending;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return null;
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết ứng viên</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border">
            <Avatar className="h-16 w-16 border-2">
              <AvatarImage src={getImageUrl(user?.avatarUrl)} alt={user?.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(user?.fullName || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {user?.fullName || "Không có tên"}
              </h3>
              <Badge
                className={cn(
                  "mt-1.5 border",
                  statusStyle.bg,
                  statusStyle.text,
                  statusStyle.border
                )}
              >
                {status}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Vòng: <span className="font-medium">{candidate.jobStageTitle}</span>
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user?.email && (
                <InfoItem icon={Mail} label="Email" value={user.email} />
              )}
              {user?.phoneNumber && (
                <InfoItem icon={Phone} label="Số điện thoại" value={user.phoneNumber} />
              )}
              {user?.address && (
                <InfoItem icon={MapPin} label="Địa chỉ" value={user.address} />
              )}
              {formatDate(user?.birthday ?? null) && (
                <InfoItem
                  icon={Calendar}
                  label="Ngày sinh"
                  value={formatDate(user?.birthday ?? null) || ""}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin lịch hẹn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.scheduleTime && (
                <InfoItem
                  icon={Calendar}
                  label="Thời gian"
                  value={formatDateTime(candidate.scheduleTime) || "Chưa có"}
                />
              )}
              {candidate.interviewLocation && (
                <InfoItem
                  icon={MapPin}
                  label="Địa điểm phỏng vấn"
                  value={candidate.interviewLocation}
                />
              )}
              {candidate.googleMeetLink && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Link2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Google Meet</p>
                    <a
                      href={candidate.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Tham gia cuộc họp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            {!candidate.scheduleTime &&
              !candidate.interviewLocation &&
              !candidate.googleMeetLink && (
                <p className="text-sm text-muted-foreground italic">
                  Chưa có lịch hẹn
                </p>
              )}
          </div>

          <Separator />

          {/* CV Information */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Hồ sơ ứng tuyển
            </h4>
            {cv ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cv.name || "CV"}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {cv.id}
                    </p>
                  </div>
                </div>
                {cv.fileUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={getImageUrl(cv.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Xem CV
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Không có CV
              </p>
            )}
          </div>

          {/* Feedback */}
          {candidate.hiringManagerFeedback && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Phản hồi từ Hiring Manager
                </h4>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {candidate.hiringManagerFeedback}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

