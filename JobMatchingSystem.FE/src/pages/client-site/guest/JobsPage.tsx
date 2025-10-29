import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// --- IMPORTS ĐÃ GỘP ---

// UI Components (từ cả 3 file)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons (từ cả 3 file)
import { Search, MapPin, ChevronDown, ChevronRight } from "lucide-react";

// Components con
import { JobCard } from "@/components/ui/jobs/JobCard"; // Từ JobList

// Services
import { jobService } from "@/services/test-services/jobService";

// Types & Mock Data (từ cả 3 file)
import type {
  JobTest as Job,
  JobSearchFilters,
  JobSearchParams,
  JobSearchResponse,
} from "@/models/job";
import {
  MOCK_CATEGORIES,
  MOCK_JOB_TYPES,
  MOCK_EXPERIENCE_LEVELS,
  MOCK_DATE_POSTED_OPTIONS,
  MOCK_POPULAR_TAGS,
  MOCK_LOCATIONS,
} from "@/models/job";

// --- KẾT THÚC IMPORTS ---

// -----------------------------------------------------------------
// COMPONENT 1: JobSearchFilter (đã xóa 'export')
// -----------------------------------------------------------------

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
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // Sử dụng state local cho salary để tránh re-render liên tục khi kéo
  const [localSalary, setLocalSalary] = useState({
    min: filters.salaryRange?.min || 0,
    max: filters.salaryRange?.max || 9999, // Giá trị max ví dụ
  });

  // Cập nhật state local nếu filter từ URL thay đổi
  useEffect(() => {
    setLocalSalary({
      min: filters.salaryRange?.min || 0,
      max: filters.salaryRange?.max || 9999,
    });
  }, [filters.salaryRange]);

  const handleInputChange = (field: keyof JobSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleArrayChange = (
    field: keyof JobSearchFilters,
    value: string,
    checked: boolean
  ) => {
    const currentArray = (filters[field] as string[]) || [];
    let newArray: string[];

    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter((item) => item !== value);
    }

    onFiltersChange({
      ...filters,
      [field]: newArray,
    });
  };

  const handleSalaryRangeApply = () => {
    onFiltersChange({
      ...filters,
      salaryRange: localSalary,
    });
  };

  // Hàm render chung cho các section filter
  const renderFilterSection = (
    title: string,
    options: Array<{
      id: string;
      name: string;
      count?: number;
      value?: string;
    }>,
    field: keyof JobSearchFilters,
    showMore?: boolean,
    onShowMoreToggle?: () => void
  ) => {
    const displayOptions = showMore ? options : options.slice(0, 5);
    const fieldValue = (filters[field] as string[]) || [];

    // Đặc biệt xử lý cho 'datePosted' vốn là string, không phải array
    const isChecked = (option: any) => {
      if (field === "datePosted") {
        return filters.datePosted === (option.value || option.id);
      }
      return fieldValue.includes(option.value || option.id);
    };

    const handleChange = (option: any, checked: boolean) => {
      if (field === "datePosted") {
        onFiltersChange({ ...filters, datePosted: option.value || option.id });
      } else {
        handleArrayChange(field, option.value || option.id, checked);
      }
    };

    return (
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-3">
          {displayOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${field}-${option.id}`}
                  checked={isChecked(option)}
                  onCheckedChange={(checked) =>
                    handleChange(option, checked as boolean)
                  }
                  className="border-gray-400"
                />
                <label
                  htmlFor={`${field}-${option.id}`}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option.name}
                </label>
              </div>
              {option.count && (
                <Badge
                  variant="secondary"
                  className="bg-white text-gray-600 border border-gray-200"
                >
                  {option.count}
                </Badge>
              )}
            </div>
          ))}
          {options.length > 5 && onShowMoreToggle && (
            <Button
              variant="default"
              size="sm"
              onClick={onShowMoreToggle}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {showMore ? "Show less" : "Show more"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`bg-emerald-50 border-none shadow-sm ${className}`}>
      <CardContent className="p-6 space-y-8">
        {/* Search by Job Title */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Search by Job Title
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Job title or company"
              value={filters.keyword || ""}
              onChange={(e) => handleInputChange("keyword", e.target.value)}
              className="pl-10 bg-white border-gray-200 h-12"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Location</h3>
          <Select
            value={filters.location || ""}
            onValueChange={(value) => handleInputChange("location", value)}
          >
            <SelectTrigger className="bg-white border-gray-200 h-12">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <SelectValue placeholder="Choose city" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_LOCATIONS.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}, {location.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        {renderFilterSection(
          "Category",
          MOCK_CATEGORIES,
          "categories",
          showMoreCategories,
          () => setShowMoreCategories(!showMoreCategories)
        )}

        {/* Job Type */}
        {renderFilterSection("Job Type", MOCK_JOB_TYPES, "jobTypes")}

        {/* Experience Level */}
        {renderFilterSection(
          "Experience Level",
          MOCK_EXPERIENCE_LEVELS,
          "experienceLevels"
        )}

        {/* Date Posted (Sử dụng renderFilterSection, nhưng logic bên trong đã xử lý nó là string) */}
        {renderFilterSection(
          "Date Posted",
          MOCK_DATE_POSTED_OPTIONS,
          "datePosted"
        )}

        {/* Salary Range */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Salary</h3>
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg p-4 border border-gray-200">
              {/* Simple range visualization (giả định max là 100000) */}
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute h-full bg-emerald-600 rounded-full"
                  style={{
                    left: `${(localSalary.min / 100000) * 100}%`,
                    width: `${
                      ((localSalary.max - localSalary.min) / 100000) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full mr-2"></div>
                  ${localSalary.min.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full mr-2"></div>
                  ${localSalary.max.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-900">
                Salary: ${localSalary.min.toLocaleString()} - $
                {localSalary.max.toLocaleString()}
              </p>
              <Button
                size="sm"
                onClick={handleSalaryRangeApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-3">
            {MOCK_POPULAR_TAGS.map((tag) => {
              const isSelected = (filters.tags || []).includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleArrayChange("tags", tag, !isSelected)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// -----------------------------------------------------------------
// COMPONENT 2: JobList (đã xóa 'export', cập nhật type)
// -----------------------------------------------------------------

interface JobListProps {
  jobs: Job[]; // <- Đã dùng Job
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onPageChange: (page: number) => void;
  onJobDetails: (jobId: string) => void;
  onSaveJob?: (jobId: string) => void;
  loading?: boolean;
  className?: string;
}

const SORT_OPTIONS = [
  { value: "latest", label: "Sort by latest" },
  { value: "oldest", label: "Sort by oldest" },
  { value: "salary-high", label: "Salary: High to Low" },
  { value: "salary-low", label: "Salary: Low to High" },
  { value: "relevance", label: "Most relevant" },
];

const JobList: React.FC<JobListProps> = ({
  jobs,
  total,
  page,
  limit,
  totalPages,
  sortBy,
  onSortChange,
  onPageChange,
  onJobDetails,
  onSaveJob,
  loading = false,
  className = "",
}) => {
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  const renderPaginationButton = (
    pageNumber: number,
    isActive: boolean = false
  ) => (
    <Button
      key={pageNumber}
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onPageChange(pageNumber)}
      className={`w-10 h-10 ${
        isActive
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {pageNumber}
    </Button>
  );

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(renderPaginationButton(i, i === page));
      }
    } else {
      // Show first page
      buttons.push(renderPaginationButton(1, 1 === page));

      // Show ellipsis if needed
      if (page > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            ...
          </span>
        );
      }

      // Show current page and neighbors
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(renderPaginationButton(i, i === page));
        }
      }

      // Show ellipsis if needed
      if (page < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-400">
            ...
          </span>
        );
      }

      // Show last page
      if (totalPages > 1) {
        buttons.push(renderPaginationButton(totalPages, totalPages === page));
      }
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-48"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded w-44"></div>
        </div>
        <div className="space-y-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-gray-100"
            >
              <div className="space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-6"></div>
                </div>
                <div className="flex space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-200 rounded w-20"
                      ></div>
                    ))}
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${className}`}>
      {/* Header with results count and sort */}
      <div className="flex justify-between items-center">
        <p className="text-lg font-medium text-gray-600">
          Showing {startIndex}-{endIndex} of {total} results
        </p>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-44 border-gray-300">
            <SelectValue />
            <ChevronDown className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v.5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 6.5V6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find more jobs.
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobDetails={onJobDetails}
              onSaveJob={onSaveJob}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-8">
          <div className="flex space-x-6">
            {/* Empty space for alignment */}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-6">
            {renderPaginationButtons()}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center space-x-2 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------
// COMPONENT 3: JobsPage (Component chính, có 'export default')
// -----------------------------------------------------------------

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResponse, setSearchResponse] =
    useState<JobSearchResponse | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<JobSearchFilters>(() => ({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    categories: searchParams.getAll("categories"),
    jobTypes: searchParams.getAll("jobTypes"),
    experienceLevels: searchParams.getAll("experienceLevels"),
    datePosted: searchParams.get("datePosted") || "all",
    tags: searchParams.getAll("tags"),
    salaryRange:
      searchParams.get("salaryMin") && searchParams.get("salaryMax")
        ? {
            min: parseInt(searchParams.get("salaryMin")!),
            max: parseInt(searchParams.get("salaryMax")!),
          }
        : undefined,
  }));

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    limit: 6,
    sortBy: searchParams.get("sortBy") || "latest",
  });

  // Update URL when filters or pagination change
  const updateURL = useCallback(
    (newFilters: JobSearchFilters, newPagination: typeof pagination) => {
      const params = new URLSearchParams();

      if (newFilters.keyword) params.set("keyword", newFilters.keyword);
      if (newFilters.location) params.set("location", newFilters.location);
      if (newFilters.datePosted && newFilters.datePosted !== "all")
        params.set("datePosted", newFilters.datePosted);
      if (newFilters.categories?.length)
        newFilters.categories.forEach((cat) =>
          params.append("categories", cat)
        );
      if (newFilters.jobTypes?.length)
        newFilters.jobTypes.forEach((type) => params.append("jobTypes", type));
      if (newFilters.experienceLevels?.length)
        newFilters.experienceLevels.forEach((level) =>
          params.append("experienceLevels", level)
        );
      if (newFilters.tags?.length)
        newFilters.tags.forEach((tag) => params.append("tags", tag));
      if (newFilters.salaryRange) {
        params.set("salaryMin", newFilters.salaryRange.min.toString());
        params.set("salaryMax", newFilters.salaryRange.max.toString());
      }

      if (newPagination.page > 1)
        params.set("page", newPagination.page.toString());
      if (newPagination.sortBy !== "latest")
        params.set("sortBy", newPagination.sortBy);

      setSearchParams(params, { replace: true }); // Dùng replace để tránh làm đầy lịch sử trình duyệt
    },
    [setSearchParams]
  );

  // Search jobs function
  const searchJobs = useCallback(
    async (
      searchFilters: JobSearchFilters,
      searchPagination: typeof pagination
    ) => {
      try {
        setLoading(true);

        const searchParams: JobSearchParams = {
          ...searchFilters,
          page: searchPagination.page,
          limit: searchPagination.limit,
          sortBy: searchPagination.sortBy as any,
        };

        const response = await jobService.searchJobs(searchParams);
        setSearchResponse(response);
        setJobs(response.jobs);
      } catch (error) {
        console.error("Error searching jobs:", error);
        // toast.error('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Handle filter changes
  const handleFiltersChange = (newFilters: JobSearchFilters) => {
    setFilters(newFilters);
    const newPagination = { ...pagination, page: 1 }; // Reset to first page
    setPagination(newPagination);
    updateURL(newFilters, newPagination);
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    const newPagination = { ...pagination, sortBy, page: 1 }; // Reset to first page
    setPagination(newPagination);
    updateURL(filters, newPagination);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newPagination = { ...pagination, page };
    setPagination(newPagination);
    updateURL(filters, newPagination);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  // Handle job details navigation
  const handleJobDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handle save job
  const handleSaveJob = async (jobId: string) => {
    try {
      await jobService.saveJob(jobId);
      // toast.success('Job saved successfully!');
      console.log("Job saved successfully!");
    } catch (error) {
      console.error("Error saving job:", error);
      // toast.error('Failed to save job. Please try again.');
    }
  };

  // Load jobs on mount and when filters/pagination change
  useEffect(() => {
    searchJobs(filters, pagination);
  }, [filters, pagination, searchJobs]);

  // Đồng bộ URL -> State khi người dùng bấm nút back/forward
  useEffect(() => {
    setFilters({
      keyword: searchParams.get("keyword") || "",
      location: searchParams.get("location") || "",
      categories: searchParams.getAll("categories"),
      jobTypes: searchParams.getAll("jobTypes"),
      experienceLevels: searchParams.getAll("experienceLevels"),
      datePosted: searchParams.get("datePosted") || "all",
      tags: searchParams.getAll("tags"),
      salaryRange:
        searchParams.get("salaryMin") && searchParams.get("salaryMax")
          ? {
              min: parseInt(searchParams.get("salaryMin")!),
              max: parseInt(searchParams.get("salaryMax")!),
            }
          : undefined,
    });
    setPagination({
      page: parseInt(searchParams.get("page") || "1"),
      limit: 6,
      sortBy: searchParams.get("sortBy") || "latest",
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar - Horizontal */}
        <div className="mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Tìm kiếm việc làm..."
                    value={filters.keyword}
                    onChange={(e) => handleFiltersChange({ ...filters, keyword: e.target.value })}
                    className="pl-10 h-12"
                  />
                </div>
                <div className="w-80 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Địa điểm..."
                    value={filters.location}
                    onChange={(e) => handleFiltersChange({ ...filters, location: e.target.value })}
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Sidebar Filter */}
          <div className="w-80 flex-shrink-0">
            <JobSearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Job List */}
          <div className="flex-1">
            <JobList
              jobs={jobs}
              total={searchResponse?.total || 0}
              page={pagination.page}
              limit={pagination.limit}
              totalPages={searchResponse?.totalPages || 1}
              sortBy={pagination.sortBy}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onJobDetails={handleJobDetails}
              onSaveJob={handleSaveJob}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
