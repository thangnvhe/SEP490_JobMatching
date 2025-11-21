import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

// Components
import JobSearchHeader from "@/components/ui/jobs/JobSearchHeader";
import JobSearchFilter from "@/components/ui/jobs/JobSearchFilter";
import JobList from "@/components/ui/jobs/JobList";
import { Button } from "@/components/ui/button";

// Services & Types
import { JobServices} from "@/services/job.service";
import type { JobSearchParams } from "@/models/job";
import type { JobDetailResponse } from "@/models/job";
import type { PaginatedResponse } from "@/models/base";
import type {JobSearchFilters} from "@/models/job";
import type { SearchState } from "@/models/job";
// Icons
import { X } from "lucide-react";



// Mapping functions
const mapJobTypeToAPI = (jobType: string): string => {
  const mapping: { [key: string]: string } = {
    'FullTime': 'FullTime',
    'PartTime': 'Parttime',  // Match API response format
    'Remote': 'Remote',
    'Other': 'Other'
  };
  return mapping[jobType] ?? 'FullTime';
};

const getSalaryRange = (salaryRange: string): [number, number] => {
  switch (salaryRange) {
    case '0-10':
      return [0, 10000000];
    case '10-15':
      return [10000000, 15000000];
    case '15-20':
      return [15000000, 20000000];
    case '20-25':
      return [20000000, 25000000];
    case '25+':
      return [25000000, 999999999];
    case '-1--1':
      return [-1, -1]; // Thỏa thuận
    default:
      return [-1, -1];
  }
};

// Thêm function để xử lý experience range
const getExperienceRange = (experienceLevel: string): [number, number] => {
  switch (experienceLevel) {
    case '-1--1':
      return [-1, -1]; // Không yêu cầu
    case '0-1':
      return [0, 1];   // Từ 0 đến 1 năm (chính xác)
    case '1-3':
      return [1, 3];   // Từ 1 đến 3 năm
    case '3-5':
      return [3, 5];   // Từ 3 đến 5 năm
    case '5+':
      return [5, 999]; // Từ 5 năm trở lên
    default:
      return [-1, -1];
  }
};

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);
  
  // State management
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Search state
  const [searchState, setSearchState] = useState<SearchState>(() => ({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    filters: {
      jobType: searchParams.get("jobType") || undefined,
      experienceLevel: searchParams.get("experienceLevel") || undefined,
      salaryRange: searchParams.get("salaryRange") || undefined,
    },
    pagination: {
      page: parseInt(searchParams.get("page") || "1"),
      size: 12,
      sortBy: searchParams.get("sortBy") || "latest",
    },
  }));

  // Pagination state
  const [paginationInfo, setPaginationInfo] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  });

  // Update URL when search state changes
  const updateURL = useCallback((newState: SearchState) => {
    const params = new URLSearchParams();

    if (newState.keyword) params.set("keyword", newState.keyword);
    if (newState.location) params.set("location", newState.location);
    
    // Filters
    if (newState.filters.jobType) {
      params.set("jobType", newState.filters.jobType);
    }
    if (newState.filters.experienceLevel) {
      params.set("experienceLevel", newState.filters.experienceLevel);
    }
    if (newState.filters.salaryRange) {
      params.set("salaryRange", newState.filters.salaryRange);
    }

    // Pagination
    if (newState.pagination.page > 1) {
      params.set("page", newState.pagination.page.toString());
    }
    if (newState.pagination.sortBy !== "latest") {
      params.set("sortBy", newState.pagination.sortBy);
    }

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Search jobs function
  const searchJobs = useCallback(async (state: SearchState) => {
    setLoading(true);
    try {
      // Build API parameters
      const apiParams: JobSearchParams = {
        Page: state.pagination.page,
        Size: state.pagination.size,
        Status: 3, // Only show opened jobs (Status.Opened = 3)
      };

      // Build search string from keyword and location
      const searchTerms = [];
      if (state.keyword) searchTerms.push(state.keyword);
      if (state.location) searchTerms.push(state.location);
      
      if (searchTerms.length > 0) {
        apiParams.Search = searchTerms.join(' ');
      }

      // Add search filters
      if (state.keyword) {
        apiParams.Title = state.keyword;
      }
      if (state.location) {
        apiParams.Location = state.location;
      }
      if (state.filters.salaryRange) {
        const [min, max] = getSalaryRange(state.filters.salaryRange);
        // Gửi -1 cho cả min và max khi chọn thỏa thuận
        apiParams.SalaryMin = min;
        apiParams.SalaryMax = max;
      }
      if (state.filters.experienceLevel) {
        const [minExp, maxExp] = getExperienceRange(state.filters.experienceLevel);
        // Gửi cả min và max để backend xử lý chính xác
        if (minExp !== -1) {
          apiParams.ExperienceYearMin = minExp;
        }
        if (maxExp !== -1 && maxExp !== 999) { // 999 là giá trị max cho '5+'
          apiParams.ExperienceYearMax = maxExp;
        }
        // Nếu cả min và max đều là -1 (không yêu cầu) thì gửi -1
        if (minExp === -1 && maxExp === -1) {
          apiParams.ExperienceYearMin = -1;
          apiParams.ExperienceYearMax = -1;
        }
      }
      if (state.filters.jobType) {
        apiParams.JobType = mapJobTypeToAPI(state.filters.jobType);
      }
      
      // Call API
      const response: PaginatedResponse<JobDetailResponse> = await JobServices.getJobsWithPagination(apiParams);
      
      if (response.isSuccess) {
        setJobs(response.result.items);
        setPaginationInfo({
          totalItems: response.result.pageInfo.totalItem,
          totalPages: response.result.pageInfo.totalPage,
          currentPage: state.pagination.page,
        });
      } else {
        toast.error("Không thể tải danh sách việc làm");
        setJobs([]);
        setPaginationInfo({
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
        });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tìm kiếm việc làm");
      setJobs([]);
      setPaginationInfo({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Event handlers
  const handleSearch = () => {
    const newState = {
      ...searchState,
      pagination: { ...searchState.pagination, page: 1 }, // Reset to page 1
    };
    setSearchState(newState);
    updateURL(newState);
  };

  const handleFiltersChange = (newFilters: JobSearchFilters) => {
    const newState = {
      ...searchState,
      filters: newFilters,
      pagination: { ...searchState.pagination, page: 1 }, // Reset to page 1
    };
    setSearchState(newState);
    updateURL(newState);
  };

  const handleSortChange = (sortBy: string) => {
    const newState = {
      ...searchState,
      pagination: { ...searchState.pagination, sortBy, page: 1 },
    };
    setSearchState(newState);
    updateURL(newState);
  };

  const handlePageChange = (page: number) => {
    const newState = {
      ...searchState,
      pagination: { ...searchState.pagination, page },
    };
    setSearchState(newState);
    updateURL(newState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJobDetails = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      // Check if user is authenticated
      if (!authState.isAuthenticated) {
        toast.error('Vui lòng đăng nhập để lưu việc làm');
        return;
      }

      // Check if user is candidate
      if (authState.role?.toLowerCase() !== 'candidate') {
        toast.error('Chỉ ứng viên mới có thể lưu việc làm');
        return;
      }

      // TODO: Implement actual save job API call here
      // await SaveJobService.saveJob(jobId);
      
      toast.success(`Đã lưu công việc ${jobId}`);
    } catch (error) {
      toast.error("Có lỗi khi lưu công việc");
    }
  };

  const handleKeywordChange = (keyword: string) => {
    setSearchState(prev => ({ ...prev, keyword }));
  };

  const handleLocationChange = (location: string) => {
    setSearchState(prev => ({ ...prev, location }));
  };

  // Load jobs when search state changes
  useEffect(() => {
    searchJobs(searchState);
  }, [searchState, searchJobs]);

  // Sync URL back to state on browser back/forward
  useEffect(() => {
    const newState: SearchState = {
      keyword: searchParams.get("keyword") || "",
      location: searchParams.get("location") || "",
      filters: {
        jobType: searchParams.get("jobType") || undefined,
        experienceLevel: searchParams.get("experienceLevel") || undefined,
        salaryRange: searchParams.get("salaryRange") || undefined,
      },
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        size: 12,  // Match với initial state
        sortBy: searchParams.get("sortBy") || "latest",
      },
    };
    setSearchState(newState);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <JobSearchHeader
        keyword={searchState.keyword}
        location={searchState.location}
        onKeywordChange={handleKeywordChange}
        onLocationChange={handleLocationChange}
        onSearch={handleSearch}
        onToggleFilter={() => setShowMobileFilter(true)}
        showFilterToggle={true}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <JobSearchFilter
                filters={searchState.filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Job Results */}
          <div className="flex-1 min-w-0">
            <JobList
              jobs={jobs}
              total={paginationInfo.totalItems}
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
              pageSize={searchState.pagination.size}
              sortBy={searchState.pagination.sortBy}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onJobDetails={handleJobDetails}
              onSaveJob={handleSaveJob}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Bộ lọc</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilter(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <JobSearchFilter
                filters={searchState.filters}
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters);
                  setShowMobileFilter(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;