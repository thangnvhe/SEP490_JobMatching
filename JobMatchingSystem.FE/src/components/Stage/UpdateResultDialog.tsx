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
import { CheckCircle, XCircle, Loader2, ArrowRightLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { cn } from "@/lib/utilsCommon";
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

interface UpdateResultDialogProps {
    candidate: CandidateStage | null;
    toStageId: number | null;
    toStageName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateSuccess?: () => void;
    onCancel?: () => void;
}

export function UpdateResultDialog({
    candidate,
    toStageId,
    toStageName,
    open,
    onOpenChange,
    onUpdateSuccess,
    onCancel,
}: UpdateResultDialogProps) {
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
            // Reset form when closing
            reset({
                result: undefined,
                hiringManagerFeedback: "",
            });
            onCancel?.();
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (data: UpdateResultFormData) => {
        if (!candidate || !toStageId) return;

        try {
            setIsLoading(true);

            const response = await CandidateStageServices.updateCandidateStageResult(
                candidate.id,
                data.result,
                data.hiringManagerFeedback.trim(),
                toStageId
            );

            if (!response.isSuccess) {
                // Close popup and revert drag/drop position
                reset();
                onOpenChange(false);
                onCancel?.();
                console.log(response);

                // Show error messages
                const errorMessage = response.errorMessages?.join(", ") || "Có lỗi xảy ra khi cập nhật kết quả";
                toast.error(errorMessage);
                return;
            }

            // Success case
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

    if (!candidate) return null;

    const user = candidate.user;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                        Cập nhật kết quả ứng viên
                    </DialogTitle>
                    <DialogDescription>
                        Đánh giá kết quả cho ứng viên{" "}
                        <span className="font-medium text-foreground">
                            {user?.fullName || "Không có tên"}
                        </span>
                        {toStageName && (
                            <>
                                {" "}chuyển sang vòng{" "}
                                <span className="font-medium text-primary">
                                    {toStageName}
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {/* Result Selection */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            Kết quả <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                            value={selectedResult}
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
                            Hủy
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
                                    Xác nhận
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

