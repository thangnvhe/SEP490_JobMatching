import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    XCircle,
    Loader2,
    MessageSquare,
    Calendar,
    Clock,
    MapPin,
    Video,
    Mail,
    Phone,
    FileText,
    User,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { BaseResponse } from "@/models/base";

// Zod schema for form validation
const updateResultFormSchema = z.object({
    result: z.enum(["Pass", "Fail"], {
        required_error: "Vui lòng chọn kết quả",
    }),
    hiringManagerFeedback: z
        .string()
        .min(1, "Vui lòng nhập nhận xét")
        .max(1000, "Nhận xét không được quá 1000 ký tự"),
});

type UpdateResultFormData = z.infer<typeof updateResultFormSchema>;

// Status badge mapping
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    "Pending": { label: "Chờ phỏng vấn", variant: "secondary" },
    "Pass": { label: "Đạt", variant: "default" },
    "Fail": { label: "Không đạt", variant: "destructive" },
    "Scheduled": { label: "Đã lên lịch", variant: "outline" },
};

interface InterviewScheduleDetailDialogProps {
    candidate: CandidateStage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateSuccess?: () => void;
    onCancel?: () => void;
}

export function InterviewScheduleDetailDialog({
    candidate,
    open,
    onOpenChange,
    onUpdateSuccess,
    onCancel,
}: InterviewScheduleDetailDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<UpdateResultFormData>({
        resolver: zodResolver(updateResultFormSchema),
        defaultValues: {
            result: undefined,
            hiringManagerFeedback: "",
        },
    });

    const selectedResult = watch("result");

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset({
                result: undefined,
                hiringManagerFeedback: "",
            });
            onCancel?.();
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (data: UpdateResultFormData) => {
        if (!candidate) return;

        try {
            setIsLoading(true);

            const response = await CandidateStageServices.updateCandidateStageResult(
                candidate.id,
                data.result,
                data.hiringManagerFeedback.trim(),
            );

            if (!response.isSuccess) {
                reset();
                onOpenChange(false);
                onCancel?.();
                const errorMessage = response.errorMessages?.join(", ") || "Có lỗi xảy ra khi cập nhật kết quả";
                toast.error(errorMessage);
                return;
            }

            toast.success(
                data.result === "Pass"
                    ? "Ứng viên đã đạt vòng này!"
                    : "Đã cập nhật kết quả ứng viên"
            );

            reset();
            onOpenChange(false);
            onUpdateSuccess?.();
        } catch (error) {
            reset();
            onOpenChange(false);
            onCancel?.();
            let errorMessage = "Có lỗi xảy ra khi cập nhật kết quả. Vui lòng thử lại!";
            if (error instanceof AxiosError && error.response?.data) {
                const errorData = error.response.data as BaseResponse<any>;
                if (errorData.errorMessages && errorData.errorMessages.length > 0) {
                    errorMessage = errorData.errorMessages.join(", ");
                }
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Format date helper
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "Chưa có";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format time helper
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        return timeStr.substring(0, 5); // HH:mm
    };

    if (!candidate) return null;

    const user = candidate.user;
    const cv = candidate.cv;
    const status = statusConfig[candidate.status] || { label: candidate.status, variant: "outline" as const };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Chi tiết buổi phỏng vấn
                    </DialogTitle>
                </DialogHeader>

                {/* Candidate Info Section */}
                <div className="space-y-4">
                    {/* Header with Avatar and Basic Info */}
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <Avatar className="h-16 w-16 border-2 border-background shadow">
                            <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || ""} />
                            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                                {user?.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold truncate">
                                    {user?.fullName || "Không có tên"}
                                </h3>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                {user?.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" />
                                        {user.email}
                                    </span>
                                )}
                                {user?.phoneNumber && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {user.phoneNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Interview Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Date & Time */}
                        <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Thời gian phỏng vấn
                            </h4>
                            <div className="pl-6 space-y-1">
                                <p className="text-sm">
                                    {formatDate(candidate.interviewDate)}
                                </p>
                                {(candidate.interviewStartTime || candidate.interviewEndTime) && (
                                    <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(candidate.interviewStartTime)}
                                        {candidate.interviewEndTime && ` - ${formatTime(candidate.interviewEndTime)}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Địa điểm
                            </h4>
                            <div className="pl-6">
                                <p className="text-sm">
                                    {candidate.interviewLocation || "Chưa có thông tin"}
                                </p>
                            </div>
                        </div>

                        {/* Google Meet Link */}
                        {candidate.googleMeetLink && (
                            <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2 text-sm">
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    Google Meet
                                </h4>
                                <div className="pl-6">
                                    <a
                                        href={candidate.googleMeetLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                        Tham gia cuộc họp
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* CV */}
                        {cv && (
                            <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    CV ứng viên
                                </h4>
                                <div className="pl-6">
                                    {cv.fileUrl ? (
                                        <a
                                            href={cv.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline flex items-center gap-1"
                                        >
                                            {cv.name || "Xem CV"}
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {cv.name || "Chưa có CV"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional User Info */}
                        {user?.address && (
                            <div className="space-y-3 sm:col-span-2">
                                <h4 className="font-medium flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Địa chỉ ứng viên
                                </h4>
                                <div className="pl-6">
                                    <p className="text-sm">{user.address}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Previous Feedback */}
                    {candidate.hiringManagerFeedback && (
                        <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                Nhận xét trước đó
                            </h4>
                            <div className="pl-6 p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">
                                    {candidate.hiringManagerFeedback}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="my-4" />

                {/* Update Result Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <h4 className="font-semibold text-base">Cập nhật kết quả phỏng vấn</h4>

                    {/* Result Selection */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            Kết quả <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                            value={selectedResult ?? ""}
                            onValueChange={(value) =>
                                setValue("result", value as "Pass" | "Fail", { shouldValidate: true })
                            }
                            className="grid grid-cols-2 gap-4"
                        >
                            <Label
                                htmlFor="result-pass"
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                                    selectedResult === "Pass"
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                                        : "border-border hover:border-emerald-300"
                                )}
                            >
                                <RadioGroupItem
                                    value="Pass"
                                    id="result-pass"
                                    className="sr-only"
                                />
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full",
                                    selectedResult === "Pass"
                                        ? "bg-emerald-500 text-white"
                                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50"
                                )}>
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className={cn(
                                        "font-semibold block",
                                        selectedResult === "Pass" && "text-emerald-700 dark:text-emerald-400"
                                    )}>
                                        Pass
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Ứng viên đạt yêu cầu
                                    </span>
                                </div>
                            </Label>

                            <Label
                                htmlFor="result-fail"
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    "hover:bg-rose-50 dark:hover:bg-rose-950/30",
                                    selectedResult === "Fail"
                                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30"
                                        : "border-border hover:border-rose-300"
                                )}
                            >
                                <RadioGroupItem
                                    value="Fail"
                                    id="result-fail"
                                    className="sr-only"
                                />
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full",
                                    selectedResult === "Fail"
                                        ? "bg-rose-500 text-white"
                                        : "bg-rose-100 text-rose-600 dark:bg-rose-900/50"
                                )}>
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className={cn(
                                        "font-semibold block",
                                        selectedResult === "Fail" && "text-rose-700 dark:text-rose-400"
                                    )}>
                                        Fail
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Không đạt yêu cầu
                                    </span>
                                </div>
                            </Label>
                        </RadioGroup>
                        {errors.result && (
                            <p className="text-xs text-destructive">
                                {errors.result.message}
                            </p>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <Label htmlFor="hiringManagerFeedback" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Nhận xét của Hiring Manager <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="hiringManagerFeedback"
                            {...register("hiringManagerFeedback")}
                            placeholder="Nhập nhận xét, đánh giá về ứng viên..."
                            rows={4}
                            maxLength={1000}
                            className={cn(
                                "resize-none",
                                errors.hiringManagerFeedback && "border-destructive"
                            )}
                        />
                        {errors.hiringManagerFeedback ? (
                            <p className="text-xs text-destructive">
                                {errors.hiringManagerFeedback.message}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Mô tả lý do đánh giá, điểm mạnh/yếu của ứng viên
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Đóng
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                selectedResult === "Pass" && "bg-emerald-600 hover:bg-emerald-700",
                                selectedResult === "Fail" && "bg-rose-600 hover:bg-rose-700"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    {selectedResult === "Pass" ? (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    ) : selectedResult === "Fail" ? (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    ) : null}
                                    Cập nhật kết quả
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

