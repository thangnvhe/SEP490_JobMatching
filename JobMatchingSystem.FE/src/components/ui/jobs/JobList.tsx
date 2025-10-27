import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobCard } from './JobCard';
import type { JobTest as Job } from '@/models/job';

interface JobListProps {
  jobs: Job[];
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
  { value: 'latest', label: 'Sort by latest' },
  { value: 'oldest', label: 'Sort by oldest' },
  { value: 'salary-high', label: 'Salary: High to Low' },
  { value: 'salary-low', label: 'Salary: Low to High' },
  { value: 'relevance', label: 'Most relevant' },
];

export const JobList: React.FC<JobListProps> = ({
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
  className = '',
}) => {
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  const renderPaginationButton = (pageNumber: number, isActive: boolean = false) => (
    <Button
      key={pageNumber}
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onPageChange(pageNumber)}
      className={`w-10 h-10 ${
        isActive 
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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
        buttons.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
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
        buttons.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
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
            <div key={index} className="bg-white rounded-xl p-8 border border-gray-100">
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
                      <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
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