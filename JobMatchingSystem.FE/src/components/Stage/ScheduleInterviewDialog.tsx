import { useState, useEffect } from "react";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, MapPin, Video, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { CandidateStageServices } from "@/services/candidate-stage.service";
import { CandidateStage } from "@/models/candidate-stage";
import { cn } from "@/lib/utils";

// Zod schema for form validation
const scheduleFormSchema = z.object({
    selectedDate: z.date({
        required_error: "Vui lòng chọn ngày phỏng vấn",
    }),
    startTime: z
        .string()
        .min(1, "Vui lòng chọn giờ bắt đầu")
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"),
    endTime: z
        .string()
        .min(1, "Vui lòng chọn giờ kết thúc")
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ"),
    interviewLocation: z
        .string()
        .max(200, "Địa điểm không được quá 200 ký tự")
        .optional()
        .or(z.literal("")),
    googleMeetLink: z
        .union([
            z.string().url("Link Google Meet không hợp lệ"),
            z.literal(""),
        ])
        .optional(),
})
    .refine((data) => {
        // Validate that end time is after start time
        if (data.startTime && data.endTime) {
            return data.endTime > data.startTime;
        }
        return true;
    }, {
        message: "Giờ kết thúc phải sau giờ bắt đầu",
        path: ["endTime"],
    })
    .refine((data) => {
        // Validate that at least one of interviewLocation or googleMeetLink is provided
        const hasLocation = data.interviewLocation?.trim() && data.interviewLocation.trim().length > 0;
        const hasMeetLink = data.googleMeetLink?.trim() && data.googleMeetLink.trim().length > 0;
        return hasLocation || hasMeetLink;
    }, {
        message: "Vui lòng nhập địa điểm phỏng vấn hoặc link Google Meet",
        path: ["interviewLocation"],
    });

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

// Helper to get current time as HH:mm string
const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

// Helper to get time 1 hour later as HH:mm string
const getOneHourLater = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

// Helper to format date as local timezone string (YYYY-MM-DD)
const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Helper to check if candidate has valid schedule
const hasValidSchedule = (candidate: CandidateStage | null): boolean => {
    if (!candidate) return false;
    
    const hasValidDate = !!(candidate.interviewDate && 
        candidate.interviewDate !== "0001-01-01" && 
        candidate.interviewDate.trim() !== "");
    
    const hasValidStartTime = !!(candidate.interviewStartTime && 
        candidate.interviewStartTime !== "00:00:00" && 
        candidate.interviewStartTime.trim() !== "");
    
    const hasValidEndTime = !!(candidate.interviewEndTime && 
        candidate.interviewEndTime !== "00:00:00" && 
        candidate.interviewEndTime.trim() !== "");
    
    return hasValidDate && hasValidStartTime && hasValidEndTime;
};

// Helper to parse time from HH:mm:ss to HH:mm
const parseTimeToHHmm = (timeStr: string): string => {
    if (!timeStr || timeStr === "00:00:00") return "";
    // Extract HH:mm from HH:mm:ss
    return timeStr.slice(0, 5);
};

// Helper to parse date string (YYYY-MM-DD) to Date object without timezone issues
const parseDateString = (dateStr: string): Date => {
    if (!dateStr || dateStr === "0001-01-01") return new Date();
    
    // Parse YYYY-MM-DD format
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month, day);
        }
    }
    
    return new Date();
};

interface ScheduleInterviewDialogProps {
    candidate: CandidateStage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScheduleSuccess?: (updatedCandidate: CandidateStage) => void;
}

export function ScheduleInterviewDialog({
    candidate,
    open,
    onOpenChange,
    onScheduleSuccess,
}: ScheduleInterviewDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            selectedDate: new Date(),
            startTime: getCurrentTime(),
            endTime: getOneHourLater(),
            interviewLocation: "",
            googleMeetLink: "",
        },
    });

    const selectedDate = watch("selectedDate");
    const startTime = watch("startTime");
    const endTime = watch("endTime");

    // Load existing schedule values when dialog opens
    useEffect(() => {
        if (open && candidate) {
            if (hasValidSchedule(candidate)) {
                // Load existing schedule values
                const existingDate = parseDateString(candidate.interviewDate);
                const existingStartTime = parseTimeToHHmm(candidate.interviewStartTime);
                const existingEndTime = parseTimeToHHmm(candidate.interviewEndTime);
                
                reset({
                    selectedDate: existingDate,
                    startTime: existingStartTime || getCurrentTime(),
                    endTime: existingEndTime || getOneHourLater(),
                    interviewLocation: candidate.interviewLocation || "",
                    googleMeetLink: candidate.googleMeetLink || "",
                });
            } else {
                // Use default values if no valid schedule exists
                reset({
                    selectedDate: new Date(),
                    startTime: getCurrentTime(),
                    endTime: getOneHourLater(),
                    interviewLocation: "",
                    googleMeetLink: "",
                });
            }
        }
    }, [open, candidate, reset]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Reset form when closing
            reset({
                selectedDate: new Date(),
                startTime: getCurrentTime(),
                endTime: getOneHourLater(),
                interviewLocation: "",
                googleMeetLink: "",
            });
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (data: ScheduleFormData) => {
        if (!candidate) return;

        const wasScheduled = hasValidSchedule(candidate);

        try {
            setIsLoading(true);

            // Format date as YYYY-MM-DD
            const interviewDate = formatDateToLocalString(data.selectedDate);
            // Format times as HH:mm:ss
            const interviewStartTime = `${data.startTime}:00`;
            const interviewEndTime = `${data.endTime}:00`;

            await CandidateStageServices.updateScheduleCandidateStage(
                candidate.id,
                interviewDate,
                interviewStartTime,
                interviewEndTime,
                data.interviewLocation?.trim() || "",
                data.googleMeetLink?.trim() || ""
            );

            // Fetch updated candidate data
            const response = await CandidateStageServices.getById(candidate.id);
            const updatedCandidate = response.result;

            toast.success(wasScheduled ? "Cập nhật lịch phỏng vấn thành công!" : "Đặt lịch phỏng vấn thành công!");
            handleOpenChange(false);

            if (updatedCandidate) {
                onScheduleSuccess?.(updatedCandidate);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.result || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    if (!candidate) return null;

    const user = candidate.user;
    const hasSchedule = hasValidSchedule(candidate);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {hasSchedule ? "Chỉnh sửa lịch phỏng vấn" : "Đặt lịch phỏng vấn"}
                    </DialogTitle>
                    <DialogDescription>
                        {hasSchedule ? "Chỉnh sửa" : "Đặt"} lịch phỏng vấn cho ứng viên{" "}
                        <span className="font-medium text-foreground">
                            {user?.fullName || "Không có tên"}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            Ngày phỏng vấn <span className="text-destructive">*</span>
                        </Label>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !selectedDate && "text-muted-foreground",
                                        errors.selectedDate && "border-destructive"
                                    )}
                                >
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString("vi-VN")
                                        : "Chọn ngày"}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setValue("selectedDate", date, { shouldValidate: true });
                                        }
                                        setDatePickerOpen(false);
                                    }}
                                    disabled={(date) =>
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.selectedDate && (
                            <p className="text-xs text-destructive">
                                {errors.selectedDate.message}
                            </p>
                        )}
                    </div>

                    {/* Time Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time Picker */}
                        <div className="space-y-2">
                            <Label htmlFor="start-time-picker" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Giờ bắt đầu <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="start-time-picker"
                                type="time"
                                value={startTime}
                                onChange={(e) =>
                                    setValue("startTime", e.target.value, { shouldValidate: true })
                                }
                                className={cn(
                                    "w-full",
                                    errors.startTime && "border-destructive"
                                )}
                            />
                            {errors.startTime && (
                                <p className="text-xs text-destructive">
                                    {errors.startTime.message}
                                </p>
                            )}
                        </div>

                        {/* End Time Picker */}
                        <div className="space-y-2">
                            <Label htmlFor="end-time-picker" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Giờ kết thúc <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="end-time-picker"
                                type="time"
                                value={endTime}
                                onChange={(e) =>
                                    setValue("endTime", e.target.value, { shouldValidate: true })
                                }
                                className={cn(
                                    "w-full",
                                    errors.endTime && "border-destructive"
                                )}
                            />
                            {errors.endTime && (
                                <p className="text-xs text-destructive">
                                    {errors.endTime.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Interview Location */}
                    <div className="space-y-2">
                        <Label htmlFor="interviewLocation" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Địa điểm phỏng vấn
                        </Label>
                        <Input
                            id="interviewLocation"
                            type="text"
                            {...register("interviewLocation")}
                            placeholder="VD: Phòng họp A, Tầng 5, Tòa nhà ABC"
                            maxLength={200}
                            className={cn(errors.interviewLocation && "border-destructive")}
                        />
                        {errors.interviewLocation && (
                            <p className="text-xs text-destructive">
                                {errors.interviewLocation.message}
                            </p>
                        )}
                    </div>

                    {/* Google Meet Link */}
                    <div className="space-y-2">
                        <Label htmlFor="googleMeetLink" className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            Link Google Meet
                        </Label>
                        <Input
                            id="googleMeetLink"
                            type="url"
                            {...register("googleMeetLink")}
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            className={cn(errors.googleMeetLink && "border-destructive")}
                        />
                        {errors.googleMeetLink ? (
                            <p className="text-xs text-destructive">
                                {errors.googleMeetLink.message}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Vui lòng nhập địa điểm phỏng vấn hoặc link Google Meet (ít nhất một trong hai)
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <CalendarIcon className="h-4 w-4 mr-2" />
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
