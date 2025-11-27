import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CVServices } from '@/services/cv.service';
import { CandidateJobServices } from '@/services/candidate-job.service';
import { CV } from '@/models/cv';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApplyJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: number;
  jobTitle: string;
  onUploadCV?: () => void;
}

const ApplyJobDialog: React.FC<ApplyJobDialogProps> = ({
  isOpen,
  onOpenChange,
  jobId,
  jobTitle,
  onUploadCV
}) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCVs = async () => {
    try {
      setIsLoading(true);
      const response = await CVServices.getMyCVs();
      
      if (response.isSuccess) {
        setCvs(response.result || []);
        // Auto-select primary CV if exists
        const primaryCV = response.result?.find(cv => cv.isPrimary);
        if (primaryCV) {
          setSelectedCvId(primaryCV.id);
        }
      } else {
        // Handle "not found" as empty list (normal for new users)
        if (response.errorMessages?.some(msg => 
          msg.toLowerCase().includes('not found') || 
          msg.toLowerCase().includes('no cv')
        )) {
          setCvs([]);
        } else {
          toast.error(response.errorMessages?.[0] || 'Không thể tải danh sách CV');
        }
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
      setCvs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedCvId(null);
      fetchCVs();
    }
  }, [isOpen]);

  const handleSubmitApplication = async () => {
    if (!selectedCvId) {
      toast.error('Vui lòng chọn CV để ứng tuyển');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await CandidateJobServices.create({
        jobId: jobId,
        cvId: selectedCvId
      });

      if (response.isSuccess) {
        toast.success("Ứng tuyển thành công!");
        onOpenChange(false);
      } else {
        toast.error(response.errorMessages?.[0] || 'Không thể ứng tuyển');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error?.response?.data?.errorMessages?.[0] || "Không thể ứng tuyển. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCVSelect = (cvId: number) => {
    setSelectedCvId(cvId);
  };

  const handleUploadClick = () => {
    onOpenChange(false);
    onUploadCV?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Ứng tuyển công việc
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-700">Ứng tuyển vị trí</p>
                <h3 className="text-lg font-semibold text-slate-900">{jobTitle}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Vui lòng chọn CV phù hợp nhất để nhà tuyển dụng ấn tượng ngay từ vòng đầu.
                </p>
              </div>
              <Button variant="secondary" onClick={handleUploadClick} className="bg-white text-emerald-700 hover:bg-emerald-100">
                <Upload className="h-4 w-4 mr-1.5" />
                Upload CV
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                <p className="text-gray-600">Đang tải danh sách CV...</p>
              </div>
            </div>
          )}

          {/* CV List */}
          {!isLoading && cvs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Bước 1</p>
                  <h3 className="text-lg font-semibold text-slate-900">Chọn CV để ứng tuyển</h3>
                  <p className="text-sm text-slate-500">Bạn có thể tạo mới CV nếu chưa có.</p>
                </div>
              </div>
              <ScrollArea className="max-h-[320px] pr-3">
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <Card
                      key={cv.id}
                      className={`cursor-pointer border transition-all duration-200 hover:shadow-lg ${
                        selectedCvId === cv.id
                          ? 'border-emerald-400 bg-emerald-50/80 shadow-emerald-100'
                          : 'border-slate-200 hover:border-emerald-200'
                      }`}
                      onClick={() => handleCVSelect(cv.id)}
                    >
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-2xl p-3 transition-colors ${
                            selectedCvId === cv.id ? 'bg-white text-emerald-600 shadow-inner' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">{cv.name}</h4>
                              {cv.isPrimary && (
                                <Badge className="bg-emerald-100 text-emerald-700">CV chính</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{cv.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCvId === cv.id && (
                            <span className="text-sm font-medium text-emerald-600">Đang chọn</span>
                          )}
                          <div className={`rounded-full border p-1 ${
                            selectedCvId === cv.id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'
                          }`}>
                            <CheckCircle className={`h-5 w-5 ${
                              selectedCvId === cv.id ? 'text-emerald-600' : 'text-slate-300'
                            }`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && cvs.length === 0 && (
            <Card className="bg-slate-50 border-dashed border-slate-200 text-center py-10">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Bạn chưa có CV nào</h3>
                  <p className="text-sm text-slate-500">
                    Hãy upload CV đầu tiên để có thể ứng tuyển nhanh chóng.
                  </p>
                </div>
                <Button onClick={handleUploadClick} className="bg-emerald-600 hover:bg-emerald-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CV ngay
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2 pt-4">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmitApplication}
            disabled={!selectedCvId || isSubmitting}
            className="w-full bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 shadow-lg shadow-emerald-500/30"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Đang ứng tuyển...
              </>
            ) : (
              'Nộp đơn ứng tuyển'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyJobDialog;