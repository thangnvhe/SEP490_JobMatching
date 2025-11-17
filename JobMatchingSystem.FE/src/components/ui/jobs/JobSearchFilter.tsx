import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface JobSearchFilters {
  jobType?: string;
  experienceLevel?: string;
  salaryRange?: string;
}

interface JobSearchFilterProps {
  filters: JobSearchFilters;
  onFiltersChange: (filters: JobSearchFilters) => void;
  className?: string;
}

const JobSearchFilter: React.FC<JobSearchFilterProps> = ({
  filters,
  onFiltersChange,
  className = "",
}) => {
  // Data cho các bộ lọc
  const jobTypes = [
    { value: "", label: "Tất cả" },
    { value: "FullTime", label: "Toàn thời gian" },
    { value: "PartTime", label: "Bán thời gian" },
    { value: "Remote", label: "Làm từ xa" },
    { value: "Other", label: "Khác" },
  ];

  const experienceLevels = [
    { value: "", label: "Tất cả" },
    { value: "-1--1", label: "Không yêu cầu" },
    { value: "0-1", label: "Dưới 1 năm" },
    { value: "1-3", label: "1-3 năm" },
    { value: "3-5", label: "3-5 năm" },
    { value: "5+", label: "Trên 5 năm" },
  ];

  const salaryRanges = [
    { value: "", label: "Tất cả" },
    { value: "0-10", label: "Dưới 10 triệu" },
    { value: "10-15", label: "10-15 triệu" },
    { value: "15-20", label: "15-20 triệu" },
    { value: "20-25", label: "20-25 triệu" },
    { value: "25+", label: "Trên 25 triệu" },
    { value: "-1--1", label: "Thỏa Thuận" },
  ];

  const handleFilterChange = (field: keyof JobSearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value === "" ? undefined : value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Hàm render radio section
  const renderRadioSection = (
    title: string,
    options: Array<{ value: string; label: string }>,
    field: keyof JobSearchFilters,
    currentValue: string | undefined
  ) => {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${field}-${option.value || "all"}`}
                name={field}
                value={option.value}
                checked={(currentValue || "") === option.value}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
              />
              <Label
                htmlFor={`${field}-${option.value || "all"}`}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          <Button
            variant="link"
            size="sm"
            onClick={clearAllFilters}
            className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
          >
            Xóa tất cả
          </Button>
        </div>

        {/* Job Types */}
        {renderRadioSection("Loại công việc", jobTypes, "jobType", filters.jobType)}

        {/* Experience Levels */}
        {renderRadioSection("Kinh nghiệm", experienceLevels, "experienceLevel", filters.experienceLevel)}

        {/* Salary Range */}
        {renderRadioSection("Mức lương (VND)", salaryRanges, "salaryRange", filters.salaryRange)}
      </div>
    </Card>
  );
};

export default JobSearchFilter;