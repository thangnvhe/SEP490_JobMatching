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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ReportItem, ReportType } from "@/models/report";

// Define available report types
const reportTypes: ReportType[] = [
  "Spam",
  "InappropriateContent", 
  "FraudulentJobPosting",
  "Other"
];

// Validation schema
const reportSchema = z.object({
  subject: z.string().refine((val) => reportTypes.includes(val as ReportType), {
    message: "Vui lòng chọn loại báo cáo"
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
  onSubmitReport: (reportData: Pick<ReportItem, 'jobId' | 'subject' | 'reason'>) => Promise<void>;
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
    reset
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      subject: undefined,
      reason: ""
    }
  });

  const selectedSubject = watch("subject");

  // Reset form khi dialog đóng
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsLoading(true);

      const reportRequest: Pick<ReportItem, 'jobId' | 'subject' | 'reason'> = {
        jobId,
        subject: data.subject as ReportType,
        reason: data.reason.trim()
      };

      await onSubmitReport(reportRequest);
      
      toast.success("Báo cáo đã được gửi thành công!");
      handleOpenChange(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    switch (type) {
      case "Spam":
        return "Spam";
      case "InappropriateContent":
        return "Nội dung không phù hợp";
      case "FraudulentJobPosting":
        return "Tin tuyển dụng lừa đảo";
      case "Other":
        return "Khác";
      default:
        return type;
    }
  };

  const getReportTypeDescription = (type: ReportType) => {
    switch (type) {
      case "Spam":
        return "Tin tuyển dụng spam hoặc không mong muốn";
      case "InappropriateContent":
        return "Nội dung vi phạm quy định cộng đồng";
      case "FraudulentJobPosting":
        return "Tin tuyển dụng có dấu hiệu lừa đảo";
      case "Other":
        return "Các vấn đề khác";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="p-6 pb-0">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Loại báo cáo *
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => setValue("subject", value)}
              >
                <SelectTrigger className={`h-11 ${errors.subject ? "border-red-500" : "border-gray-300"}`}>
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex flex-col">
                        <span className="font-medium">{getReportTypeLabel(type)}</span>
                        <span className="text-xs text-gray-500">
                          {getReportTypeDescription(type)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
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
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
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