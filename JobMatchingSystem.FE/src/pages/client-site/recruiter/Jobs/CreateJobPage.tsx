import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  X, 
  Check, 
  Plus,
  Trash2,
  User as UserIcon,
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
import { Checkbox } from "@/components/ui/checkbox";

// Import services
import { JobServices } from "@/services/job.service";
import { UserServices } from "@/services/user.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { type Taxonomy } from "@/models/taxonomy";
import { type User } from "@/models/user";

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
  description: z.string().min(50, "Mô tả công việc phải có ít nhất 50 ký tự"),
  requirements: z.string().min(1, "Yêu cầu công việc là bắt buộc"),
  benefits: z.string(),
  location: z.string().min(1, "Địa điểm làm việc là bắt buộc"),
  salaryMin: z.number().min(0, "Lương tối thiểu phải lớn hơn 0").optional().nullable(),
  salaryMax: z.number().min(0, "Lương tối đa phải lớn hơn 0").optional().nullable(),
  experienceYear: z.number().min(0, "Số năm kinh nghiệm không được âm").max(50, "Số năm kinh nghiệm không được quá 50"),
  jobType: z.string().min(1, "Loại công việc là bắt buộc"),
  openedAt: z.string().min(1, "Ngày mở đăng tuyển là bắt buộc"),
  expiredAt: z.string().min(1, "Ngày hết hạn là bắt buộc"),
  taxonomyIds: z.array(z.number()).optional(), // Cho phép optional, sẽ validate bằng logic
});

type Step1FormData = z.infer<typeof step1Schema>;

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);
  
  // Data states
  const [hiringManagers, setHiringManagers] = useState<HiringManager[]>([]);
  const [loadingHiringManagers, setLoadingHiringManagers] = useState(true);
  const [isNegotiableSalary, setIsNegotiableSalary] = useState(false);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<number[]>([]);
  
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
    jobType: "FullTime",
    openedAt: "",
    expiredAt: "",
    taxonomyIds: [],
  });

  // Step 2: Job Stages only
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
    defaultValues: {
      ...jobData,
      benefits: jobData.benefits || "", // Ensure benefits is always a string
      taxonomyIds: [] // Initialize with empty array
    },
    mode: "onChange",
  });

  // Load hiring managers on component mount
  useEffect(() => {
    const fetchHiringManagers = async () => {
      try {
        setLoadingHiringManagers(true);
        
        // Get current user info to get companyId
        const userResponse = await UserServices.getUserProfile();
        if (!userResponse.isSuccess || !userResponse.result) {
          console.warn("Could not get user profile, hiring managers will be empty");
          setHiringManagers([]);
          return;
        }
        
        const userData = userResponse.result as User;
        if (!userData.companyId) {
          console.warn("User has no company, hiring managers will be empty");
          setHiringManagers([]);
          return;
        }
        
        // Get hiring managers in the company
        const response = await UserServices.getAllWithPagination({
          page: 1,
          size: 100,
          companyId: userData.companyId,
          role: 'HiringManager'
        });
        
        if (response.isSuccess && response.result?.items) {
          const managers: HiringManager[] = response.result.items.map((user: any) => ({
            id: user.id,
            name: user.fullName || user.email,
            email: user.email,
            position: 'Hiring Manager'
          }));
          setHiringManagers(managers);
        } else {
          console.warn("Could not load hiring managers");
          setHiringManagers([]);
        }
      } catch (error) {
        console.warn("Error loading hiring managers:", error);
        setHiringManagers([]);
      } finally {
        setLoadingHiringManagers(false);
      }
    };

    const fetchTaxonomies = async () => {
      try {
        setLoadingTaxonomies(true);
        const response = await TaxonomyService.getAllTaxonomies();
        
        if (response.isSuccess && response.result) {
          setTaxonomies(response.result);
        } else {
          console.warn("Could not load taxonomies");
          setTaxonomies([]);
        }
      } catch (error) {
        console.warn("Error loading taxonomies:", error);
        setTaxonomies([]);
      } finally {
        setLoadingTaxonomies(false);
      }
    };

    // Only fetch if user is authenticated, otherwise just set loading to false
    if (authState.isAuthenticated) {
      fetchHiringManagers();
      fetchTaxonomies();
    } else {
      setLoadingHiringManagers(false);
      setLoadingTaxonomies(false);
      setHiringManagers([]);
      setTaxonomies([]);
    }
  }, [authState.isAuthenticated]);

  // Đồng bộ selectedTaxonomies với form taxonomyIds
  useEffect(() => {
    setValueStep1("taxonomyIds", selectedTaxonomies);
  }, [selectedTaxonomies, setValueStep1]);

  // Steps configuration
  const steps = [
    { number: 1, title: "Thông tin công việc", description: "Điền thông tin cơ bản của công việc" },
    { number: 2, title: "Quy trình tuyển dụng", description: "Thiết lập quy trình tuyển dụng" },
    { number: 3, title: "Xác nhận", description: "Kiểm tra và xác nhận thông tin" },
  ];

  // Handle Step 1 form submission
  const onStep1Submit = async (data: Step1FormData) => {
    console.log("Step 1 form submitted with data:", data);
    
    // Cập nhật taxonomyIds từ selectedTaxonomies trước khi validate
    data.taxonomyIds = selectedTaxonomies;
    
    // Validate salary range
    if (!isNegotiableSalary && data.salaryMin && data.salaryMax && data.salaryMin >= data.salaryMax) {
      alert("Lương tối thiểu phải nhỏ hơn lương tối đa");
      return;
    }

    // Validate taxonomies - kiểm tra selectedTaxonomies
    if (selectedTaxonomies.length === 0) {
      alert("Phải chọn ít nhất 1 kỹ năng");
      return;
    }

    if (selectedTaxonomies.length > 5) {
      alert("Chỉ được chọn tối đa 5 kỹ năng");
      return;
    }

    // Validate dates
    const openedDate = new Date(data.openedAt);
    const expiredDate = new Date(data.expiredAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (openedDate < today) {
      alert("Ngày mở đăng tuyển phải lớn hơn hoặc bằng ngày hiện tại");
      return;
    }

    if (expiredDate <= openedDate) {
      alert("Ngày hết hạn phải lớn hơn ngày mở đăng tuyển");
      return;
    }

    console.log("All validations passed, moving to step 2");
    setJobData(data);
    setCurrentStep(2);
  };

  // Handle navigation between steps
  const goToNextStep = () => {
    console.log("goToNextStep called, current step:", currentStep);
    
    if (currentStep < 3) {
      if (currentStep === 1) {
        console.log("Triggering step 1 form validation");
        // Validate step 1 form
        handleSubmitStep1(onStep1Submit)();
      } else if (currentStep === 2) {
        console.log("Moving from step 2 to step 3");
        // No validation required for step 2 since hiring manager is optional
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

  // Handle negotiable salary toggle
  const handleNegotiableSalaryChange = (checked: boolean) => {
    console.log("Negotiable salary changed:", checked);
    setIsNegotiableSalary(checked);
    if (checked) {
      // Clear salary values when negotiable is selected
      setValueStep1("salaryMin", null);
      setValueStep1("salaryMax", null);
    }
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
        salaryMin: isNegotiableSalary ? undefined : (jobData.salaryMin || undefined),
        salaryMax: isNegotiableSalary ? undefined : (jobData.salaryMax || undefined),
        experienceYear: jobData.experienceYear,
        jobType: jobData.jobType,
        openedAt: new Date(jobData.openedAt).toISOString(),
        expiredAt: new Date(jobData.expiredAt).toISOString(),
        taxonomyIds: jobData.taxonomyIds || selectedTaxonomies || [], // Fallback to selectedTaxonomies hoặc empty array
        jobStages: jobStages.map(stage => ({
          stageNumber: stage.stageNumber,
          name: stage.name,
          hiringManagerId: stage.hiringManagerId || undefined
        })),
      };

      console.log("Creating job with data:", createRequest);

      const response = await JobServices.create(createRequest as any);
      
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
      case "FullTime": return "Toàn thời gian";
      case "PartTime": return "Bán thời gian";
      case "Remote": return "Làm từ xa";
      case "Other": return "Khác";
      default: return "Không xác định";
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmitStep1(onStep1Submit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Thông tin cơ bản */}
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="text-green-800 text-lg">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Title */}
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-base font-medium text-gray-700">Tiêu đề công việc *</Label>
                      <Input
                        id="title"
                        {...registerStep1("title")}
                        placeholder="Nhập tiêu đề công việc..."
                        className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.title ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.title && (
                        <p className="text-sm text-red-500">{errorsStep1.title.message}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-base font-medium text-gray-700">Địa điểm làm việc *</Label>
                      <Input
                        id="location"
                        {...registerStep1("location")}
                        placeholder="Nhập địa điểm làm việc..."
                        className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.location ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.location && (
                        <p className="text-sm text-red-500">{errorsStep1.location.message}</p>
                      )}
                    </div>

                    {/* Job Type */}
                    <div className="space-y-3">
                      <Label htmlFor="jobType" className="text-base font-medium text-gray-700">Loại công việc *</Label>
                      <Select
                        value={watchStep1("jobType")}
                        onValueChange={(value) => setValueStep1("jobType", value)}
                      >
                        <SelectTrigger className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.jobType ? "border-red-500" : "border-gray-300"}`}>
                          <SelectValue placeholder="Chọn loại công việc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                          <SelectItem value="PartTime">Bán thời gian</SelectItem>
                          <SelectItem value="Remote">Làm từ xa</SelectItem>
                          <SelectItem value="Other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      {errorsStep1.jobType && (
                        <p className="text-sm text-red-500">{errorsStep1.jobType.message}</p>
                      )}
                    </div>

                    {/* Experience Year */}
                    <div className="space-y-3">
                      <Label htmlFor="experienceYear" className="text-base font-medium text-gray-700">Số năm kinh nghiệm yêu cầu</Label>
                      <Input
                        id="experienceYear"
                        type="number"
                        min="0"
                        max="50"
                        {...registerStep1("experienceYear", { valueAsNumber: true })}
                        placeholder="Nhập số năm kinh nghiệm..."
                        className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.experienceYear ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.experienceYear && (
                        <p className="text-sm text-red-500">{errorsStep1.experienceYear.message}</p>
                      )}
                    </div>

                    {/* Taxonomies/Skills */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Kỹ năng yêu cầu (1-5 kỹ năng) *</Label>
                      {loadingTaxonomies ? (
                        <div className="text-sm text-gray-500">Đang tải danh sách kỹ năng...</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg p-3">
                          {taxonomies.map((taxonomy) => (
                            <label key={taxonomy.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTaxonomies.includes(taxonomy.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedTaxonomies.length < 5) {
                                      const newTaxonomies = [...selectedTaxonomies, taxonomy.id];
                                      setSelectedTaxonomies(newTaxonomies);
                                      setValueStep1("taxonomyIds", newTaxonomies);
                                    }
                                  } else {
                                    const newTaxonomies = selectedTaxonomies.filter(id => id !== taxonomy.id);
                                    setSelectedTaxonomies(newTaxonomies);
                                    setValueStep1("taxonomyIds", newTaxonomies);
                                  }
                                }}
                                disabled={!selectedTaxonomies.includes(taxonomy.id) && selectedTaxonomies.length >= 5}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{taxonomy.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {selectedTaxonomies.length === 0 && (
                        <p className="text-sm text-red-500">Phải chọn ít nhất 1 kỹ năng</p>
                      )}
                      {selectedTaxonomies.length >= 5 && (
                        <p className="text-sm text-orange-500">Đã chọn tối đa 5 kỹ năng</p>
                      )}
                      <div className="text-sm text-gray-500">
                        Đã chọn: {selectedTaxonomies.length}/5 kỹ năng
                      </div>
                    </div>

                    {/* Opened Date */}
                    <div className="space-y-3">
                      <Label htmlFor="openedAt" className="text-base font-medium text-gray-700">Ngày mở đăng tuyển *</Label>
                      <Input
                        id="openedAt"
                        type="date"
                        {...registerStep1("openedAt")}
                        className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.openedAt ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.openedAt && (
                        <p className="text-sm text-red-500">{errorsStep1.openedAt.message}</p>
                      )}
                    </div>

                    {/* Expired Date */}
                    <div className="space-y-3">
                      <Label htmlFor="expiredAt" className="text-base font-medium text-gray-700">Ngày hết hạn ứng tuyển *</Label>
                      <Input
                        id="expiredAt"
                        type="date"
                        {...registerStep1("expiredAt")}
                        className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.expiredAt ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.expiredAt && (
                        <p className="text-sm text-red-500">{errorsStep1.expiredAt.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Mô tả chi tiết */}
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="text-green-800 text-lg">Mô tả chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Description */}
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-base font-medium text-gray-700">Mô tả công việc *</Label>
                      <Textarea
                        id="description"
                        rows={5}
                        {...registerStep1("description")}
                        placeholder="Mô tả chi tiết về công việc..."
                        className={`text-base border-2 focus:border-green-400 resize-none ${errorsStep1.description ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.description && (
                        <p className="text-sm text-red-500">{errorsStep1.description.message}</p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="space-y-3">
                      <Label htmlFor="requirements" className="text-base font-medium text-gray-700">Yêu cầu công việc *</Label>
                      <Textarea
                        id="requirements"
                        rows={5}
                        {...registerStep1("requirements")}
                        placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                        className={`text-base border-2 focus:border-green-400 resize-none ${errorsStep1.requirements ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.requirements && (
                        <p className="text-sm text-red-500">{errorsStep1.requirements.message}</p>
                      )}
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <Label htmlFor="benefits" className="text-base font-medium text-gray-700">Quyền lợi</Label>
                      <Textarea
                        id="benefits"
                        rows={4}
                        {...registerStep1("benefits")}
                        placeholder="Các quyền lợi và phúc lợi..."
                        className={`text-base border-2 focus:border-green-400 resize-none ${errorsStep1.benefits ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errorsStep1.benefits && (
                        <p className="text-sm text-red-500">{errorsStep1.benefits.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mức lương */}
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="text-green-800 text-lg">Mức lương</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Lương thỏa thuận checkbox */}
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="negotiableSalary"
                        checked={isNegotiableSalary}
                        onCheckedChange={handleNegotiableSalaryChange}
                        className="h-5 w-5 text-green-600"
                      />
                      <Label htmlFor="negotiableSalary" className="text-base font-medium text-gray-700 cursor-pointer">
                        Lương thỏa thuận
                      </Label>
                    </div>
                    
                    {!isNegotiableSalary && (
                      <>
                        <div className="space-y-3">
                          <Label htmlFor="salaryMin" className="text-base font-medium text-gray-700">Lương tối thiểu (VND)</Label>
                          <Input
                            id="salaryMin"
                            type="number"
                            min="0"
                            {...registerStep1("salaryMin", { valueAsNumber: true })}
                            placeholder="Nhập lương tối thiểu..."
                            className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.salaryMin ? "border-red-500" : "border-gray-300"}`}
                          />
                          {errorsStep1.salaryMin && (
                            <p className="text-sm text-red-500">{errorsStep1.salaryMin.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="salaryMax" className="text-base font-medium text-gray-700">Lương tối đa (VND)</Label>
                          <Input
                            id="salaryMax"
                            type="number"
                            min="0"
                            {...registerStep1("salaryMax", { valueAsNumber: true })}
                            placeholder="Nhập lương tối đa..."
                            className={`h-12 text-base border-2 focus:border-green-400 ${errorsStep1.salaryMax ? "border-red-500" : "border-gray-300"}`}
                          />
                          {errorsStep1.salaryMax && (
                            <p className="text-sm text-red-500">{errorsStep1.salaryMax.message}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    {isNegotiableSalary && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          💼 Mức lương sẽ được thỏa thuận trong quá trình phỏng vấn
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-8">
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-50 border-b border-green-200 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-green-800 text-lg">Quy trình tuyển dụng</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">Thiết lập các giai đoạn tuyển dụng cho vị trí này</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addJobStage}
                  className="flex items-center space-x-2 border-2 border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm giai đoạn</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {jobStages.map((stage) => (
                  <div key={stage.stageNumber} className="border-2 border-green-100 rounded-lg p-5 space-y-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-green-800 text-lg">Giai đoạn {stage.stageNumber}</h4>
                      {jobStages.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJobStage(stage.stageNumber)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Tên giai đoạn */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium text-gray-700">Tên giai đoạn *</Label>
                        <Input
                          value={stage.name}
                          onChange={(e) => updateJobStage(stage.stageNumber, 'name', e.target.value)}
                          placeholder="Nhập tên giai đoạn..."
                          className="h-12 text-base border-2 focus:border-green-400"
                        />
                      </div>

                      {/* Hiring Manager */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium text-gray-700">Hiring Manager (Tùy chọn)</Label>
                        <Select
                          value={stage.hiringManagerId?.toString() || "none"}
                          onValueChange={(value) => updateJobStage(stage.stageNumber, 'hiringManagerId', value === "none" ? undefined : parseInt(value))}
                        >
                          <SelectTrigger className="h-12 text-base border-2 focus:border-green-400">
                            <SelectValue placeholder="Chọn hiring manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Không chọn</SelectItem>
                            {loadingHiringManagers ? (
                              <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                            ) : hiringManagers.length === 0 ? (
                              <SelectItem value="empty" disabled>Không có hiring manager</SelectItem>
                            ) : (
                              hiringManagers.map(manager => (
                                <SelectItem key={manager.id} value={manager.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <UserIcon className="h-4 w-4" />
                                    <div>
                                      <div className="font-medium">{manager.name}</div>
                                      <div className="text-sm text-gray-500">{manager.email}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          💡 Có thể để trống nếu chưa xác định được người phụ trách
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Information Review */}
              <Card className="border-green-200 shadow-lg">
                <CardHeader className="bg-green-50 border-b border-green-200">
                  <CardTitle className="flex items-center space-x-2 text-green-800 text-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span>Thông tin công việc</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">Xem lại thông tin cơ bản của công việc</p>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Tiêu đề:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{jobData.title}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Địa điểm:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{jobData.location}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Loại công việc:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{getJobTypeLabel(jobData.jobType)}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Kinh nghiệm:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{jobData.experienceYear} năm</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Kỹ năng yêu cầu:</Label>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex flex-wrap gap-2">
                        {(selectedTaxonomies || []).map((taxonomyId) => {
                          const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                          return (
                            <span key={taxonomyId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {taxonomy?.name || `ID: ${taxonomyId}`}
                            </span>
                          );
                        })}
                        {selectedTaxonomies.length === 0 && (
                          <span className="text-gray-500 text-sm">Chưa chọn kỹ năng</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Mức lương:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">
                      {isNegotiableSalary 
                        ? "Thỏa thuận" 
                        : (jobData.salaryMin && jobData.salaryMax 
                          ? `${jobData.salaryMin.toLocaleString()} - ${jobData.salaryMax.toLocaleString()} VND`
                          : "Thỏa thuận"
                        )
                      }
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Ngày mở:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{new Date(jobData.openedAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Hết hạn:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">{new Date(jobData.expiredAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Mô tả:</Label>
                    <div className="text-base text-gray-800 bg-gray-50 p-4 rounded max-h-32 overflow-y-auto">
                      {jobData.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Review */}
              <div className="space-y-8">
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="flex items-center space-x-2 text-green-800 text-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span>Quy trình tuyển dụng</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Xem lại các giai đoạn tuyển dụng</p>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    {jobStages.map(stage => {
                      const manager = hiringManagers.find(m => m.id === stage.hiringManagerId);
                      return (
                        <div key={stage.stageNumber} className="border-2 border-green-100 rounded-lg p-4 bg-green-50">
                          <p className="font-medium text-base text-green-800">Giai đoạn {stage.stageNumber}: {stage.name}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            Phụ trách: {manager ? manager.name : 'Chưa xác định'}
                          </p>
                        </div>
                      );
                    })}
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
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/recruiter/jobs")}
            className="flex items-center space-x-2 border-2 border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-800">Tạo tin tuyển dụng mới</h1>
            <p className="text-gray-600 text-lg mt-2">
              Hoàn thành 3 bước để tạo tin tuyển dụng
            </p>
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
        <div className="flex items-center justify-center space-x-8 py-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center space-y-2">
              <div className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-medium transition-all
                ${currentStep === step.number 
                  ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                  : currentStep > step.number
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-500 bg-white'
                }
              `}>
                {currentStep > step.number ? (
                  <Check className="h-6 w-6" />
                ) : (
                  step.number
                )}
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-green-800' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-20 h-1 mx-6 mt-5 rounded transition-all
                ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-green-200 min-h-[600px] p-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
        <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? handleCancel : goToPrevStep}
          className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400"
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
          onClick={() => {
            console.log("Next button clicked, current step:", currentStep);
            if (currentStep === 3) {
              createJob();
            } else {
              goToNextStep();
            }
          }}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base font-medium"
        >
          {currentStep === 3 ? (
            <>
              <Save className="h-5 w-5" />
              <span>{isLoading ? "Đang tạo..." : "Tạo tin tuyển dụng"}</span>
            </>
          ) : (
            <>
              <span>Tiếp theo</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
        </div>
      </div>
    </div>
  );
}