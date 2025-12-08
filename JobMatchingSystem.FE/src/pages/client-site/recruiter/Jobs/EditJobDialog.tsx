import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Import services và types
import { JobServices } from "@/services/job.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { PositionService } from "@/services/position.service";
import { type Job } from "@/models/job";
import { type Taxonomy } from "@/models/taxonomy";
import { type Position } from "@/models/position";

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề công việc là bắt buộc").max(200, "Tiêu đề không được quá 200 ký tự"),
  description: z.string().min(1, "Mô tả công việc là bắt buộc"),
  requirements: z.string().min(1, "Yêu cầu công việc là bắt buộc"),
  benefits: z.string().optional(),
  location: z.string().min(1, "Địa điểm làm việc là bắt buộc"),
  salaryMin: z.number().min(0, "Lương tối thiểu phải lớn hơn 0").optional().nullable(),
  salaryMax: z.number().min(0, "Lương tối đa phải lớn hơn 0").optional().nullable(),
  experienceYear: z.number().min(0, "Số năm kinh nghiệm không được âm").max(50, "Số năm kinh nghiệm không được quá 50"),
  jobType: z.string().min(1, "Loại công việc là bắt buộc"),
  positionId: z.number().min(1, "Vị trí tuyển dụng là bắt buộc"),
  taxonomyIds: z.array(z.number()).min(1, "Phải chọn ít nhất 1 kỹ năng").max(5, "Chỉ được chọn tối đa 5 kỹ năng"),
  openedAt: z.date({ required_error: "Ngày mở tuyển dụng là bắt buộc" }),
  expiredAt: z.date({ required_error: "Ngày hết hạn là bắt buộc" }),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface EditJobDialogProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditJobDialog({ job, isOpen, onClose, onSave }: EditJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  const [searchTaxonomy, setSearchTaxonomy] = useState("");
  const [openTaxonomyPopover, setOpenTaxonomyPopover] = useState(false);
  const [isNegotiableSalary, setIsNegotiableSalary] = useState(false);
  
  // Position selection
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [searchPosition, setSearchPosition] = useState("");
  const [openPositionPopover, setOpenPositionPopover] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      benefits: "",
      location: "",
      salaryMin: null,
      salaryMax: null,
      experienceYear: 0,
      jobType: "FullTime",
      positionId: 0,
      taxonomyIds: [],
      openedAt: new Date(),
      expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
    }
  });

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      const formData = {
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        location: job.location || "",
        salaryMin: job.salaryMin || null,
        salaryMax: job.salaryMax || null,
        experienceYear: job.experienceYear || 0,
        jobType: job.jobType || "FullTime",
        positionId: job.positionId || 0,
        taxonomyIds: job.taxonomies ? job.taxonomies.map(t => t.id) : [],
        openedAt: job.openedAt ? new Date(job.openedAt) : new Date(),
        expiredAt: job.expiredAt ? new Date(job.expiredAt) : new Date(new Date().setDate(new Date().getDate() + 30)),
      };
      
      console.log("Resetting form with data:", formData);
      console.log("Original job data:", job);
      
      reset(formData);
      
      // Force set values to ensure Select displays correctly
      setValue("jobType", formData.jobType);
      setValue("taxonomyIds", formData.taxonomyIds);
      setValue("openedAt", formData.openedAt);
      setValue("expiredAt", formData.expiredAt);
      
      // Set position
      if (job.positionId) {
        setSelectedPositionId(job.positionId);
        setValue("positionId", job.positionId);
      }
      
      // Set negotiable salary state
      setIsNegotiableSalary(!job.salaryMin && !job.salaryMax);
    }
  }, [job, reset, setValue]);

  // Load taxonomies
  useEffect(() => {
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

    fetchTaxonomies();
    fetchPositions();
  }, []);

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsLoading(true);

      // Validate salary range
      if (data.salaryMin && data.salaryMax && data.salaryMin >= data.salaryMax) {
        alert("Lương tối thiểu phải nhỏ hơn lương tối đa");
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
        alert("Ngày mở tuyển dụng không được nhỏ hơn ngày hiện tại");
        return;
      }

      if (expiredDate <= openedDate) {
        alert("Ngày hết hạn phải lớn hơn ngày mở tuyển dụng");
        return;
      }

      const daysDiff = Math.ceil((expiredDate.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        alert("Ngày hết hạn không được quá 30 ngày so với ngày mở tuyển dụng");
        return;
      }

      // Prepare update request - Only send fields that user can edit
      const updateRequest: any = {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        experienceYear: data.experienceYear,
        jobType: data.jobType, // Backend expects string (FullTime, PartTime, Remote)
        positionId: selectedPositionId || data.positionId,
        taxonomyIds: data.taxonomyIds,
        openedAt: data.openedAt instanceof Date ? data.openedAt.toISOString() : new Date(data.openedAt).toISOString(),
        expiredAt: data.expiredAt instanceof Date ? data.expiredAt.toISOString() : new Date(data.expiredAt).toISOString(),
      };

      // Only include optional fields if they have values
      if (data.benefits) {
        updateRequest.benefits = data.benefits;
      }
      
      if (data.salaryMin !== null && data.salaryMin !== undefined) {
        updateRequest.salaryMin = data.salaryMin;
      }
      
      if (data.salaryMax !== null && data.salaryMax !== undefined) {
        updateRequest.salaryMax = data.salaryMax;
      }

      console.log("Updating job with data:", updateRequest);

      // Call API
      const response = await JobServices.update(job.jobId.toString(), updateRequest);
      
      if (response.isSuccess) {
        onSave(); // Refresh parent component data
        onClose(); // Close dialog
        alert("Cập nhật tin tuyển dụng thành công!");
      } else {
        alert("Có lỗi xảy ra khi cập nhật tin tuyển dụng");
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message?.includes("CantUpdate")) {
        alert("Không thể cập nhật tin tuyển dụng đã có ứng viên ứng tuyển");
      } else if (error.message?.includes("NotFoundRecruiter")) {
        alert("Bạn không có quyền chỉnh sửa tin tuyển dụng này");
      } else {
        alert("Có lỗi xảy ra khi cập nhật tin tuyển dụng. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                ✏️ Chỉnh sửa tin tuyển dụng
              </h2>
              <p className="text-sm text-blue-600 mt-1">Cập nhật thông tin công việc của bạn</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full h-10 w-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="p-6 overflow-y-auto" style={{ height: 'calc(85vh - 140px)' }}>
            <div className="space-y-6">
              
              {/* Thông tin cơ bản */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="text-blue-800 text-lg">📋 Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-medium text-gray-700">Tiêu đề công việc *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Nhập tiêu đề công việc..."
                      className={`h-11 text-base border-2 focus:border-blue-400 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-base font-medium text-gray-700">Địa điểm làm việc *</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="Nhập địa điểm làm việc..."
                      className={`h-11 text-base border-2 focus:border-blue-400 ${errors.location ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-3">
                    <Label htmlFor="jobType" className="text-base font-medium text-gray-700">Loại công việc *</Label>
                    <Select
                      value={watch("jobType") || "FullTime"}
                      onValueChange={(value) => {
                        console.log("Job type changing to:", value);
                        setValue("jobType", value);
                      }}
                    >
                      <SelectTrigger className={`h-11 text-base border-2 focus:border-blue-400 ${errors.jobType ? "border-red-500" : "border-gray-300"}`}>
                        <SelectValue placeholder="Chọn loại công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                        <SelectItem value="PartTime">Bán thời gian</SelectItem>
                        <SelectItem value="Remote">Làm từ xa</SelectItem>
                        <SelectItem value="Other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.jobType && (
                      <p className="text-sm text-red-500">{errors.jobType.message}</p>
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
                      {...register("experienceYear", { valueAsNumber: true })}
                      placeholder="Nhập số năm kinh nghiệm..."
                      className={`h-11 text-base border-2 focus:border-blue-400 ${errors.experienceYear ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.experienceYear && (
                      <p className="text-sm text-red-500">{errors.experienceYear.message}</p>
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
                            className={`h-11 text-base border-2 ${
                              !selectedPositionId ? "border-red-300" : "border-gray-300"
                            } focus:border-blue-400`}
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
                                        setValue("positionId", position.positionId);
                                        setSearchPosition("");
                                        setOpenPositionPopover(false);
                                      }}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
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
                          <div className="flex items-center gap-2 p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                            <Badge 
                              variant="secondary"
                              className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm flex items-center gap-2"
                            >
                              {positions.find(p => p.positionId === selectedPositionId)?.name || `ID: ${selectedPositionId}`}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPositionId(null);
                                  setValue("positionId", 0);
                                  setSearchPosition("");
                                }}
                                className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </div>
                        )}
                        
                        {errors.positionId && (
                          <p className="text-sm text-red-500">{errors.positionId.message}</p>
                        )}
                        
                        {!selectedPositionId && (
                          <p className="text-sm text-red-500">Vui lòng chọn vị trí tuyển dụng</p>
                        )}
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
                          className={`w-full h-11 justify-start text-left font-normal border-2 ${
                            !watch("openedAt") ? "text-muted-foreground" : ""
                          } ${errors.openedAt ? "border-red-500" : "border-gray-300"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch("openedAt") ? (
                            format(watch("openedAt"), "PPP", { locale: vi })
                          ) : (
                            <span>Chọn ngày mở tuyển dụng</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch("openedAt")}
                          onSelect={(date) => {
                            setValue("openedAt", date || new Date());
                            // Auto-set expired date to 30 days later
                            if (date) {
                              const expiredDate = new Date(date);
                              expiredDate.setDate(expiredDate.getDate() + 30);
                              setValue("expiredAt", expiredDate);
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
                    {errors.openedAt && (
                      <p className="text-sm text-red-500">{errors.openedAt.message}</p>
                    )}
                  </div>

                  {/* Expired Date */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Ngày hết hạn *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-start text-left font-normal border-2 ${
                            !watch("expiredAt") ? "text-muted-foreground" : ""
                          } ${errors.expiredAt ? "border-red-500" : "border-gray-300"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch("expiredAt") ? (
                            format(watch("expiredAt"), "PPP", { locale: vi })
                          ) : (
                            <span>Chọn ngày hết hạn</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch("expiredAt")}
                          onSelect={(date) => setValue("expiredAt", date || new Date())}
                          disabled={(date) => {
                            const openedDate = watch("openedAt");
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
                    {errors.expiredAt && (
                      <p className="text-sm text-red-500">{errors.expiredAt.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      💡 Ngày hết hạn phải trong vòng 30 ngày kể từ ngày mở tuyển dụng
                    </p>
                  </div>

                  {/* Taxonomies/Skills - Autocomplete */}
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
                            placeholder={(watch("taxonomyIds") || []).length >= 5 ? "Đã chọn tối đa 5 kỹ năng" : "Nhập để tìm kiếm kỹ năng..."}
                            disabled={(watch("taxonomyIds") || []).length >= 5}
                            className={`h-11 text-base border-2 ${
                              (watch("taxonomyIds") || []).length === 0 ? "border-red-300" : "border-gray-300"
                            } focus:border-blue-400`}
                          />
                          
                          {/* Dropdown Suggestions */}
                          {openTaxonomyPopover && searchTaxonomy.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
                              {taxonomies
                                .filter(taxonomy => 
                                  !(watch("taxonomyIds") || []).includes(taxonomy.id) &&
                                  taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                                )
                                .length > 0 ? (
                                taxonomies
                                  .filter(taxonomy => 
                                    !(watch("taxonomyIds") || []).includes(taxonomy.id) &&
                                    taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                                  )
                                  .map((taxonomy) => (
                                    <div
                                      key={taxonomy.id}
                                      onClick={() => {
                                        const currentIds = watch("taxonomyIds") || [];
                                        if (currentIds.length < 5) {
                                          const newIds = [...currentIds, taxonomy.id];
                                          setValue("taxonomyIds", newIds);
                                          setSearchTaxonomy("");
                                          setOpenTaxonomyPopover(false);
                                        }
                                      }}
                                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                    >
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
                        {(watch("taxonomyIds") || []).length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                            {(watch("taxonomyIds") || []).map((taxonomyId) => {
                              const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                              return (
                                <Badge 
                                  key={taxonomyId} 
                                  variant="secondary"
                                  className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm flex items-center gap-2"
                                >
                                  {taxonomy?.name || `ID: ${taxonomyId}`}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentIds = watch("taxonomyIds") || [];
                                      const newIds = currentIds.filter(id => id !== taxonomyId);
                                      setValue("taxonomyIds", newIds);
                                    }}
                                    className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                        
                        {errors.taxonomyIds && (
                          <p className="text-sm text-red-500">{errors.taxonomyIds.message}</p>
                        )}
                        
                        {/* Counter */}
                        <div className="text-sm font-medium text-gray-600">
                          Đã chọn: <span className={(watch("taxonomyIds") || []).length === 0 ? "text-red-500" : "text-blue-600"}>
                            {(watch("taxonomyIds") || []).length}
                          </span>/5 kỹ năng
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mức lương */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="text-blue-800 text-lg">💰 Mức lương</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Lương thỏa thuận checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="negotiableSalary"
                      checked={isNegotiableSalary}
                      onCheckedChange={(checked: boolean) => {
                        setIsNegotiableSalary(checked);
                        if (checked) {
                          setValue("salaryMin", null);
                          setValue("salaryMax", null);
                        }
                      }}
                      className="h-5 w-5 text-blue-600"
                    />
                    <Label htmlFor="negotiableSalary" className="text-base font-medium text-gray-700 cursor-pointer">
                      Lương thỏa thuận
                    </Label>
                  </div>
                  
                  {!isNegotiableSalary && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="salaryMin" className="text-base font-medium text-gray-700">Lương tối thiểu (VND)</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          min="0"
                          {...register("salaryMin", { valueAsNumber: true })}
                          placeholder="Nhập lương tối thiểu..."
                          className={`h-11 text-base border-2 focus:border-blue-400 ${errors.salaryMin ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.salaryMin && (
                          <p className="text-sm text-red-500">{errors.salaryMin.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="salaryMax" className="text-base font-medium text-gray-700">Lương tối đa (VND)</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          min="0"
                          {...register("salaryMax", { valueAsNumber: true })}
                          placeholder="Nhập lương tối đa..."
                          className={`h-11 text-base border-2 focus:border-blue-400 ${errors.salaryMax ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.salaryMax && (
                          <p className="text-sm text-red-500">{errors.salaryMax.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isNegotiableSalary && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        💼 Mức lương sẽ được thỏa thuận trong quá trình phỏng vấn
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mô tả chi tiết */}
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="text-blue-800 text-lg">📑 Mô tả chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-medium text-gray-700">Mô tả công việc *</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      {...register("description")}
                      placeholder="Mô tả chi tiết về công việc..."
                      className={`text-base border-2 focus:border-blue-400 resize-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-3">
                    <Label htmlFor="requirements" className="text-base font-medium text-gray-700">Yêu cầu công việc *</Label>
                    <Textarea
                      id="requirements"
                      rows={5}
                      {...register("requirements")}
                      placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                      className={`text-base border-2 focus:border-blue-400 resize-none ${errors.requirements ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.requirements && (
                      <p className="text-sm text-red-500">{errors.requirements.message}</p>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <Label htmlFor="benefits" className="text-base font-medium text-gray-700">Quyền lợi</Label>
                    <Textarea
                      id="benefits"
                      rows={4}
                      {...register("benefits")}
                      placeholder="Các quyền lợi và phúc lợi..."
                      className={`text-base border-2 focus:border-blue-400 resize-none ${errors.benefits ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.benefits && (
                      <p className="text-sm text-red-500">{errors.benefits.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="mr-2 w-4 h-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 w-4 h-4" />
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}