import React, { useEffect, useState } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Import UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Import services và types
import { JobServices } from "@/services/job.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { PositionService } from "@/services/position.service";
import { SystemConfigService } from "@/services/system-config.service";
import { type Job } from "@/models/job";
import { type Taxonomy } from "@/models/taxonomy";
import { type Position } from "@/models/position";
import { type SystemConfig } from "@/models/system-config";

// ===================== TYPES =====================

interface EditJobDialogProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceYear: number;
  systemConfigEducationLevelId: number;
  jobType: string;
  positionId: number;
  taxonomyIds: number[];
  openedAt: Date;
  expiredAt: Date;
}

// ===================== UTILITY FUNCTIONS =====================

const validateForm = (formData: JobFormData): string[] => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push("Tiêu đề công việc là bắt buộc");
  } else if (formData.title.length > 200) {
    errors.push("Tiêu đề không được quá 200 ký tự");
  }

  if (!formData.description.trim()) {
    errors.push("Mô tả công việc là bắt buộc");
  } else if (formData.description.trim().length < 50) {
    errors.push("Mô tả công việc phải có ít nhất 50 ký tự");
  }

  if (!formData.requirements.trim()) {
    errors.push("Yêu cầu công việc là bắt buộc");
  }

  if (!formData.location.trim()) {
    errors.push("Địa điểm làm việc là bắt buộc");
  }

  if (formData.experienceYear < 0 || formData.experienceYear > 50) {
    errors.push("Số năm kinh nghiệm phải từ 0 đến 50");
  }

  if (!formData.systemConfigEducationLevelId || formData.systemConfigEducationLevelId === 0) {
    errors.push("Trình độ là bắt buộc");
  }

  if (!formData.jobType) {
    errors.push("Loại công việc là bắt buộc");
  }

  if (!formData.positionId || formData.positionId === 0) {
    errors.push("Vị trí tuyển dụng là bắt buộc");
  }

  if (formData.taxonomyIds.length === 0) {
    errors.push("Phải chọn ít nhất 1 kỹ năng");
  }

  if (!formData.openedAt) {
    errors.push("Ngày mở tuyển dụng là bắt buộc");
  }

  if (!formData.expiredAt) {
    errors.push("Ngày hết hạn là bắt buộc");
  }

  return errors;
};

// ===================== MAIN COMPONENT =====================

export default function EditJobDialog({ job, isOpen, onClose, onSave }: EditJobDialogProps) {
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingEducationLevels, setLoadingEducationLevels] = useState(true);

  // Data states
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [educationLevels, setEducationLevels] = useState<SystemConfig[]>([]);

  // Form states
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    salaryMin: null,
    salaryMax: null,
    experienceYear: 0,
    systemConfigEducationLevelId: 0,
    jobType: "FullTime",
    positionId: 0,
    taxonomyIds: [],
    openedAt: new Date(),
    expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
  });

  // UI states
  const [isNegotiableSalary, setIsNegotiableSalary] = useState(false);
  const [searchTaxonomy, setSearchTaxonomy] = useState("");
  const [openTaxonomyPopover, setOpenTaxonomyPopover] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [searchPosition, setSearchPosition] = useState("");
  const [openPositionPopover, setOpenPositionPopover] = useState(false);

  // Load form data when job changes
  useEffect(() => {
    if (job && isOpen && educationLevels.length > 0) {
      // Get education level id from job
      let educationLevelId = job.systemConfigEducationLevelId || 0;
      
      // Fallback for backward compatibility if systemConfigEducationLevelId is not set
      if (!educationLevelId && (job as any).educationLevel) {
        const matchedLevel = educationLevels.find(
          level => level.value === (job as any).educationLevel || level.name === (job as any).educationLevel
        );
        if (matchedLevel) {
          educationLevelId = matchedLevel.id;
        }
      }

      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        location: job.location || "",
        salaryMin: job.salaryMin || null,
        salaryMax: job.salaryMax || null,
        experienceYear: job.experienceYear || 0,
        systemConfigEducationLevelId: educationLevelId,
        jobType: job.jobType || "FullTime",
        positionId: job.positionId || 0,
        taxonomyIds: job.taxonomies ? job.taxonomies.map(t => t.id) : [],
        openedAt: job.openedAt ? new Date(job.openedAt) : new Date(),
        expiredAt: job.expiredAt ? new Date(job.expiredAt) : new Date(new Date().setDate(new Date().getDate() + 30)),
      });

      setSelectedPositionId(job.positionId || null);
      setIsNegotiableSalary(!job.salaryMin && !job.salaryMax);
    }
  }, [job, isOpen, educationLevels]);

  // Load taxonomies and positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTaxonomies(true);
        const taxonomyResponse = await TaxonomyService.getAllTaxonomies();
        if (taxonomyResponse.isSuccess && taxonomyResponse.result) {
          setTaxonomies(taxonomyResponse.result);
        }
      } catch (error) {
        console.warn("Error loading taxonomies:", error);
      } finally {
        setLoadingTaxonomies(false);
      }

      try {
        setLoadingPositions(true);
        const positionResponse = await PositionService.getAll();
        if (positionResponse.isSuccess && positionResponse.result) {
          setPositions(positionResponse.result);
        }
      } catch (error) {
        console.warn("Error loading positions:", error);
      } finally {
        setLoadingPositions(false);
      }

      try {
        setLoadingEducationLevels(true);
        const educationResponse = await SystemConfigService.getAllConfigs();
        if (educationResponse.isSuccess && educationResponse.result) {
          // Lọc các config có type là "education_level"
          const educationLevelConfigs = educationResponse.result.filter(
            (config: SystemConfig) => config.type === "education_level"
          );
          setEducationLevels(educationLevelConfigs);
        }
      } catch (error) {
        console.warn("Error loading education levels:", error);
      } finally {
        setLoadingEducationLevels(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof JobFormData, value: string | number | Date | number[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsLoading(true);

      // Validate salary range
      if (formData.salaryMin && formData.salaryMax && formData.salaryMin >= formData.salaryMax) {
        toast.error("Lương tối thiểu phải nhỏ hơn lương tối đa");
        return;
      }

      // Validate dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const openedDate = new Date(formData.openedAt);
      openedDate.setHours(0, 0, 0, 0);
      const expiredDate = new Date(formData.expiredAt);
      expiredDate.setHours(0, 0, 0, 0);

      // Get original opened date from job
      const originalOpenedDate = job.openedAt ? new Date(job.openedAt) : null;
      if (originalOpenedDate) {
        originalOpenedDate.setHours(0, 0, 0, 0);
      }

      // Only validate openedAt >= today if user changed the opened date
      const isOpenedDateChanged = !originalOpenedDate || openedDate.getTime() !== originalOpenedDate.getTime();
      if (isOpenedDateChanged && openedDate < today) {
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

      // Prepare update request
      const updateRequest: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        location: formData.location.trim(),
        experienceYear: formData.experienceYear,
        systemConfigEducationLevelId: formData.systemConfigEducationLevelId,
        jobType: formData.jobType,
        positionId: selectedPositionId || formData.positionId,
        taxonomyIds: formData.taxonomyIds,
        openedAt: formData.openedAt instanceof Date ? formData.openedAt.toISOString() : new Date(formData.openedAt).toISOString(),
        expiredAt: formData.expiredAt instanceof Date ? formData.expiredAt.toISOString() : new Date(formData.expiredAt).toISOString(),
      };

      // Only include optional fields if they have values
      if (formData.benefits && formData.benefits.trim()) {
        updateRequest.benefits = formData.benefits.trim();
      }

      if (formData.salaryMin !== null && formData.salaryMin !== undefined) {
        updateRequest.salaryMin = formData.salaryMin;
      }

      if (formData.salaryMax !== null && formData.salaryMax !== undefined) {
        updateRequest.salaryMax = formData.salaryMax;
      }

      // Call API
      const response = await JobServices.update(job.jobId.toString(), updateRequest as unknown as Job);

      if (response.isSuccess) {
        toast.success("Cập nhật tin tuyển dụng thành công!");
        onSave();
        onClose();
      } else {
        const errorMsg = response.errorMessages?.length > 0
          ? response.errorMessages[0]
          : "Có lỗi xảy ra khi cập nhật tin tuyển dụng";
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      console.error("Error updating job:", error);

      let errorMessage = "Có lỗi xảy ra khi cập nhật tin tuyển dụng";

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { message?: string; errorCode?: string } } };

        if (responseError.response?.data?.message) {
          errorMessage = responseError.response.data.message;
        } else if (responseError.response?.data?.errorCode) {
          switch (responseError.response.data.errorCode) {
            case "CantUpdate":
            case "CantUpdateJob":
              errorMessage = "Không thể cập nhật tin tuyển dụng đã có ứng viên ứng tuyển";
              break;
            case "NotFoundRecruiter":
              errorMessage = "Bạn không có quyền chỉnh sửa tin tuyển dụng này";
              break;
            case "NotFoundJob":
              errorMessage = "Không tìm thấy tin tuyển dụng";
              break;
            default:
              errorMessage = responseError.response.data.message || errorMessage;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Chỉnh sửa tin tuyển dụng
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin công việc. Các trường có dấu (*) là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4 pb-4">
          {/* Dòng 1: Tiêu đề - Loại công việc */}
          <div className="col-span-1">
            <Label htmlFor="title" className="text-sm font-medium text-gray-900">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="VD: Senior Full-stack Developer"
              className="mt-1"
              required
            />
          </div>

          <div className="col-span-1">
            <Label htmlFor="jobType" className="text-sm font-medium text-gray-900">
              Loại công việc <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobType}
              onValueChange={(value) => handleInputChange('jobType', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn loại công việc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                <SelectItem value="PartTime">Bán thời gian</SelectItem>
                <SelectItem value="Remote">Làm từ xa</SelectItem>
                <SelectItem value="Other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dòng 2: Địa điểm - Full width */}
          <div className="col-span-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-900">
              Địa điểm làm việc <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="VD: Hà Nội, Hồ Chí Minh"
              className="mt-1"
              required
            />
          </div>

          {/* Dòng 3: Trình độ - Số năm kinh nghiệm */}
          <div className="col-span-1">
            <Label htmlFor="educationLevel" className="text-sm font-medium text-gray-900">
              Trình độ <span className="text-red-500">*</span>
            </Label>
            {loadingEducationLevels ? (
              <div className="text-sm text-muted-foreground mt-1">Đang tải...</div>
            ) : (
              <Select
                key={`education-${formData.systemConfigEducationLevelId}`}
                value={formData.systemConfigEducationLevelId > 0 ? formData.systemConfigEducationLevelId.toString() : undefined}
                onValueChange={(value) => handleInputChange('systemConfigEducationLevelId', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.length === 0 ? (
                    <SelectItem value="0" disabled>Không có dữ liệu trình độ</SelectItem>
                  ) : (
                    educationLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="col-span-1">
            <Label htmlFor="experienceYear" className="text-sm font-medium text-gray-900">
              Số năm kinh nghiệm
            </Label>
            <Input
              id="experienceYear"
              type="number"
              min="0"
              max="50"
              value={formData.experienceYear}
              onChange={(e) => handleInputChange('experienceYear', parseInt(e.target.value) || 0)}
              placeholder="VD: 2"
              className="mt-1"
            />
          </div>

          {/* Dòng 4: Ngày mở - Ngày hết hạn */}

          {/* Position - Autocomplete */}
          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-900">
              Vị trí tuyển dụng <span className="text-red-500">*</span>
            </Label>
            {loadingPositions ? (
              <div className="text-sm text-muted-foreground mt-1">Đang tải danh sách vị trí...</div>
            ) : (
              <div className="relative mt-1">
                <Input
                  type="text"
                  value={selectedPositionId ? positions.find(p => p.positionId === selectedPositionId)?.name || "" : searchPosition}
                  onChange={(e) => {
                    setSearchPosition(e.target.value);
                    if (selectedPositionId) {
                      setSelectedPositionId(null);
                      handleInputChange('positionId', 0);
                    }
                    setOpenPositionPopover(e.target.value.length > 0);
                  }}
                  onFocus={() => {
                    if (!selectedPositionId && searchPosition.length > 0) {
                      setOpenPositionPopover(true);
                    }
                  }}
                  placeholder="Nhập để tìm kiếm vị trí..."
                  readOnly={!!selectedPositionId}
                  className={cn(selectedPositionId && "cursor-pointer")}
                  onClick={() => {
                    if (selectedPositionId) {
                      setSelectedPositionId(null);
                      handleInputChange('positionId', 0);
                      setSearchPosition("");
                    }
                  }}
                />

                {/* Dropdown Suggestions */}
                {openPositionPopover && !selectedPositionId && searchPosition.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-auto">
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
                              handleInputChange('positionId', position.positionId);
                              setSearchPosition("");
                              setOpenPositionPopover(false);
                            }}
                            className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          >
                            <span className="text-sm">{position.name}</span>
                          </div>
                        ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        Không tìm thấy vị trí phù hợp
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opened Date */}
          <div className="col-span-1">
            <Label className="text-sm font-medium text-gray-900">
              Ngày mở tuyển dụng <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !formData.openedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.openedAt ? format(formData.openedAt, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.openedAt}
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange('openedAt', date);
                      // Auto-set expired date to 30 days later
                      const expiredDate = new Date(date);
                      expiredDate.setDate(expiredDate.getDate() + 30);
                      handleInputChange('expiredAt', expiredDate);
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
          </div>

          {/* Expired Date */}
          <div className="col-span-1">
            <Label className="text-sm font-medium text-gray-900">
              Ngày hết hạn <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !formData.expiredAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiredAt ? format(formData.expiredAt, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expiredAt}
                  onSelect={(date) => date && handleInputChange('expiredAt', date)}
                  disabled={(date) => {
                    if (!formData.openedAt) return true;
                    const minDate = new Date(formData.openedAt);
                    minDate.setDate(minDate.getDate() + 1);
                    const maxDate = new Date(formData.openedAt);
                    maxDate.setDate(maxDate.getDate() + 30);
                    return date <= formData.openedAt || date > maxDate;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              Tối đa 30 ngày kể từ ngày mở tuyển dụng
            </p>
          </div>

          {/* Taxonomies/Skills - Autocomplete */}
          <div className="col-span-2">
            <Label className="text-sm font-medium text-gray-900">
              Kỹ năng yêu cầu <span className="text-red-500">*</span>
            </Label>
            {loadingTaxonomies ? (
              <div className="text-sm text-muted-foreground mt-1">Đang tải danh sách kỹ năng...</div>
            ) : (
              <div className="space-y-2 mt-1">
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
                    placeholder="Nhập để tìm kiếm kỹ năng..."
                  />

                  {/* Dropdown Suggestions */}
                  {openTaxonomyPopover && searchTaxonomy.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-auto">
                      {taxonomies
                        .filter(taxonomy =>
                          !formData.taxonomyIds.includes(taxonomy.id) &&
                          taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                        )
                        .length > 0 ? (
                        taxonomies
                          .filter(taxonomy =>
                            !formData.taxonomyIds.includes(taxonomy.id) &&
                            taxonomy.name.toLowerCase().includes(searchTaxonomy.toLowerCase())
                          )
                          .map((taxonomy) => (
                            <div
                              key={taxonomy.id}
                              onClick={() => {
                                handleInputChange('taxonomyIds', [...formData.taxonomyIds, taxonomy.id]);
                                setSearchTaxonomy("");
                                setOpenTaxonomyPopover(false);
                              }}
                              className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                            >
                              <span className="text-sm">{taxonomy.name}</span>
                            </div>
                          ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          Không tìm thấy kỹ năng phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Taxonomies as Badges */}
                {formData.taxonomyIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.taxonomyIds.map((taxonomyId) => {
                      const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                      return (
                        <Badge key={taxonomyId} variant="secondary" className="flex items-center gap-1">
                          {taxonomy?.name || `ID: ${taxonomyId}`}
                          <button
                            type="button"
                            onClick={() => {
                              const newIds = formData.taxonomyIds.filter(id => id !== taxonomyId);
                              handleInputChange('taxonomyIds', newIds);
                            }}
                            className="ml-1 hover:bg-muted rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Đã chọn: {formData.taxonomyIds.length} kỹ năng
                </p>
              </div>
            )}
          </div>

          {/* Salary Section */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="negotiableSalary"
                checked={isNegotiableSalary}
                onCheckedChange={(checked: boolean) => {
                  setIsNegotiableSalary(checked);
                  if (checked) {
                    handleInputChange('salaryMin', null);
                    handleInputChange('salaryMax', null);
                  }
                }}
              />
              <label
                htmlFor="negotiableSalary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Lương thỏa thuận
              </label>
            </div>

            {!isNegotiableSalary && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin" className="text-sm font-medium text-gray-900">
                    Lương tối thiểu (VND)
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    min="0"
                    value={formData.salaryMin ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      handleInputChange('salaryMin', value);
                    }}
                    placeholder="VD: 10000000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="salaryMax" className="text-sm font-medium text-gray-900">
                    Lương tối đa (VND)
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    min="0"
                    value={formData.salaryMax ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      handleInputChange('salaryMax', value);
                    }}
                    placeholder="VD: 20000000"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {isNegotiableSalary && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  Mức lương sẽ được thỏa thuận trong quá trình phỏng vấn
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="col-span-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-900">
              Mô tả công việc <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm chính..."
              className="mt-1"
              rows={5}
              required
            />
          </div>

          {/* Requirements */}
          <div className="col-span-2">
            <Label htmlFor="requirements" className="text-sm font-medium text-gray-900">
              Yêu cầu công việc <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Các yêu cầu về kỹ năng, kinh nghiệm, bằng cấp..."
              className="mt-1"
              rows={5}
              required
            />
          </div>

          {/* Benefits */}
          <div className="col-span-2">
            <Label htmlFor="benefits" className="text-sm font-medium text-gray-900">
              Quyền lợi
            </Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="Các quyền lợi và phúc lợi dành cho nhân viên..."
              className="mt-1"
              rows={4}
            />
          </div>



            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="px-6 py-4 border-t flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
