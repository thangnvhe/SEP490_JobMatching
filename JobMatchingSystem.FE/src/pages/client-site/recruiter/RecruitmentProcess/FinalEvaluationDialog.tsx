import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle, Loader2, Award, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { BaseResponse } from "@/models/base";

// Helper function để parse date và time thành Date object
const parseDateTime = (dateStr: string, timeStr: string): Date => {
    const date = new Date(dateStr);
    if (timeStr) {
        const timeParts = timeStr.split(':').map(Number);
        const hours = timeParts[0] || 0;
        const minutes = timeParts[1] || 0;
        date.setHours(hours, minutes, 0, 0);
    }
    return date;
};

// Helper function để kiểm tra xem thời gian phỏng vấn đã đến chưa
const isInterviewTimePassed = (candidate: CandidateStage): boolean => {
    // Nếu không có interviewDate hoặc interviewStartTime, cho phép update
    if (!candidate.interviewDate || !candidate.interviewStartTime) {
        return true;
    }

    // Kiểm tra giá trị mặc định (có thể là "0001-01-01" hoặc "00:00:00")
    if (
        candidate.interviewDate === "0001-01-01" ||
        candidate.interviewStartTime === "00:00:00" ||
        !candidate.interviewDate.trim() ||
        !candidate.interviewStartTime.trim()
    ) {
        return true;
    }

    try {
        const interviewDateTime = parseDateTime(candidate.interviewDate, candidate.interviewStartTime);
        const now = new Date();
        
        // So sánh: thời gian hiện tại phải >= thời gian phỏng vấn
        return now >= interviewDateTime;
    } catch (error) {
        // Nếu có lỗi khi parse, cho phép update (fallback)
        console.error("Error parsing interview date/time:", error);
        return true;
    }
};

// Zod schema for form validation
const finalEvaluationFormSchema = z.object({
    result: z.enum(["Pass", "Fail"], {
        required_error: "Vui lòng chọn kết quả",
    }),
    hiringManagerFeedback: z
        .string()
        .min(1, "Vui lòng nhập nhận xét")
        .max(1000, "Nhận xét không được quá 1000 ký tự"),
});

type FinalEvaluationFormData = z.infer<typeof finalEvaluationFormSchema>;

interface FinalEvaluationDialogProps {
    candidate: CandidateStage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEvaluationSuccess?: (updatedCandidate: CandidateStage) => void;
}

/**
 * Dialog đánh giá cuối cùng cho ứng viên ở vòng cuối
 * Gọi API PUT /api/CandidateStage/{id}/result với result và hiringManagerFeedback
 * KHÔNG truyền jobStageId vì đây là đánh giá cuối cùng
 */
export function FinalEvaluationDialog({
    candidate,
    open,
    onOpenChange,
    onEvaluationSuccess,
}: FinalEvaluationDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FinalEvaluationFormData>({
        resolver: zodResolver(finalEvaluationFormSchema),
        defaultValues: {
            result: undefined,
            hiringManagerFeedback: "",
        },
    });

    const selectedResult = watch("result");

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset form when closing
            reset({
                result: undefined,
                hiringManagerFeedback: "",
            });
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (data: FinalEvaluationFormData) => {
        if (!candidate) return;

        // Kiểm tra thời gian phỏng vấn
        if (!isInterviewTimePassed(candidate)) {
            const interviewDate = candidate.interviewDate 
                ? new Date(candidate.interviewDate).toLocaleDateString('vi-VN')
                : '';
            const interviewTime = candidate.interviewStartTime 
                ? candidate.interviewStartTime.slice(0, 5)
                : '';
            
            toast.error(
                `Chưa đến thời gian phỏng vấn. Vui lòng đợi đến ${interviewDate} ${interviewTime} mới có thể cập nhật kết quả.`
            );
            return;
        }

        try {
            setIsLoading(true);

            // Gọi API với result và hiringManagerFeedback, KHÔNG truyền jobStageId
            // Vì đây là đánh giá cuối cùng
            const response = await CandidateStageServices.updateCandidateStageResult(
                candidate.id,
                data.result,
                data.hiringManagerFeedback.trim()
                // Không truyền jobStageId - tham số thứ 4 undefined
            );

            if (!response.isSuccess) {
                // Show error messages
                const errorMessage = response.errorMessages?.join(", ") || "Có lỗi xảy ra khi cập nhật kết quả";
                toast.error(errorMessage);
                return;
            }

            // Success case
            toast.success(
                data.result === "Pass"
                    ? "Chúc mừng! Ứng viên đã đạt và hoàn thành quy trình tuyển dụng!"
                    : "Đã cập nhật kết quả cuối cùng cho ứng viên"
            );

            // Fetch updated candidate data
            const updatedResponse = await CandidateStageServices.getById(candidate.id);
            const updatedCandidate = updatedResponse.result;

            reset();
            onOpenChange(false);
            
            if (updatedCandidate) {
                onEvaluationSuccess?.(updatedCandidate);
            }
        } catch (error) {
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

    if (!candidate) return null;

    const user = candidate.user;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Đánh giá cuối cùng
                    </DialogTitle>
                    <DialogDescription>
                        Đánh giá kết quả cuối cùng cho ứng viên{" "}
                        <span className="font-medium text-foreground">
                            {user?.fullName || "Không có tên"}
                        </span>{" "}
                        ở vòng phỏng vấn cuối cùng
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {/* Warning nếu chưa đến thời gian phỏng vấn */}
                    {candidate && !isInterviewTimePassed(candidate) && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                    Chưa đến thời gian phỏng vấn
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    {candidate.interviewDate && candidate.interviewStartTime && (
                                        <>
                                            Chỉ có thể cập nhật kết quả sau thời điểm phỏng vấn:{" "}
                                            <span className="font-semibold">
                                                {new Date(candidate.interviewDate).toLocaleDateString('vi-VN')}{" "}
                                                {candidate.interviewStartTime.slice(0, 5)}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Đánh giá vòng cuối cùng
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Đây là vòng phỏng vấn cuối cùng. Nếu ứng viên Pass, họ sẽ hoàn thành quy trình tuyển dụng.
                            </p>
                        </div>
                    </div>

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
                                htmlFor="final-result-pass"
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
                                    id="final-result-pass"
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
                                        Hoàn thành tuyển dụng
                                    </span>
                                </div>
                            </Label>

                            <Label
                                htmlFor="final-result-fail"
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
                                    id="final-result-fail"
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
                            placeholder="Nhập nhận xét, đánh giá tổng quan về ứng viên sau toàn bộ quy trình..."
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
                                Mô tả đánh giá tổng quan, điểm mạnh/yếu của ứng viên
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
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || (candidate && !isInterviewTimePassed(candidate))}
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
                                    ) : (
                                        <Award className="h-4 w-4 mr-2" />
                                    )}
                                    Xác nhận đánh giá
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

