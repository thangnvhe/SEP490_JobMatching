import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
import { JobSearchFilter } from '@/components/ui/jobs/JobSearchFilter';
import { JobList } from '@/components/ui/jobs/JobList';
import { jobService } from '@/services/test-services/jobService';
import type { 
  JobTest as Job, 
  JobSearchFilters, 
  JobSearchParams, 
  JobSearchResponse 
} from '@/models/job';

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResponse, setSearchResponse] = useState<JobSearchResponse | null>(null);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<JobSearchFilters>(() => ({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    categories: searchParams.getAll('categories'),
    jobTypes: searchParams.getAll('jobTypes'),
    experienceLevels: searchParams.getAll('experienceLevels'),
    datePosted: searchParams.get('datePosted') || 'all',
    tags: searchParams.getAll('tags'),
    salaryRange: searchParams.get('salaryMin') && searchParams.get('salaryMax') ? {
      min: parseInt(searchParams.get('salaryMin')!),
      max: parseInt(searchParams.get('salaryMax')!)
    } : undefined
  }));

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 6,
    sortBy: searchParams.get('sortBy') || 'latest'
  });

  // Update URL when filters or pagination change
  const updateURL = useCallback((newFilters: JobSearchFilters, newPagination: typeof pagination) => {
    const params = new URLSearchParams();
    
    if (newFilters.keyword) params.set('keyword', newFilters.keyword);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.datePosted && newFilters.datePosted !== 'all') params.set('datePosted', newFilters.datePosted);
    if (newFilters.categories?.length) newFilters.categories.forEach(cat => params.append('categories', cat));
    if (newFilters.jobTypes?.length) newFilters.jobTypes.forEach(type => params.append('jobTypes', type));
    if (newFilters.experienceLevels?.length) newFilters.experienceLevels.forEach(level => params.append('experienceLevels', level));
    if (newFilters.tags?.length) newFilters.tags.forEach(tag => params.append('tags', tag));
    if (newFilters.salaryRange) {
      params.set('salaryMin', newFilters.salaryRange.min.toString());
      params.set('salaryMax', newFilters.salaryRange.max.toString());
    }
    
    if (newPagination.page > 1) params.set('page', newPagination.page.toString());
    if (newPagination.sortBy !== 'latest') params.set('sortBy', newPagination.sortBy);
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Search jobs function
  const searchJobs = useCallback(async (searchFilters: JobSearchFilters, searchPagination: typeof pagination) => {
    try {
      setLoading(true);
      
      const searchParams: JobSearchParams = {
        ...searchFilters,
        page: searchPagination.page,
        limit: searchPagination.limit,
        sortBy: searchPagination.sortBy as any
      };

      const response = await jobService.searchJobs(searchParams);
      setSearchResponse(response);
      setJobs(response.jobs);
    } catch (error) {
      console.error('Error searching jobs:', error);
      console.error('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

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
  };

  // Handle job details navigation
  const handleJobDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handle save job
  const handleSaveJob = async (jobId: string) => {
    try {
      await jobService.saveJob(jobId);
      console.log('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      console.error('Failed to save job. Please try again.');
    }
  };

  // Load jobs on mount and when filters/pagination change
  useEffect(() => {
    searchJobs(filters, pagination);
  }, [filters, pagination, searchJobs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-6">
          {/* Sidebar - Search Filters */}
          <div className="w-1/4 flex-shrink-0">
            <div className="sticky top-6">
              <JobSearchFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">       

            {/* Job List */}
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