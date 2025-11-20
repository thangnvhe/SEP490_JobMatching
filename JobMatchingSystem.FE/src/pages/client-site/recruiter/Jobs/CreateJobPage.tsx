import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  X, 
  Check, 
  Plus,
  Trash2,
  User,
  CheckCircle
} from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Import services
import { JobServices } from "@/services/job.service";
import { TaxonomyService, TaxonomyDto } from "@/services/taxonomy.service";

// Types
interface HiringManager {
  id: number;
  name: string;
  email: string;
  position: string;
}

interface JobStage {
  stageNumber: number;
  name: string;
  hiringManagerId?: number;
}

// Step 1: Job Information Schema
const step1Schema = z.object({
  title: z.string().min(1, "Tiêu đề công việc là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().min(1, "Mô tả công việc là bắt buộc"),
  requirements: z.string().min(1, "Yêu cầu công việc là bắt buộc"),
  benefits: z.string().optional(),
  location: z.string().min(1, "Địa điểm làm việc là bắt buộc"),
  salaryMin: z.number().min(0, "Lương tối thiểu phải lớn hơn 0").optional().nullable(),
  salaryMax: z.number().min(0, "Lương tối đa phải lớn hơn 0").optional().nullable(),
  experienceYear: z.number().min(0, "Số năm kinh nghiệm không được âm").max(50, "Số năm kinh nghiệm không được quá 50"),
  jobType: z.string().min(1, "Loại công việc là bắt buộc"),
  expiredAt: z.string().min(1, "Ngày hết hạn là bắt buộc"),
});

type Step1FormData = z.infer<typeof step1Schema>;

// Sample hiring managers data (sẽ được thay thế bằng API call thực)
const sampleHiringManagers: HiringManager[] = [
  { id: 1, name: "Nguyễn Văn A", email: "a.nguyen@company.com", position: "Senior Developer" },
  { id: 2, name: "Trần Thị B", email: "b.tran@company.com", position: "Team Lead" },
  { id: 3, name: "Lê Văn C", email: "c.le@company.com", position: "Project Manager" },
  { id: 4, name: "Phạm Thị D", email: "d.pham@company.com", position: "HR Manager" },
];

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [taxonomies, setTaxonomies] = useState<TaxonomyDto[]>([]);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  
  // Step 1: Job Information
  const [jobData, setJobData] = useState<Step1FormData>({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    salaryMin: null,
    salaryMax: null,
    experienceYear: 0,
    jobType: "0",
    expiredAt: "",
  });

  // Step 2: Job Stages and Taxonomies
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<number[]>([]);
  const [jobStages, setJobStages] = useState<JobStage[]>([
    { stageNumber: 1, name: "Sàng lọc hồ sơ", hiringManagerId: undefined },
    { stageNumber: 2, name: "Phỏng vấn kỹ thuật", hiringManagerId: undefined },
  ]);

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
    setValue: setValueStep1,
    watch: watchStep1,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: jobData,
    mode: "onChange",
  });

  // Load taxonomies on component mount
  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        setLoadingTaxonomies(true);
        const response = await TaxonomyService.getAllTaxonomies();
        if (response.isSuccess && response.result) {
          setTaxonomies(response.result);
        }
      } catch (error) {
        console.error("Error loading taxonomies:", error);
        // Fallback to empty array if API fails
        setTaxonomies([]);
      } finally {
        setLoadingTaxonomies(false);
      }
    };

    fetchTaxonomies();
  }, []);

  // Steps configuration
  const steps = [
    { number: 1, title: "Thông tin công việc", description: "Điền thông tin cơ bản của công việc" },
    { number: 2, title: "Quy trình & Kỹ năng", description: "Thiết lập quy trình tuyển dụng và chọn kỹ năng" },
    { number: 3, title: "Xác nhận", description: "Kiểm tra và xác nhận thông tin" },
  ];

  // Handle Step 1 form submission
  const onStep1Submit = async (data: Step1FormData) => {
    // Validate salary range
    if (data.salaryMin && data.salaryMax && data.salaryMin >= data.salaryMax) {
      alert("Lương tối thiểu phải nhỏ hơn lương tối đa");
      return;
    }

    // Validate expiration date
    const expiredDate = new Date(data.expiredAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiredDate < today) {
      alert("Ngày hết hạn phải lớn hơn ngày hiện tại");
      return;
    }

    setJobData(data);
    setCurrentStep(2);
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    if (currentStep < 3) {
      if (currentStep === 1) {
        // Validate step 1 form
        handleSubmitStep1(onStep1Submit)();
      } else if (currentStep === 2) {
        // Validate step 2
        if (jobStages.some(stage => !stage.hiringManagerId)) {
          alert("Vui lòng chọn hiring manager cho tất cả các giai đoạn");
          return;
        }
        if (selectedTaxonomies.length === 0) {
          alert("Vui lòng chọn ít nhất một kỹ năng");
          return;
        }
        setCurrentStep(3);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle job stages
  const addJobStage = () => {
    const newStageNumber = Math.max(...jobStages.map(s => s.stageNumber)) + 1;
    setJobStages([...jobStages, {
      stageNumber: newStageNumber,
      name: `Giai đoạn ${newStageNumber}`,
      hiringManagerId: undefined
    }]);
  };

  const removeJobStage = (stageNumber: number) => {
    if (jobStages.length > 1) {
      setJobStages(jobStages.filter(stage => stage.stageNumber !== stageNumber));
    }
  };

  const updateJobStage = (stageNumber: number, field: keyof JobStage, value: any) => {
    setJobStages(jobStages.map(stage => 
      stage.stageNumber === stageNumber 
        ? { ...stage, [field]: value }
        : stage
    ));
  };

  // Handle taxonomies selection
  const toggleTaxonomy = (taxonomyId: number) => {
    setSelectedTaxonomies(prev => 
      prev.includes(taxonomyId)
        ? prev.filter(id => id !== taxonomyId)
        : [...prev, taxonomyId]
    );
  };

  // Final job creation
  const createJob = async () => {
    try {
      setIsLoading(true);

      const createRequest = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits || "",
        location: jobData.location,
        salaryMin: jobData.salaryMin || undefined,
        salaryMax: jobData.salaryMax || undefined,
        experienceYear: jobData.experienceYear,
        jobType: jobData.jobType,
        expiredAt: new Date(jobData.expiredAt).toISOString(),
        jobStages: jobStages.map(stage => ({
          stageNumber: stage.stageNumber,
          name: stage.name,
          hiringManagerId: stage.hiringManagerId
        })),
        taxonomyIds: selectedTaxonomies,
      };

      console.log("Creating job with data:", createRequest);

      const response = await JobServices.createJob(createRequest);
      
      if (response.isSuccess) {
        alert("Tạo tin tuyển dụng thành công!");
        navigate("/recruiter/jobs");
      } else {
        alert("Có lỗi xảy ra khi tạo tin tuyển dụng");
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi tạo tin tuyển dụng. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.")) {
      navigate("/recruiter/jobs");
    }
  };

  // Get job type label
  const getJobTypeLabel = (value: string) => {
    switch (value) {
      case "0": return "Toàn thời gian";
      case "1": return "Bán thời gian";
      case "2": return "Làm từ xa";
      default: return "Không xác định";
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmitStep1(onStep1Submit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề công việc *</Label>
                      <Input
                        id="title"
                        {...registerStep1("title")}
                        placeholder="Nhập tiêu đề công việc..."
                        className={errorsStep1.title ? "border-red-500" : ""}
                      />
                      {errorsStep1.title && (
                        <p className="text-sm text-red-500">{errorsStep1.title.message}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Địa điểm làm việc *</Label>
                      <Input
                        id="location"
                        {...registerStep1("location")}
                        placeholder="Nhập địa điểm làm việc..."
                        className={errorsStep1.location ? "border-red-500" : ""}
                      />
                      {errorsStep1.location && (
                        <p className="text-sm text-red-500">{errorsStep1.location.message}</p>
                      )}
                    </div>

                    {/* Job Type */}
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Loại công việc *</Label>
                      <Select
                        value={watchStep1("jobType")}
                        onValueChange={(value) => setValueStep1("jobType", value)}
                      >
                        <SelectTrigger className={errorsStep1.jobType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Chọn loại công việc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Toàn thời gian</SelectItem>
                          <SelectItem value="1">Bán thời gian</SelectItem>
                          <SelectItem value="2">Làm từ xa</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsStep1.jobType && (
                        <p className="text-sm text-red-500">{errorsStep1.jobType.message}</p>
                      )}
                    </div>

                    {/* Experience Year */}
                    <div className="space-y-2">
                      <Label htmlFor="experienceYear">Số năm kinh nghiệm yêu cầu</Label>
                      <Input
                        id="experienceYear"
                        type="number"
                        min="0"
                        max="50"
                        {...registerStep1("experienceYear", { valueAsNumber: true })}
                        placeholder="Nhập số năm kinh nghiệm..."
                        className={errorsStep1.experienceYear ? "border-red-500" : ""}
                      />
                      {errorsStep1.experienceYear && (
                        <p className="text-sm text-red-500">{errorsStep1.experienceYear.message}</p>
                      )}
                    </div>

                    {/* Expired Date */}
                    <div className="space-y-2">
                      <Label htmlFor="expiredAt">Ngày hết hạn ứng tuyển *</Label>
                      <Input
                        id="expiredAt"
                        type="date"
                        {...registerStep1("expiredAt")}
                        className={errorsStep1.expiredAt ? "border-red-500" : ""}
                      />
                      {errorsStep1.expiredAt && (
                        <p className="text-sm text-red-500">{errorsStep1.expiredAt.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Mô tả chi tiết */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả công việc *</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        {...registerStep1("description")}
                        placeholder="Mô tả chi tiết về công việc..."
                        className={errorsStep1.description ? "border-red-500" : ""}
                      />
                      {errorsStep1.description && (
                        <p className="text-sm text-red-500">{errorsStep1.description.message}</p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Yêu cầu công việc *</Label>
                      <Textarea
                        id="requirements"
                        rows={4}
                        {...registerStep1("requirements")}
                        placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                        className={errorsStep1.requirements ? "border-red-500" : ""}
                      />
                      {errorsStep1.requirements && (
                        <p className="text-sm text-red-500">{errorsStep1.requirements.message}</p>
                      )}
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Quyền lợi</Label>
                      <Textarea
                        id="benefits"
                        rows={3}
                        {...registerStep1("benefits")}
                        placeholder="Các quyền lợi và phúc lợi..."
                        className={errorsStep1.benefits ? "border-red-500" : ""}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Mức lương */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mức lương</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Lương tối thiểu (VND)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        {...registerStep1("salaryMin", { valueAsNumber: true })}
                        placeholder="Nhập lương tối thiểu..."
                        className={errorsStep1.salaryMin ? "border-red-500" : ""}
                      />
                      {errorsStep1.salaryMin && (
                        <p className="text-sm text-red-500">{errorsStep1.salaryMin.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Lương tối đa (VND)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        {...registerStep1("salaryMax", { valueAsNumber: true })}
                        placeholder="Nhập lương tối đa..."
                        className={errorsStep1.salaryMax ? "border-red-500" : ""}
                      />
                      {errorsStep1.salaryMax && (
                        <p className="text-sm text-red-500">{errorsStep1.salaryMax.message}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Để trống nếu lương thỏa thuận
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Job Stages */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Quy trình tuyển dụng</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addJobStage}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm giai đoạn</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {jobStages.map((stage) => (
                      <div key={stage.stageNumber} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Giai đoạn {stage.stageNumber}</h4>
                          {jobStages.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeJobStage(stage.stageNumber)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Tên giai đoạn *</Label>
                          <Input
                            value={stage.name}
                            onChange={(e) => updateJobStage(stage.stageNumber, 'name', e.target.value)}
                            placeholder="Nhập tên giai đoạn..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Hiring Manager *</Label>
                          <Select
                            value={stage.hiringManagerId?.toString() || ""}
                            onValueChange={(value) => updateJobStage(stage.stageNumber, 'hiringManagerId', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hiring manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {sampleHiringManagers.map(manager => (
                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{manager.name}</div>
                                      <div className="text-sm text-gray-500">{manager.position}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Taxonomies */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Kỹ năng yêu cầu</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Chọn các kỹ năng cần thiết cho vị trí này
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {loadingTaxonomies ? (
                        <div className="col-span-2 text-center py-4">
                          <p className="text-sm text-gray-500">Đang tải kỹ năng...</p>
                        </div>
                      ) : taxonomies.length === 0 ? (
                        <div className="col-span-2 text-center py-4">
                          <p className="text-sm text-gray-500">Không có kỹ năng nào</p>
                        </div>
                      ) : (
                        taxonomies.map((taxonomy: TaxonomyDto) => (
                        <div key={taxonomy.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`taxonomy-${taxonomy.id}`}
                            checked={selectedTaxonomies.includes(taxonomy.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                toggleTaxonomy(taxonomy.id);
                              } else {
                                toggleTaxonomy(taxonomy.id);
                              }
                            }}
                          />
                          <Label
                            htmlFor={`taxonomy-${taxonomy.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {taxonomy.name}
                          </Label>
                        </div>
                        ))
                      )}
                    </div>

                    {selectedTaxonomies.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Kỹ năng đã chọn:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTaxonomies.map(id => {
                            const taxonomy = taxonomies.find((t: TaxonomyDto) => t.id === id);
                            return taxonomy ? (
                              <Badge key={id} variant="secondary" className="text-sm">
                                {taxonomy.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 h-auto p-0"
                                  onClick={() => toggleTaxonomy(id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Information Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Thông tin công việc</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tiêu đề:</Label>
                    <p className="text-sm">{jobData.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Địa điểm:</Label>
                    <p className="text-sm">{jobData.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Loại công việc:</Label>
                    <p className="text-sm">{getJobTypeLabel(jobData.jobType)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kinh nghiệm:</Label>
                    <p className="text-sm">{jobData.experienceYear} năm</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Mức lương:</Label>
                    <p className="text-sm">
                      {jobData.salaryMin && jobData.salaryMax 
                        ? `${jobData.salaryMin.toLocaleString()} - ${jobData.salaryMax.toLocaleString()} VND`
                        : "Thỏa thuận"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hết hạn:</Label>
                    <p className="text-sm">{new Date(jobData.expiredAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Mô tả:</Label>
                    <p className="text-sm text-gray-700 line-clamp-3">{jobData.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Process & Skills Review */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Quy trình tuyển dụng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {jobStages.map(stage => {
                      const manager = sampleHiringManagers.find(m => m.id === stage.hiringManagerId);
                      return (
                        <div key={stage.stageNumber} className="border rounded p-3">
                          <p className="font-medium text-sm">Giai đoạn {stage.stageNumber}: {stage.name}</p>
                          <p className="text-sm text-gray-500">
                            Phụ trách: {manager ? manager.name : 'Chưa chọn'}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Kỹ năng yêu cầu</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTaxonomies.map(id => {
                        const taxonomy = taxonomies.find((t: TaxonomyDto) => t.id === id);
                        return taxonomy ? (
                          <Badge key={id} variant="secondary">
                            {taxonomy.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/recruiter/jobs")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo tin tuyển dụng mới</h1>
          <p className="text-muted-foreground">
            Hoàn thành 3 bước để tạo tin tuyển dụng
          </p>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="flex items-center justify-center space-x-4 py-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center space-y-2">
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                ${currentStep === step.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : currentStep > step.number
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }
              `}>
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4 mt-5
                ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? handleCancel : goToPrevStep}
          className="flex items-center space-x-2"
        >
          {currentStep === 1 ? (
            <>
              <X className="h-4 w-4" />
              <span>Hủy</span>
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={currentStep === 3 ? createJob : goToNextStep}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === 3 ? (
            <>
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Đang tạo..." : "Tạo tin tuyển dụng"}</span>
            </>
          ) : (
            <>
              <span>Tiếp theo</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}