import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Ban, FileWarning, ShieldAlert, HelpCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { ReportCreateInput, ReportTypes } from "@/models/report";
import { cn } from "@/lib/utilsCommon";

type ReportTypeKey = keyof typeof ReportTypes;

const REPORT_TYPE_CONFIG: Record<ReportTypeKey, { label: string; description: string; icon: typeof Ban }> = {
  Spam: {
    label: "Spam",
    description: "Tin tuyển dụng spam hoặc không mong muốn",
    icon: Ban,
  },
  InappropriateContent: {
    label: "Nội dung không phù hợp",
    description: "Nội dung vi phạm quy định cộng đồng",
    icon: FileWarning,
  },
  FraudulentJobPosting: {
    label: "Tin tuyển dụng lừa đảo",
    description: "Tin tuyển dụng có dấu hiệu lừa đảo",
    icon: ShieldAlert,
  },
  Other: {
    label: "Khác",
    description: "Các vấn đề khác",
    icon: HelpCircle,
  },
};

const reportTypeKeys = Object.keys(ReportTypes) as ReportTypeKey[];
const validSubjectValues = Object.values(ReportTypes) as number[];

const reportSchema = z.object({
  subject: z.number().refine((val) => validSubjectValues.includes(val), {
    message: "Vui lòng chọn loại báo cáo",
  }),
  reason: z
    .string()
    .min(1, { message: "Lý do báo cáo là bắt buộc" })
    .min(10, { message: "Lý do báo cáo phải có ít nhất 10 ký tự" })
    .max(1000, { message: "Lý do báo cáo không được quá 1000 ký tự" }),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: number;
  jobTitle: string;
  onSubmitReport: (reportData: ReportCreateInput) => Promise<void>;
}

export function ReportJobDialog({
  isOpen,
  onOpenChange,
  jobId,
  jobTitle,
  onSubmitReport
}: ReportJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      subject: undefined,
      reason: "",
    },
  });

  const selectedSubject = watch("subject");

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsLoading(true);

      await onSubmitReport({
        jobId,
        subject: data.subject,
        reason: data.reason.trim(),
      });

      toast.success("Báo cáo đã được gửi thành công!");
      handleOpenChange(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="p-6 ">
          <DialogHeader className="text-left pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Báo cáo tin tuyển dụng
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Báo cáo: "{jobTitle}"
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Report Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Loại báo cáo *</Label>
              <div className="grid grid-cols-2 gap-3">
                {reportTypeKeys.map((key) => {
                  const config = REPORT_TYPE_CONFIG[key];
                  const Icon = config.icon;
                  const value = ReportTypes[key];
                  const isSelected = selectedSubject === value;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setValue("subject", value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                        "hover:border-red-300 hover:bg-red-50/50",
                        isSelected
                          ? "border-red-500 bg-red-50 ring-1 ring-red-500/20"
                          : "border-gray-200 bg-white"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-red-700" : "text-gray-700"
                        )}>
                          {config.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {config.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
            </div>

            {/* Report Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Lý do chi tiết *
              </Label>
              <Textarea
                id="reason"
                rows={6}
                placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                {...register("reason")}
                className={`resize-none ${errors.reason ? "border-red-500" : "border-gray-300"} focus:border-red-500 focus:ring-red-500`}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Tối thiểu 10 ký tự, tối đa 1000 ký tự
              </p>
            </div>

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Báo cáo sai sự thật có thể dẫn đến việc khóa tài khoản</li>
                    <li>Chúng tôi sẽ xem xét và xử lý báo cáo trong 24-48 giờ</li>
                    <li>Thông tin báo cáo sẽ được bảo mật</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="px-6"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}