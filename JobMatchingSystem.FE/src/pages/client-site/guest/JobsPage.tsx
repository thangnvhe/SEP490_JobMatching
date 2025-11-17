import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
    default:
      return [0, 999999999];
  }
};

const JobsPage: React.FC = () => {
  console.log('JobsPage component mounted');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  console.log('JobsPage current state - jobs:', jobs.length, 'loading:', loading);
  
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
    console.log('searchJobs called with state:', state);
    setLoading(true);
    try {
      // Build API parameters
      const apiParams: JobSearchParams = {
        Page: state.pagination.page,
        Size: state.pagination.size,
        // Status: 3, // Remove status filter temporarily to see all jobs
      };

      console.log('API params being sent:', apiParams);

      // Add search filters
      if (state.keyword) {
        apiParams.Title = state.keyword;
      }
      if (state.location) {
        apiParams.Location = state.location;
      }
      if (state.filters.salaryRange) {
        const [min, max] = getSalaryRange(state.filters.salaryRange);
        apiParams.SalaryMin = min;
        apiParams.SalaryMax = max;
      }
      if (state.filters.jobType) {
        apiParams.JobType = mapJobTypeToAPI(state.filters.jobType);
      }
      
      console.log('Final API params:', apiParams);
      
      // Call API
      const response: PaginatedResponse<JobDetailResponse> = await JobServices.getJobsWithPagination(apiParams);
      
      console.log('API response:', response);
      
      if (response.isSuccess) {
        console.log('Jobs found:', response.result.items.length);
        setJobs(response.result.items);
        setPaginationInfo({
          totalItems: response.result.pageInfo.totalItem,
          totalPages: response.result.pageInfo.totalPage,
          currentPage: state.pagination.page,
        });
      } else {
        console.log('API failed with response:', response);
        toast.error("Không thể tải danh sách việc làm");
        setJobs([]);
        setPaginationInfo({
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
        });
      }
    } catch (error) {
      console.error("Search jobs error:", error);
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
        size: 8,
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