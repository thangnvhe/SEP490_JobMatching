import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";

interface JobSearchFilters {
  jobType?: string;
  experienceYearMin?: number | null;
  experienceYearMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

interface JobSearchFilterProps {
  filters: JobSearchFilters;
  onFiltersChange: (filters: JobSearchFilters) => void;
}

// Config trực tiếp với min/max values - dễ dàng maintain và sử dụng
const EXPERIENCE_OPTIONS = [
  { min: null, max: null, label: "Tất cả" },
  { min: -1, max: -1, label: "Không yêu cầu" },
  { min: 0, max: 1, label: "Dưới 1 năm" },
  { min: 1, max: 3, label: "1-3 năm" },
  { min: 3, max: 5, label: "3-5 năm" },
  { min: 5, max: null, label: "Trên 5 năm" },
];

const JOB_TYPE_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: "FullTime", label: "Toàn thời gian" },
  { value: "PartTime", label: "Bán thời gian" },
  { value: "Remote", label: "Làm từ xa" },
  { value: "Other", label: "Khác" },
];

const SALARY_OPTIONS = [
  { min: null, max: null, label: "Tất cả" },
  { min: 0, max: 10, label: "Dưới 10 triệu" },
  { min: 10, max: 15, label: "10-15 triệu" },
  { min: 15, max: 20, label: "15-20 triệu" },
  { min: 20, max: 25, label: "20-25 triệu" },
  { min: 25, max: null, label: "Trên 25 triệu" },
  { min: -1, max: -1, label: "Thỏa Thuận" },
];

const JobSearchFilter: React.FC<JobSearchFilterProps> = ({
  filters,
  onFiltersChange,
}) => {

  const handleExperienceChange = (index: number) => {
    const option = EXPERIENCE_OPTIONS[index];
    onFiltersChange({
      ...filters,
      experienceYearMin: option.min,
      experienceYearMax: option.max,
    });
  };

  const handleSalaryChange = (index: number) => {
    const option = SALARY_OPTIONS[index];
    onFiltersChange({
      ...filters,
      salaryMin: option.min,
      salaryMax: option.max,
    });
  };

  const handleCustomSalaryMinChange = (value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onFiltersChange({
      ...filters,
      salaryMin: numValue,
      // Clear radio selection when custom input is used
      salaryMax: filters.salaryMax !== null && filters.salaryMax !== undefined ? filters.salaryMax : null,
    });
  };

  const handleCustomSalaryMaxChange = (value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onFiltersChange({
      ...filters,
      salaryMax: numValue,
      // Clear radio selection when custom input is used
      salaryMin: filters.salaryMin !== null && filters.salaryMin !== undefined ? filters.salaryMin : null,
    });
  };

  const handleJobTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      jobType: value === '' ? '' : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      jobType: "",
      experienceYearMin: null,
      experienceYearMax: null,
      salaryMin: null,
      salaryMax: null,
    });
  };

  // Helper để tìm index của option đang được chọn
  const getSelectedExperienceIndex = (): number => {
    return EXPERIENCE_OPTIONS.findIndex(
      (opt) => opt.min === filters.experienceYearMin && opt.max === filters.experienceYearMax
    );
  };

  const getSelectedSalaryIndex = (): number => {
    const index = SALARY_OPTIONS.findIndex(
      (opt) => opt.min === filters.salaryMin && opt.max === filters.salaryMax
    );
    return index >= 0 ? index : -1;
  };

  // Check if current salary values match any radio option
  const isCustomSalaryRange = () => {
    return getSelectedSalaryIndex() === -1 && 
           (filters.salaryMin !== null && filters.salaryMin !== undefined || 
            filters.salaryMax !== null && filters.salaryMax !== undefined);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
          <Filter className="w-5 h-5" />
          Lọc nâng cao
        </div>
        {/* Conditional rendering or disabled state could be added if needed, but button is always nice to have */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
        >
          <span className="mr-1">Xóa lọc</span>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Kinh nghiệm - Experience */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 text-base">Kinh nghiệm</h3>
          <RadioGroup
            value={getSelectedExperienceIndex().toString()}
            onValueChange={(val) => handleExperienceChange(parseInt(val))}
          >
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              {EXPERIENCE_OPTIONS.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`exp-${index}`}
                    className="text-emerald-600 "
                  />
                  <Label
                    htmlFor={`exp-${index}`}
                    className="text-gray-600 font-normal cursor-pointer hover:text-emerald-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Loại công việc - Job Type */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 text-base">Loại công việc</h3>
          <RadioGroup
            value={filters.jobType || ''}
            onValueChange={handleJobTypeChange}
          >
            <div className="flex flex-col space-y-3">
              {JOB_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value || ''}
                    id={`jobtype-${option.value || 'all'}`}
                    className="text-emerald-600 "
                  />
                  <Label
                    htmlFor={`jobtype-${option.value || 'all'}`}
                    className="text-gray-600 font-normal cursor-pointer hover:text-emerald-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Mức lương - Salary */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4 text-base">Mức lương</h3>
          <RadioGroup
            value={getSelectedSalaryIndex() >= 0 ? getSelectedSalaryIndex().toString() : ""}
            onValueChange={(val) => handleSalaryChange(parseInt(val))}
          >
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              {SALARY_OPTIONS.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`salary-${index}`}
                    className="text-emerald-600 "
                  />
                  <Label
                    htmlFor={`salary-${index}`}
                    className="text-gray-600 font-normal cursor-pointer hover:text-emerald-700"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          {/* Custom Salary Range Input */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Từ"
                value={isCustomSalaryRange() && filters.salaryMin !== null && filters.salaryMin !== undefined ? filters.salaryMin.toString() : ""}
                onChange={(e) => handleCustomSalaryMinChange(e.target.value)}
                className="flex-1"
                min="0"
                step="0.1"
              />
              <span className="text-gray-600">-</span>
              <Input
                type="number"
                placeholder="Đến"
                value={isCustomSalaryRange() && filters.salaryMax !== null && filters.salaryMax !== undefined ? filters.salaryMax.toString() : ""}
                onChange={(e) => handleCustomSalaryMaxChange(e.target.value)}
                className="flex-1"
                min="0"
                step="0.1"
              />
              <span className="text-gray-600">triệu</span>
            </div>
          </div>
        </div>

        {/* Bottom Clear Filter Button (Optional alternative placement, keeping the top one as primary based on common UX, but user asked to "Add it" and often it's at the bottom in forms. I'll add a more prominent one at the bottom as well if the top one is subtle) */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
            onClick={handleClearFilters}
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobSearchFilter;
