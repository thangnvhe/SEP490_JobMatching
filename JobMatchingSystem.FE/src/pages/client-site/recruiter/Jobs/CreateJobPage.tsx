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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import services
import { JobServices } from "@/services/job.service";
import { UserServices } from "@/services/user.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { PositionService } from "@/services/position.service";
import { ExtensionJobServices } from "@/services/extension-job.service";
import { HighlightJobServices } from "@/services/highlight-job.service";
import { type Taxonomy } from "@/models/taxonomy";
import { type Position } from "@/models/position";
import { type User } from "@/models/user";
import { type ExtensionJob } from "@/models/extension-job";
import { type HighlightJob } from "@/models/highlight-job";
import { toast } from "sonner";

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
  positionId: z.number().min(1, "Vị trí tuyển dụng là bắt buộc"),
  openedAt: z.date({ required_error: "Ngày mở tuyển dụng là bắt buộc" }),
  expiredAt: z.date({ required_error: "Ngày hết hạn là bắt buộc" }),
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
  const [searchTaxonomy, setSearchTaxonomy] = useState("");
  const [openTaxonomyPopover, setOpenTaxonomyPopover] = useState(false);
  
  // Position selection
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [searchPosition, setSearchPosition] = useState("");
  const [openPositionPopover, setOpenPositionPopover] = useState(false);
  
  // Extension and Highlight Jobs
  const [extensionJobs, setExtensionJobs] = useState<ExtensionJob[]>([]);
  const [highlightJobs, setHighlightJobs] = useState<HighlightJob[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(true);
  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | undefined>(undefined);
  const [selectedHighlightId, setSelectedHighlightId] = useState<number | undefined>(undefined);
  
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
    jobType: "",
    positionId: 0,
    openedAt: new Date(),
    expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
    taxonomyIds: [],
  });

  // Step 2: Job Stages only
  const [jobStages, setJobStages] = useState<JobStage[]>([
    { stageNumber: 1, name: "Phỏng vấn sơ bộ", hiringManagerId: undefined },
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
      openedAt: new Date(),
      expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
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

    const fetchPositions = async () => {
      try {
        setLoadingPositions(true);
        const response = await PositionService.getAll();
        
        if (response.isSuccess && response.result) {
          setPositions(response.result);
        } else {
          console.warn("Could not load positions");
          setPositions([]);
        }
      } catch (error) {
        console.warn("Error loading positions:", error);
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };

    const fetchExtensionJobs = async () => {
      try {
        setLoadingExtensions(true);
        const response = await ExtensionJobServices.getMyExtensionJobs();
        
        if (response.isSuccess && response.result) {
          setExtensionJobs(response.result);
        } else {
          console.warn("Could not load extension jobs");
          setExtensionJobs([]);
        }
      } catch (error) {
        console.warn("Error loading extension jobs:", error);
        setExtensionJobs([]);
      } finally {
        setLoadingExtensions(false);
      }
    };

    const fetchHighlightJobs = async () => {
      try {
        setLoadingHighlights(true);
        const response = await HighlightJobServices.getMyHighlightJobs();
        
        if (response.isSuccess && response.result) {
          setHighlightJobs(response.result);
        } else {
          console.warn("Could not load highlight jobs");
          setHighlightJobs([]);
        }
      } catch (error) {
        console.warn("Error loading highlight jobs:", error);
        setHighlightJobs([]);
      } finally {
        setLoadingHighlights(false);
      }
    };

    // Only fetch if user is authenticated, otherwise just set loading to false
    if (authState.isAuthenticated) {
      fetchHiringManagers();
      fetchTaxonomies();
      fetchPositions();
      fetchExtensionJobs();
      fetchHighlightJobs();
    } else {
      setLoadingHiringManagers(false);
      setLoadingTaxonomies(false);
      setLoadingPositions(false);
      setLoadingExtensions(false);
      setLoadingHighlights(false);
      setHiringManagers([]);
      setTaxonomies([]);
      setPositions([]);
      setExtensionJobs([]);
      setHighlightJobs([]);
    }
  }, [authState.isAuthenticated]);

  // Đồng bộ selectedTaxonomies với form taxonomyIds
  useEffect(() => {
    setValueStep1("taxonomyIds", selectedTaxonomies);
  }, [selectedTaxonomies, setValueStep1]);

  // Đồng bộ selectedPositionId với form positionId
  useEffect(() => {
    setValueStep1("positionId", selectedPositionId || 0);
  }, [selectedPositionId, setValueStep1]);

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
      toast.error("Lương tối thiểu phải nhỏ hơn lương tối đa");
      return;
    }

    // Validate position
    if (!selectedPositionId) {
      toast.error("Phải chọn vị trí tuyển dụng");
      return;
    }

    // Validate taxonomies - kiểm tra selectedTaxonomies
    if (selectedTaxonomies.length === 0) {
      toast.error("Phải chọn ít nhất 1 kỹ năng");
      return;
    }

    if (selectedTaxonomies.length > 5) {
      toast.error("Chỉ được chọn tối đa 5 kỹ năng");
      return;
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const openedDate = new Date(data.openedAt);
    openedDate.setHours(0, 0, 0, 0);
    const expiredDate = new Date(data.expiredAt);
    expiredDate.setHours(0, 0, 0, 0);

    if (openedDate < today) {
      toast.error("Ngày mở tuyển dụng không được nhỏ hơn ngày hiện tại");
      return;
    }

    if (expiredDate <= openedDate) {
      toast.error("Ngày hết hạn phải lớn hơn ngày mở tuyển dụng");
      return;
    }

    const daysDiff = Math.ceil((expiredDate.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      toast.error("Ngày hết hạn không được quá 30 ngày so với ngày mở tuyển dụng");
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
        positionId: selectedPositionId || 0,
        openedAt: jobData.openedAt instanceof Date ? jobData.openedAt.toISOString() : new Date(jobData.openedAt).toISOString(),
        expiredAt: jobData.expiredAt instanceof Date ? jobData.expiredAt.toISOString() : new Date(jobData.expiredAt).toISOString(),
        taxonomyIds: jobData.taxonomyIds || selectedTaxonomies || [], // Fallback to selectedTaxonomies hoặc empty array
        highlightJobId: selectedHighlightId || 0,
        extensionJobId: selectedExtensionId || 0,
        jobStages: jobStages.map(stage => ({
          stageNumber: stage.stageNumber,
          name: stage.name,
          hiringManagerId: stage.hiringManagerId || undefined
        })),
      };

      console.log("Creating job with data:", createRequest);

      const response = await JobServices.create(createRequest as any);
      
      if (response.isSuccess) {
        toast.success("Tạo tin tuyển dụng thành công!");
        navigate("/recruiter/jobs");
      } else {
        const errorMsg = response.errorMessages?.length > 0 
          ? response.errorMessages[0] 
          : "Có lỗi xảy ra khi tạo tin tuyển dụng";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      
      // Collect all error messages
      const errorMessages: string[] = [];
      
      // Check for validation errors (RFC 9110 format)
      if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        Object.entries(error.response.data.errors).forEach(([, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => {
              errorMessages.push(msg);
            });
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        });
      }
      
      // Check for business logic error messages
      if (error.response?.data?.errorMessages && Array.isArray(error.response.data.errorMessages)) {
        error.response.data.errorMessages.forEach((msg: string) => {
          errorMessages.push(msg);
        });
      }
      
      // If we have collected error messages from above, use them
      if (errorMessages.length > 0) {
        errorMessages.forEach((msg: string) => {
          toast.error(msg);
        });
        return;
      }
      
      // Handle specific error messages from API
      let errorMessage = "Có lỗi xảy ra khi tạo tin tuyển dụng";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errorCode) {
        // Handle specific error codes
        switch (error.response.data.errorCode) {
          case "NotFoundRecruiter":
            errorMessage = "Bạn không có quyền tạo tin tuyển dụng";
            break;
          case "NotFoundPosition":
            errorMessage = "Vị trí tuyển dụng không tồn tại";
            break;
          case "NotFoundTaxonomy":
            errorMessage = "Kỹ năng không hợp lệ";
            break;
          case "NotFoundExtensionJob":
            errorMessage = "Gói gia hạn không tồn tại hoặc đã hết lượt sử dụng";
            break;
          case "NotFoundHighlightJob":
            errorMessage = "Gói nổi bật không tồn tại hoặc đã hết lượt sử dụng";
            break;
          default:
            errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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

                    {/* Vị trí tuyển dụng - Autocomplete */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Vị trí tuyển dụng *</Label>
                      
                      {loadingPositions ? (
                        <div className="text-sm text-gray-500">Đang tải danh sách vị trí...</div>
                      ) : (
                        <>
                          {/* Direct Input Autocomplete */}
                          <div className="relative">
                            <Input
                              type="text"
                              value={selectedPositionId ? positions.find(p => p.positionId === selectedPositionId)?.name || searchPosition : searchPosition}
                              onChange={(e) => {
                                setSearchPosition(e.target.value);
                                if (selectedPositionId) {
                                  setSelectedPositionId(null);
                                }
                                setOpenPositionPopover(e.target.value.length > 0);
                              }}
                              onFocus={() => {
                                if (!selectedPositionId && searchPosition.length > 0) {
                                  setOpenPositionPopover(true);
                                }
                              }}
                              placeholder="Nhập để tìm kiếm vị trí tuyển dụng..."
                              className={`h-12 text-base border-2 ${
                                !selectedPositionId ? "border-red-300" : "border-gray-300"
                              } focus:border-green-400`}
                            />
                            
                            {/* Dropdown Suggestions */}
                            {openPositionPopover && !selectedPositionId && searchPosition.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
                                {positions
                                  .filter(position => 
                                    position.name.toLowerCase().includes(searchPosition.toLowerCase())
                                  )
                                  .length > 0 ? (
                                  positions
                                    .filter(position => 
                                      position.name.toLowerCase().includes(searchPosition.toLowerCase())
                                    )
                                    .map((position) => (
                                      <div
                                        key={position.positionId}
                                        onClick={() => {
                                          setSelectedPositionId(position.positionId);
                                          setSearchPosition("");
                                          setOpenPositionPopover(false);
                                        }}
                                        className="px-4 py-3 hover:bg-green-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                      >
                                        <span className="text-sm">{position.name}</span>
                                      </div>
                                    ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    Không tìm thấy vị trí phù hợp
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected Position Display */}
                          {selectedPositionId && (
                            <div className="flex items-center gap-2 p-3 border-2 border-green-200 rounded-lg bg-green-50">
                              <Badge 
                                variant="secondary"
                                className="px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 text-sm flex items-center gap-2"
                              >
                                {positions.find(p => p.positionId === selectedPositionId)?.name || `ID: ${selectedPositionId}`}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPositionId(null);
                                    setSearchPosition("");
                                  }}
                                  className="ml-1 hover:bg-green-300 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </div>
                          )}
                          
                          {errorsStep1.positionId && (
                            <p className="text-sm text-red-500">{errorsStep1.positionId.message}</p>
                          )}
                          
                          {!selectedPositionId && (
                            <p className="text-sm text-red-500">Vui lòng chọn vị trí tuyển dụng</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Taxonomies/Skills - Direct Autocomplete */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Kỹ năng yêu cầu (1-5 kỹ năng) *</Label>
                      
                      {loadingTaxonomies ? (
                        <div className="text-sm text-gray-500">Đang tải danh sách kỹ năng...</div>
                      ) : (
                        <>
                          {/* Direct Input Autocomplete */}
                          <div className="relative">
                            <Input
                              type="text"
                              value={searchTaxonomy}
                              onChange={(e) => {
                                setSearchTaxonomy(e.target.value);
                                setOpenTaxonomyPopover(e.target.value.length > 0);
                              }}
                              onFocus={() => {
                                if (searchTaxonomy.length > 0) {
                                  setOpenTaxonomyPopover(true);
                                }
                              }}
                              placeholder={selectedTaxonomies.length >= 5 ? "Đã chọn tối đa 5 kỹ năng" : "Nhập để tìm kiếm kỹ năng..."}
                              disabled={selectedTaxonomies.length >= 5}
                              className={`h-12 text-base border-2 ${
                                selectedTaxonomies.length === 0 ? "border-red-300" : "border-gray-300"
                              } focus:border-green-400`}
                            />
                            
                            {/* Dropdown Suggestions */}
                            {openTaxonomyPopover && searchTaxonomy.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
                                {taxonomies
                                  .filter(taxonomy => 
                                    !selectedTaxonomies.includes(taxonomy.id) &&
                                    taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                                  )
                                  .length > 0 ? (
                                  taxonomies
                                    .filter(taxonomy => 
                                      !selectedTaxonomies.includes(taxonomy.id) &&
                                      taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                                    )
                                    .map((taxonomy) => (
                                      <div
                                        key={taxonomy.id}
                                        onClick={() => {
                                          if (selectedTaxonomies.length < 5) {
                                            const newTaxonomies = [...selectedTaxonomies, taxonomy.id];
                                            setSelectedTaxonomies(newTaxonomies);
                                            setValueStep1("taxonomyIds", newTaxonomies);
                                            setSearchTaxonomy("");
                                            setOpenTaxonomyPopover(false);
                                          }
                                        }}
                                        className="px-4 py-3 hover:bg-green-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                      >
                                        <Check className="h-4 w-4 text-green-600 opacity-0" />
                                        <span className="text-sm">{taxonomy.name}</span>
                                      </div>
                                    ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    Không tìm thấy kỹ năng phù hợp
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected Taxonomies as Badges */}
                          {selectedTaxonomies.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                              {selectedTaxonomies.map((taxonomyId) => {
                                const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                                return (
                                  <Badge 
                                    key={taxonomyId} 
                                    variant="secondary"
                                    className="px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 text-sm flex items-center gap-2"
                                  >
                                    {taxonomy?.name || `ID: ${taxonomyId}`}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newTaxonomies = selectedTaxonomies.filter(id => id !== taxonomyId);
                                        setSelectedTaxonomies(newTaxonomies);
                                        setValueStep1("taxonomyIds", newTaxonomies);
                                      }}
                                      className="ml-1 hover:bg-green-300 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          {/* Validation Messages
                          {selectedTaxonomies.length === 0 && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <span className="font-medium">⚠️</span> Phải chọn ít nhất 1 kỹ năng
                            </p>
                          )}
                          {selectedTaxonomies.length >= 5 && (
                            <p className="text-sm text-orange-500 flex items-center gap-1">
                              <span className="font-medium">ℹ️</span> Đã chọn tối đa 5 kỹ năng
                            </p>
                          )} */}
                          
                          {/* Counter */}
                          <div className="text-sm font-medium text-gray-600">
                            Đã chọn: <span className={selectedTaxonomies.length === 0 ? "text-red-500" : "text-green-600"}>
                              {selectedTaxonomies.length}
                            </span>/5 kỹ năng
                          </div>
                        </>
                      )}
                    </div>

                    {/* Opened Date */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Ngày mở tuyển dụng *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full h-12 justify-start text-left font-normal border-2 ${
                              !watchStep1("openedAt") ? "text-muted-foreground" : ""
                            } ${errorsStep1.openedAt ? "border-red-500" : "border-gray-300"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {watchStep1("openedAt") ? (
                              format(watchStep1("openedAt"), "PPP", { locale: vi })
                            ) : (
                              <span>Chọn ngày mở tuyển dụng</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={watchStep1("openedAt")}
                            onSelect={(date) => {
                              setValueStep1("openedAt", date || new Date());
                              // Auto-set expired date to 30 days later
                              if (date) {
                                const expiredDate = new Date(date);
                                expiredDate.setDate(expiredDate.getDate() + 30);
                                setValueStep1("expiredAt", expiredDate);
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errorsStep1.openedAt && (
                        <p className="text-sm text-red-500">{errorsStep1.openedAt.message}</p>
                      )}
                    </div>

                    {/* Expired Date */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Ngày hết hạn *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full h-12 justify-start text-left font-normal border-2 ${
                              !watchStep1("expiredAt") ? "text-muted-foreground" : ""
                            } ${errorsStep1.expiredAt ? "border-red-500" : "border-gray-300"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {watchStep1("expiredAt") ? (
                              format(watchStep1("expiredAt"), "PPP", { locale: vi })
                            ) : (
                              <span>Chọn ngày hết hạn</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={watchStep1("expiredAt")}
                            onSelect={(date) => setValueStep1("expiredAt", date || new Date())}
                            disabled={(date) => {
                              const openedDate = watchStep1("openedAt");
                              if (!openedDate) return true;
                              const minDate = new Date(openedDate);
                              minDate.setDate(minDate.getDate() + 1);
                              const maxDate = new Date(openedDate);
                              maxDate.setDate(maxDate.getDate() + 30);
                              return date <= openedDate || date > maxDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errorsStep1.expiredAt && (
                        <p className="text-sm text-red-500">{errorsStep1.expiredAt.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        💡 Ngày hết hạn phải trong vòng 30 ngày kể từ ngày mở tuyển dụng
                      </p>
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
                          className="text-red-500 hover:bg-red-500 hover:text-white"
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
                  
                  {/* Vị trí tuyển dụng */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Vị trí tuyển dụng:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">
                      {positions.find(p => p.positionId === selectedPositionId)?.name || "Chưa chọn"}
                    </p>
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
                    <Label className="text-base font-medium text-gray-700">Ngày mở tuyển dụng:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">
                      {jobData.openedAt instanceof Date ? jobData.openedAt.toLocaleDateString('vi-VN') : new Date(jobData.openedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Ngày hết hạn:</Label>
                    <p className="text-base text-gray-800 bg-gray-50 p-3 rounded">
                      {jobData.expiredAt instanceof Date ? jobData.expiredAt.toLocaleDateString('vi-VN') : new Date(jobData.expiredAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  {/* Highlight and Extension Job Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Gói nổi bật:</Label>
                    <div className="bg-gray-50 p-3 rounded">
                      {selectedHighlightId ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          {(() => {
                            const pkg = highlightJobs.find(j => j.id === selectedHighlightId);
                            return pkg ? `Gói nổi bật ${pkg.highlightJobDays} ngày` : `Gói #${selectedHighlightId}`;
                          })()}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Không chọn</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Gói gia hạn:</Label>
                    <div className="bg-gray-50 p-3 rounded">
                      {selectedExtensionId ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {(() => {
                            const pkg = extensionJobs.find(j => j.id === selectedExtensionId);
                            return pkg ? `Gói gia hạn ${pkg.extensionJobDays} ngày` : `Gói #${selectedExtensionId}`;
                          })()}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Không chọn</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Mô tả:</Label>
                    <div className="text-base text-gray-800 bg-gray-50 p-4 rounded max-h-32 overflow-y-auto">
                      {jobData.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Review and Additional Options */}
              <div className="space-y-8">
                {/* Highlight and Extension Job Selection */}
                <Card className="border-green-200 shadow-lg">
                  <CardHeader className="bg-green-50 border-b border-green-200">
                    <CardTitle className="flex items-center space-x-2 text-green-800 text-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span>Gói nâng cấp (Tùy chọn)</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">Chọn gói nổi bật hoặc gia hạn cho tin tuyển dụng</p>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Highlight Job Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Gói nổi bật</Label>
                      {loadingHighlights ? (
                        <p className="text-sm text-gray-500">Đang tải...</p>
                      ) : (
                        <Select
                          value={selectedHighlightId?.toString() || "none"}
                          onValueChange={(value) => setSelectedHighlightId(value === "none" ? undefined : parseInt(value))}
                        >
                          <SelectTrigger className="h-12 text-base border-2 focus:border-green-400">
                            <SelectValue placeholder="Chọn gói nổi bật" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Không chọn</SelectItem>
                            {highlightJobs.length === 0 ? (
                              <SelectItem value="empty" disabled>Không có gói khả dụng</SelectItem>
                            ) : (
                              highlightJobs.map(job => (
                                <SelectItem 
                                  key={job.id} 
                                  value={job.id.toString()}
                                  disabled={job.highlightJobDaysCount <= 0}
                                >
                                  Gói nổi bật {job.highlightJobDays} ngày (còn {job.highlightJobDaysCount} lượt)
                                  {job.highlightJobDaysCount <= 0 && " - Đã hết"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      <p className="text-xs text-gray-500">💡 Giúp tin tuyển dụng nổi bật hơn</p>
                    </div>

                    {/* Extension Job Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium text-gray-700">Gói gia hạn</Label>
                      {loadingExtensions ? (
                        <p className="text-sm text-gray-500">Đang tải...</p>
                      ) : (
                        <Select
                          value={selectedExtensionId?.toString() || "none"}
                          onValueChange={(value) => setSelectedExtensionId(value === "none" ? undefined : parseInt(value))}
                        >
                          <SelectTrigger className="h-12 text-base border-2 focus:border-green-400">
                            <SelectValue placeholder="Chọn gói gia hạn" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Không chọn</SelectItem>
                            {extensionJobs.length === 0 ? (
                              <SelectItem value="empty" disabled>Không có gói khả dụng</SelectItem>
                            ) : (
                              extensionJobs.map(job => (
                                <SelectItem 
                                  key={job.id} 
                                  value={job.id.toString()}
                                  disabled={job.extensionJobDaysCount <= 0}
                                >
                                  Gói gia hạn {job.extensionJobDays} ngày (còn {job.extensionJobDaysCount} lượt)
                                  {job.extensionJobDaysCount <= 0 && " - Đã hết"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      <p className="text-xs text-gray-500">💡 Kéo dài thời gian hiển thị tin tuyển dụng</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Review */}
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