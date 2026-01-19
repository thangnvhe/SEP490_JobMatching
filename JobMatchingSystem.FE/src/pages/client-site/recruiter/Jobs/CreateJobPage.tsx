import { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  MapPin,
  Loader2
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

// Import services
import { JobServices } from "@/services/job.service";
import { UserServices } from "@/services/user.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { PositionService } from "@/services/position.service";
import { ExtensionJobServices } from "@/services/extension-job.service";
import { HighlightJobServices } from "@/services/highlight-job.service";
import { SystemConfigService } from "@/services/system-config.service";
import { type Taxonomy } from "@/models/taxonomy";
import { type Position } from "@/models/position";
import { type User } from "@/models/user";
import { type ExtensionJob } from "@/models/extension-job";
import { type HighlightJob } from "@/models/highlight-job";
import { type SystemConfig } from "@/models/system-config";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { VIETMAP_API_KEY } from "@/../env";

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

interface LocationSuggestion {
  ref_id: string;
  address: string;
  name: string;
  display: string;
  boundaries?: number[];
  categories?: string[];
}

// Step 1: Job Information Schema
const step1Schema = z.object({
  title: z.string().min(1, "Tiêu đề công việc là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().min(50, "Mô tả công việc phải có ít nhất 50 ký tự"),
  requirements: z.string().min(1, "Yêu cầu công việc là bắt buộc"),
  benefits: z.string().min(1, "Quyền lợi là bắt buộc"),
  location: z.string().min(1, "Địa điểm làm việc là bắt buộc"),
  salaryMin: z.number()
    .min(0, "Lương tối thiểu phải lớn hơn hoặc bằng 0")
    .max(999999999, "Lương tối thiểu không được vượt quá 999,999,999 VND")
    .optional()
    .nullable(),
  salaryMax: z.number()
    .min(0, "Lương tối đa phải lớn hơn hoặc bằng 0")
    .max(999999999, "Lương tối đa không được vượt quá 999,999,999 VND")
    .optional()
    .nullable(),
  experienceYear: z.number().min(0, "Số năm kinh nghiệm không được âm").max(50, "Số năm kinh nghiệm không được quá 50"),
  educationLevel: z.string().min(1, "Trình độ là bắt buộc"),
  jobType: z.string().min(1, "Loại công việc là bắt buộc"),
  positionId: z.number().min(1, "Vị trí tuyển dụng là bắt buộc"),
  openedAt: z.date({ required_error: "Ngày mở tuyển dụng là bắt buộc" }),
  expiredAt: z.date({ required_error: "Ngày hết hạn là bắt buộc" }),
  taxonomyIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 kỹ năng"), // Bắt buộc ít nhất 1, không giới hạn trên
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
  
  // Location autocomplete
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocationSuggestions, setLoadingLocationSuggestions] = useState(false);
  const debouncedLocationInput = useDebounce(locationInput, 500);
  const locationInputRef = useRef<HTMLInputElement>(null);
  
  // Extension and Highlight Jobs
  const [extensionJobs, setExtensionJobs] = useState<ExtensionJob[]>([]);
  const [highlightJobs, setHighlightJobs] = useState<HighlightJob[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(true);
  const [loadingHighlights, setLoadingHighlights] = useState(true);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | undefined>(undefined);
  const [selectedHighlightId, setSelectedHighlightId] = useState<number | undefined>(undefined);
  
  // Education Levels
  const [educationLevels, setEducationLevels] = useState<SystemConfig[]>([]);
  const [loadingEducationLevels, setLoadingEducationLevels] = useState(true);
  
  // Step 1: Job Information
  const [jobData, setJobData] = useState<Step1FormData>({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    salaryMin: 0,
    salaryMax: 0,
    experienceYear: 0,
    educationLevel: "",
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
    trigger: triggerStep1,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ...jobData,
      benefits: jobData.benefits || "", // Ensure benefits is always a string
      educationLevel: "",
      openedAt: new Date(),
      expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      taxonomyIds: [], // Initialize with empty array
      salaryMin: 0, // Default value for minimum salary
      salaryMax: 0, // Default value for maximum salary
    },
    mode: "onChange", // Validate khi onChange để clear lỗi ngay khi nhập đúng
    reValidateMode: "onChange", // Re-validate khi onChange
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

    const fetchEducationLevels = async () => {
      try {
        setLoadingEducationLevels(true);
        const response = await SystemConfigService.getAllConfigs();
        
        if (response.isSuccess && response.result) {
          const educationLevelConfigs = response.result.filter(
            (config: SystemConfig) => config.type === "education_level"
          );
          console.log(educationLevelConfigs);
          setEducationLevels(educationLevelConfigs);
        } else {
          console.warn("Could not load education levels");
          setEducationLevels([]);
        }
      } catch (error) {
        console.warn("Error loading education levels:", error);
        setEducationLevels([]);
      } finally {
        setLoadingEducationLevels(false);
      }
    };

    // Only fetch if user is authenticated, otherwise just set loading to false
    if (authState.isAuthenticated) {
      fetchHiringManagers();
      fetchTaxonomies();
      fetchPositions();
      fetchExtensionJobs();
      fetchHighlightJobs();
      fetchEducationLevels();
    } else {
      setLoadingHiringManagers(false);
      setLoadingTaxonomies(false);
      setLoadingPositions(false);
      setLoadingExtensions(false);
      setLoadingHighlights(false);
      setLoadingEducationLevels(false);
      setHiringManagers([]);
      setTaxonomies([]);
      setPositions([]);
      setExtensionJobs([]);
      setHighlightJobs([]);
      setEducationLevels([]);
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

  // Fetch location suggestions from Vietmap API
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (!debouncedLocationInput || debouncedLocationInput.trim().length < 2) {
        setLocationSuggestions([]);
        return;
      }

      setLoadingLocationSuggestions(true);
      try {
        // Sử dụng Vietmap API để tìm kiếm địa chỉ ở Việt Nam
        const response = await fetch(
          `https://maps.vietmap.vn/api/autocomplete/v3?` +
          `apikey=${VIETMAP_API_KEY}` +
          `&text=${encodeURIComponent(debouncedLocationInput)}` +
          `&focus=16.047079,108.206230`, // Tọa độ trung tâm Việt Nam (Đà Nẵng) để ưu tiên kết quả gần
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Vietmap trả về array trực tiếp
          if (Array.isArray(data) && data.length > 0) {
            setLocationSuggestions(data.slice(0, 5)); // Giới hạn 5 kết quả
            setShowLocationSuggestions(true);
          } else {
            setLocationSuggestions([]);
          }
        } else {
          console.error("Error fetching location suggestions from Vietmap");
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setLocationSuggestions([]);
      } finally {
        setLoadingLocationSuggestions(false);
      }
    };

    fetchLocationSuggestions();
  }, [debouncedLocationInput]);

  // Close location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        const suggestionDropdown = document.querySelector('.location-suggestions-dropdown');
        if (suggestionDropdown && !suggestionDropdown.contains(event.target as Node)) {
          setShowLocationSuggestions(false);
        }
      }
    };

    if (showLocationSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLocationSuggestions]);

  // Sync locationInput with form value when navigating between steps
  useEffect(() => {
    const currentLocation = watchStep1("location");
    if (currentLocation && !locationInput) {
      setLocationInput(currentLocation);
    }
  }, [currentStep, watchStep1, locationInput]);

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
    
    // Validate salary - phải chọn một trong hai: thỏa thuận hoặc nhập cả min và max
    if (!isNegotiableSalary) {
      if (!data.salaryMin || !data.salaryMax) {
        toast.error("Vui lòng nhập cả lương tối thiểu và lương tối đa, hoặc chọn 'Lương thỏa thuận'");
        return;
      }
      if (data.salaryMin >= data.salaryMax) {
        toast.error("Lương tối thiểu phải nhỏ hơn lương tối đa");
        return;
      }
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
    if (currentStep < 3) {
      if (currentStep === 1) {
        handleSubmitStep1(onStep1Submit)();
      } else if (currentStep === 2) {
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
    } else {
      // Set default values to 0 when negotiable is unselected
      setValueStep1("salaryMin", 0);
      setValueStep1("salaryMax", 0);
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
        systemConfigEducationLevelId: jobData.educationLevel ? parseInt(jobData.educationLevel, 10) : undefined,
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

  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmitStep1(onStep1Submit)} className="space-y-10">
            {/* Thông tin cơ bản */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h3>
                <p className="text-sm text-gray-500">Điền các thông tin cơ bản về vị trí tuyển dụng</p>
              </div>
              <Separator />
              
              <div className="space-y-6">
                {/* Dòng 1: Tiêu đề - Loại công việc */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Tiêu đề công việc *</Label>
                    <Input
                      id="title"
                      {...registerStep1("title", {
                        onBlur: () => triggerStep1("title")
                      })}
                      placeholder="VD: Senior Frontend Developer"
                      className={`w-full ${errorsStep1.title ? "border-red-500" : ""}`}
                    />
                    {errorsStep1.title && (
                      <p className="text-sm text-red-500">{errorsStep1.title.message}</p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label htmlFor="jobType" className="text-sm font-medium">Loại công việc *</Label>
                    <Select
                      value={watchStep1("jobType")}
                      onValueChange={(value) => {
                        setValueStep1("jobType", value);
                        triggerStep1("jobType");
                      }}
                    >
                      <SelectTrigger className={`w-full ${errorsStep1.jobType ? "border-red-500" : ""}`}>
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
                </div>

                {/* Dòng 2: Địa điểm làm việc (full width) */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Location with Autocomplete */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Địa điểm làm việc *
                    </Label>
                    <div className="relative">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          ref={locationInputRef}
                          id="location"
                          type="text"
                          value={locationInput || watchStep1("location") || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLocationInput(value);
                            setValueStep1("location", value);
                            if (value.trim().length >= 2) {
                              setShowLocationSuggestions(true);
                            } else {
                              setShowLocationSuggestions(false);
                            }
                            // Trigger validation khi người dùng nhập
                            if (value.trim().length > 0) {
                              triggerStep1("location");
                            }
                          }}
                          onFocus={() => {
                            if (locationInput.trim().length >= 2 && locationSuggestions.length > 0) {
                              setShowLocationSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Trigger validation khi blur
                            triggerStep1("location");
                            // Delay để cho phép click vào suggestion
                            setTimeout(() => {
                              setShowLocationSuggestions(false);
                            }, 200);
                          }}
                          placeholder="VD: Đường Lê Duẩn, Quận 1, TP.HCM..."
                          className={`w-full pl-10 ${errorsStep1.location ? "border-red-500" : ""}`}
                        />
                        {loadingLocationSuggestions && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                        )}
                      </div>

                      {/* Location Suggestions Dropdown */}
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div className="location-suggestions-dropdown absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                          {locationSuggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.ref_id || index}
                              onClick={() => {
                                const address = suggestion.display || suggestion.address;
                                setLocationInput(address);
                                setValueStep1("location", address);
                                triggerStep1("location");
                                setShowLocationSuggestions(false);
                                setLocationSuggestions([]);
                              }}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex items-start gap-2"
                            >
                              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                {suggestion.name && suggestion.name !== suggestion.address && (
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {suggestion.name}
                                  </p>
                                )}
                                <p className={`text-sm text-gray-600 ${suggestion.name ? 'text-xs' : ''}`}>
                                  {suggestion.display || suggestion.address}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No results message */}
                      {showLocationSuggestions && 
                       locationInput.trim().length >= 2 && 
                       !loadingLocationSuggestions && 
                       locationSuggestions.length === 0 && (
                        <div className="location-suggestions-dropdown absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
                          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                            Không tìm thấy địa chỉ phù hợp
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {errorsStep1.location && (
                      <p className="text-sm text-red-500">{errorsStep1.location.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Tìm kiếm địa chỉ theo Vietmap - Nhập tối thiểu 2 ký tự
                    </p>
                  </div>
                </div>

                {/* Dòng 3: Trình độ - Số năm kinh nghiệm */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Education Level */}
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel" className="text-sm font-medium">Trình độ *</Label>
                    {loadingEducationLevels ? (
                      <div className="text-sm text-muted-foreground">Đang tải...</div>
                    ) : (
                      <>
                        <Select
                          value={watchStep1("educationLevel")}
                          onValueChange={(value) => {
                            setValueStep1("educationLevel", value);
                            triggerStep1("educationLevel");
                          }}
                        >
                          <SelectTrigger className={`w-full ${errorsStep1.educationLevel ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Chọn trình độ" />
                          </SelectTrigger>
                          <SelectContent>
                            {educationLevels.length === 0 ? (
                              <SelectItem value="empty" disabled>Không có dữ liệu trình độ</SelectItem>
                            ) : (
                              educationLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id.toString()}>
                                  {level.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {errorsStep1.educationLevel && (
                          <p className="text-sm text-red-500">{errorsStep1.educationLevel.message}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Experience Year */}
                  <div className="space-y-2">
                    <Label htmlFor="experienceYear" className="text-sm font-medium">Số năm kinh nghiệm yêu cầu</Label>
                    <Input
                      id="experienceYear"
                      type="number"
                      min="0"
                      max="50"
                      {...registerStep1("experienceYear", { 
                        valueAsNumber: true,
                        onBlur: () => triggerStep1("experienceYear")
                      })}
                      placeholder="VD: 2"
                      className={`w-full ${errorsStep1.experienceYear ? "border-red-500" : ""}`}
                    />
                    {errorsStep1.experienceYear && (
                      <p className="text-sm text-red-500">{errorsStep1.experienceYear.message}</p>
                    )}
                  </div>
                </div>

                {/* Dòng 4: Ngày mở - Ngày hết hạn */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Opened Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ngày mở tuyển dụng *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !watchStep1("openedAt") ? "text-muted-foreground" : ""
                          } ${errorsStep1.openedAt ? "border-red-500" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchStep1("openedAt") ? (
                            formatDate(watchStep1("openedAt"))
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
                            if (date) {
                              setValueStep1("openedAt", date);
                              triggerStep1("openedAt");
                              // Tự động cập nhật ngày hết hạn khi chọn ngày mở
                              const expiredDate = new Date(date);
                              expiredDate.setDate(expiredDate.getDate() + 30);
                              setValueStep1("expiredAt", expiredDate);
                              triggerStep1("expiredAt");
                            } else {
                              setValueStep1("openedAt", new Date());
                              triggerStep1("openedAt");
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ngày hết hạn *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !watchStep1("expiredAt") ? "text-muted-foreground" : ""
                          } ${errorsStep1.expiredAt ? "border-red-500" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watchStep1("expiredAt") ? (
                            formatDate(watchStep1("expiredAt"))
                          ) : (
                            <span>Chọn ngày hết hạn</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watchStep1("expiredAt")}
                          onSelect={(date) => {
                            if (date) {
                              setValueStep1("expiredAt", date);
                              triggerStep1("expiredAt");
                            } else {
                              const openedDate = watchStep1("openedAt");
                              if (openedDate) {
                                const expiredDate = new Date(openedDate);
                                expiredDate.setDate(expiredDate.getDate() + 30);
                                setValueStep1("expiredAt", expiredDate);
                                triggerStep1("expiredAt");
                              } else {
                                setValueStep1("expiredAt", new Date());
                                triggerStep1("expiredAt");
                              }
                            }
                          }}
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
                    <p className="text-xs text-muted-foreground">
                      Ngày hết hạn phải trong vòng 30 ngày kể từ ngày mở tuyển dụng
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vị trí và Kỹ năng */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Vị trí và Kỹ năng</h3>
                <p className="text-sm text-gray-500">Chọn vị trí tuyển dụng và kỹ năng yêu cầu</p>
              </div>
              <Separator />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vị trí tuyển dụng */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vị trí tuyển dụng *</Label>
                  {loadingPositions ? (
                    <div className="text-sm text-muted-foreground">Đang tải...</div>
                  ) : (
                    <>
                      <div className="relative">
                        <Input
                          type="text"
                          value={selectedPositionId ? positions.find(p => p.positionId === selectedPositionId)?.name || searchPosition : searchPosition}
                          onChange={(e) => {
                            setSearchPosition(e.target.value);
                            if (selectedPositionId) {
                              setSelectedPositionId(null);
                              setValueStep1("positionId", 0);
                              triggerStep1("positionId");
                            }
                            setOpenPositionPopover(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            if (!selectedPositionId && searchPosition.length > 0) {
                              setOpenPositionPopover(true);
                            }
                          }}
                          onBlur={() => {
                            // Trigger validation khi blur
                            triggerStep1("positionId");
                          }}
                          placeholder="Tìm kiếm vị trí..."
                          className={errorsStep1.positionId ? "border-red-500" : ""}
                        />
                        
                        {openPositionPopover && !selectedPositionId && searchPosition.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
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
                                      setValueStep1("positionId", position.positionId);
                                      setSearchPosition("");
                                      setOpenPositionPopover(false);
                                      triggerStep1("positionId");
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                  >
                                    {position.name}
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                                Không tìm thấy vị trí phù hợp
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedPositionId && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {positions.find(p => p.positionId === selectedPositionId)?.name}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPositionId(null);
                                setSearchPosition("");
                                setValueStep1("positionId", 0);
                                triggerStep1("positionId");
                              }}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </div>
                      )}
                      
                      {errorsStep1.positionId && (
                        <p className="text-sm text-red-500">{errorsStep1.positionId.message}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Kỹ năng yêu cầu */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kỹ năng yêu cầu *</Label>
                  {loadingTaxonomies ? (
                    <div className="text-sm text-muted-foreground">Đang tải...</div>
                  ) : (
                    <>
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
                          onBlur={() => {
                            // Trigger validation khi blur
                            triggerStep1("taxonomyIds");
                          }}
                          placeholder="Tìm kiếm kỹ năng..."
                          className={errorsStep1.taxonomyIds ? "border-red-500" : ""}
                        />
                        
                        {openTaxonomyPopover && searchTaxonomy.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
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
                                      const newTaxonomies = [...selectedTaxonomies, taxonomy.id];
                                      setSelectedTaxonomies(newTaxonomies);
                                      setValueStep1("taxonomyIds", newTaxonomies);
                                      setSearchTaxonomy("");
                                      setOpenTaxonomyPopover(false);
                                      triggerStep1("taxonomyIds");
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                  >
                                    {taxonomy.name}
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                                Không tìm thấy kỹ năng phù hợp
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedTaxonomies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTaxonomies.map((taxonomyId) => {
                            const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                            return (
                              <Badge 
                                key={taxonomyId} 
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {taxonomy?.name || `ID: ${taxonomyId}`}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTaxonomies = selectedTaxonomies.filter(id => id !== taxonomyId);
                                    setSelectedTaxonomies(newTaxonomies);
                                    setValueStep1("taxonomyIds", newTaxonomies);
                                    triggerStep1("taxonomyIds");
                                  }}
                                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      {errorsStep1.taxonomyIds ? (
                        <p className="text-sm text-red-500">{errorsStep1.taxonomyIds.message}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Đã chọn: {selectedTaxonomies.length} kỹ năng
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Mô tả chi tiết</h3>
                <p className="text-sm text-gray-500">Mô tả công việc, yêu cầu và quyền lợi</p>
              </div>
              <Separator />
              
              <div className="space-y-5">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Mô tả công việc *</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    {...registerStep1("description", {
                      onBlur: () => triggerStep1("description")
                    })}
                    placeholder="Mô tả chi tiết về công việc, trách nhiệm chính..."
                    className={errorsStep1.description ? "border-red-500 resize-none" : "resize-none"}
                  />
                  {errorsStep1.description && (
                    <p className="text-sm text-red-500">{errorsStep1.description.message}</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-sm font-medium">Yêu cầu công việc *</Label>
                  <Textarea
                    id="requirements"
                    rows={5}
                    {...registerStep1("requirements", {
                      onBlur: () => triggerStep1("requirements")
                    })}
                    placeholder="Các yêu cầu về kỹ năng, kinh nghiệm, trình độ..."
                    className={errorsStep1.requirements ? "border-red-500 resize-none" : "resize-none"}
                  />
                  {errorsStep1.requirements && (
                    <p className="text-sm text-red-500">{errorsStep1.requirements.message}</p>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <Label htmlFor="benefits" className="text-sm font-medium">Quyền lợi *</Label>
                  <Textarea
                    id="benefits"
                    rows={4}
                    {...registerStep1("benefits", {
                      onBlur: () => triggerStep1("benefits")
                    })}
                    placeholder="Các quyền lợi và phúc lợi cho ứng viên..."
                    className={errorsStep1.benefits ? "border-red-500 resize-none" : "resize-none"}
                  />
                  {errorsStep1.benefits && (
                    <p className="text-sm text-red-500">{errorsStep1.benefits.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mức lương */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Mức lương</h3>
                <p className="text-sm text-gray-500">Thiết lập mức lương cho vị trí này</p>
              </div>
              <Separator />
              
              <div className="space-y-5">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="negotiableSalary"
                    checked={isNegotiableSalary}
                    onCheckedChange={handleNegotiableSalaryChange}
                  />
                  <Label htmlFor="negotiableSalary" className="text-sm font-medium cursor-pointer">
                    Lương thỏa thuận
                  </Label>
                </div>
                
                {!isNegotiableSalary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin" className="text-sm font-medium">Lương tối thiểu (VND)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        max="999999999"
                        {...registerStep1("salaryMin", { 
                          valueAsNumber: true,
                          onBlur: () => triggerStep1("salaryMin")
                        })}
                        placeholder="VD: 10000000"
                        className={errorsStep1.salaryMin ? "border-red-500" : ""}
                      />
                      {errorsStep1.salaryMin && (
                        <p className="text-sm text-red-500">{errorsStep1.salaryMin.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax" className="text-sm font-medium">Lương tối đa (VND)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        max="999999999"
                        {...registerStep1("salaryMax", { 
                          valueAsNumber: true,
                          onBlur: () => triggerStep1("salaryMax")
                        })}
                        placeholder="VD: 20000000"
                        className={errorsStep1.salaryMax ? "border-red-500" : ""}
                      />
                      {errorsStep1.salaryMax && (
                        <p className="text-sm text-red-500">{errorsStep1.salaryMax.message}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {isNegotiableSalary && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💼 Mức lương sẽ được thỏa thuận trong quá trình phỏng vấn
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Quy trình tuyển dụng</h3>
                <p className="text-sm text-gray-500">Thiết lập các giai đoạn tuyển dụng cho vị trí này</p>
              </div>
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
            </div>
            <Separator />
            
            <div className="space-y-6">
              {jobStages.map((stage, index) => (
                <div key={stage.stageNumber} className="border rounded-lg p-6 space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                        {index + 1}
                      </span>
                    
                    </h4>
                    {jobStages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJobStage(stage.stageNumber)}
                        className="text-red-500 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Tên giai đoạn */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tên giai đoạn *</Label>
                      <Input
                        value={stage.name}
                        onChange={(e) => updateJobStage(stage.stageNumber, 'name', e.target.value)}
                        placeholder="VD: Phỏng vấn sơ bộ"
                      />
                    </div>

                    {/* Hiring Manager */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Hiring Manager (Tùy chọn)</Label>
                      <Select
                        value={stage.hiringManagerId?.toString() || "none"}
                        onValueChange={(value) => updateJobStage(stage.stageNumber, 'hiringManagerId', value === "none" ? undefined : parseInt(value))}
                      >
                        <SelectTrigger>
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
                      <p className="text-xs text-muted-foreground">
                        Có thể để trống nếu chưa xác định được người phụ trách
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-10">
            {/* Thông tin công việc */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Thông tin công việc
                </h3>
                <p className="text-sm text-gray-500">Xem lại thông tin cơ bản của công việc</p>
              </div>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tiêu đề</Label>
                  <p className="text-base">{jobData.title}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Loại công việc</Label>
                  <p className="text-base">{getJobTypeLabel(jobData.jobType)}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Địa điểm</Label>
                  <p className="text-base">{jobData.location}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Trình độ</Label>
                  <p className="text-base">
                    {educationLevels.find(e => e.id.toString() === jobData.educationLevel)?.name || jobData.educationLevel}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Số năm kinh nghiệm</Label>
                  <p className="text-base">{jobData.experienceYear} năm</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Ngày mở tuyển dụng</Label>
                  <p className="text-base">
                    {jobData.openedAt instanceof Date ? jobData.openedAt.toLocaleDateString('vi-VN') : new Date(jobData.openedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Ngày hết hạn</Label>
                  <p className="text-base">
                    {jobData.expiredAt instanceof Date ? jobData.expiredAt.toLocaleDateString('vi-VN') : new Date(jobData.expiredAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Vị trí tuyển dụng</Label>
                  <p className="text-base">
                    {positions.find(p => p.positionId === selectedPositionId)?.name || "Chưa chọn"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Mức lương</Label>
                  <p className="text-base">
                    {isNegotiableSalary 
                      ? "Thỏa thuận" 
                      : (jobData.salaryMin && jobData.salaryMax 
                        ? `${jobData.salaryMin.toLocaleString()} - ${jobData.salaryMax.toLocaleString()} VND`
                        : "Thỏa thuận"
                      )
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Kỹ năng yêu cầu</Label>
                <div className="flex flex-wrap gap-2">
                  {(selectedTaxonomies || []).map((taxonomyId) => {
                    const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                    return (
                      <Badge key={taxonomyId} variant="secondary">
                        {taxonomy?.name || `ID: ${taxonomyId}`}
                      </Badge>
                    );
                  })}
                  {selectedTaxonomies.length === 0 && (
                    <span className="text-sm text-muted-foreground">Chưa chọn kỹ năng</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Mô tả công việc</Label>
                <div className="text-base bg-gray-50 p-4 rounded-lg border max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {jobData.description}
                </div>
              </div>
            </div>

            {/* Gói nâng cấp */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Gói nâng cấp (Tùy chọn)
                </h3>
                <p className="text-sm text-gray-500">Chọn gói nổi bật hoặc gia hạn cho tin tuyển dụng</p>
              </div>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Highlight Job Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gói nổi bật</Label>
                  {loadingHighlights ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (
                    <>
                      <Select
                        value={selectedHighlightId?.toString() || "none"}
                        onValueChange={(value) => setSelectedHighlightId(value === "none" ? undefined : parseInt(value))}
                      >
                        <SelectTrigger>
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
                      <p className="text-xs text-muted-foreground">Giúp tin tuyển dụng nổi bật hơn</p>
                    </>
                  )}
                </div>

                {/* Extension Job Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gói gia hạn</Label>
                  {loadingExtensions ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (
                    <>
                      <Select
                        value={selectedExtensionId?.toString() || "none"}
                        onValueChange={(value) => setSelectedExtensionId(value === "none" ? undefined : parseInt(value))}
                      >
                        <SelectTrigger>
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
                      <p className="text-xs text-muted-foreground">Kéo dài thời gian hiển thị tin tuyển dụng</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quy trình tuyển dụng */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Quy trình tuyển dụng
                </h3>
                <p className="text-sm text-gray-500">Xem lại các giai đoạn tuyển dụng</p>
              </div>
              <Separator />
              
              <div className="space-y-4">
                {jobStages.map((stage, index) => {
                  const manager = hiringManagers.find(m => m.id === stage.hiringManagerId);
                  return (
                    <div key={stage.stageNumber} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-base">{stage.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Phụ trách: {manager ? manager.name : 'Chưa xác định'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/recruiter/jobs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tạo tin tuyển dụng mới</h1>
            <p className="text-muted-foreground mt-2">
              Hoàn thành 3 bước để tạo tin tuyển dụng
            </p>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Left connector */}
                  <div className={`h-0.5 flex-1 transition-all ${
                    index === 0 
                      ? 'bg-transparent' 
                      : (currentStep > index ? 'bg-primary' : 'bg-gray-200')
                  }`} />

                  <div className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${currentStep === step.number 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : currentStep > step.number
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Right connector */}
                  <div className={`h-0.5 flex-1 transition-all ${
                    index === steps.length - 1 
                      ? 'bg-transparent' 
                      : (currentStep > step.number ? 'bg-primary' : 'bg-gray-200')
                  }`} />
                </div>
                <div className="text-center mt-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border shadow-sm p-8 min-h-[600px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between sticky bottom-0 bg-white/95 backdrop-blur-sm border-t p-4 rounded-lg shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? handleCancel : goToPrevStep}
            className="flex items-center gap-2"
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
              if (currentStep === 3) {
                createJob();
              } else {
                goToNextStep();
              }
            }}
            disabled={isLoading}
            className="flex items-center gap-2"
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