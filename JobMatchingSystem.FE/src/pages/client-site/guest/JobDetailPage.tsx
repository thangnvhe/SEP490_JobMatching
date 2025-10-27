import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobDetailHeader } from '@/components/ui/jobs/JobDetailHeader';
import { JobDescription } from '@/components/ui/jobs/JobDescription';
import { CompanyInfo } from '@/components/ui/companies/CompanyContact';
import { SimilarJobs } from '@/components/ui/jobs/SimilarJobs';
import { jobService } from '@/services/test-services/jobService';
import type { JobTest as Job } from '@/models/job';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State management
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarJobsLoading, setSimilarJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load job details and similar jobs
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!id) {
        setError('Job ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load job details
        const jobData = await jobService.getJobById(id);
        
        if (!jobData) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        setJob(jobData);
        setLoading(false);

        // Load similar jobs in parallel
        setSimilarJobsLoading(true);
        try {
          const similarJobsData = await jobService.getSimilarJobs(id, 6);
          setSimilarJobs(similarJobsData);
        } catch (error) {
          console.error('Error loading similar jobs:', error);
          // Don't show error for similar jobs, just leave empty
        } finally {
          setSimilarJobsLoading(false);
        }

      } catch (error) {
        console.error('Error loading job details:', error);
        setError('Failed to load job details. Please try again.');
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id]);

  // Handle navigation back to jobs list
  const handleBack = () => {
    navigate('/jobs');
  };

  // Handle job application
  const handleApply = async () => {
    if (!job) return;
    
    try {
      await jobService.applyToJob(job.id);
      // In a real app, you might show a success message or redirect to application form
      console.log('Application submitted successfully!');
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  // Handle save/unsave job
  const handleSaveJob = async () => {
    if (!job) return;
    
    try {
      if (isSaved) {
        await jobService.unsaveJob(job.id);
        setIsSaved(false);
        console.log('Job removed from saved jobs');
      } else {
        await jobService.saveJob(job.id);
        setIsSaved(true);
        console.log('Job saved successfully!');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  // Handle share job
  const handleShareJob = async () => {
    if (!job) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title} at ${job.company.name}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Job link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing job:', error);
      // Fallback to manual copy
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Job link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard access failed:', clipboardError);
      }
    }
  };

  // Handle similar job click
  const handleSimilarJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  // Handle view all jobs from company
  const handleViewCompanyJobs = () => {
    if (!job) return;
    navigate(`/jobs?company=${job.company.id}`);
  };

  // Handle view all similar jobs
  const handleViewAllSimilarJobs = () => {
    if (!job) return;
    navigate(`/jobs?category=${job.category.id}&experience=${job.experienceLevel.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="flex space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="flex gap-6">
              <div className="flex-1 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-80 space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Job Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={handleBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Job Header */}
          <JobDetailHeader
            job={job}
            onBack={handleBack}
            onApply={handleApply}
            onSave={handleSaveJob}
            onShare={handleShareJob}
            isSaved={isSaved}
          />

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Job Details */}
            <div className="flex-1">
              <JobDescription job={job} />
            </div>

            {/* Right Column - Company Info & Similar Jobs */}
            <div className="w-full lg:w-80 space-y-6">
              <CompanyInfo 
                job={job} 
                onViewAllJobs={handleViewCompanyJobs}
              />
              
              <SimilarJobs
                jobs={similarJobs}
                currentJobId={job.id}
                onJobDetails={handleSimilarJobClick}
                onSaveJob={handleSaveJob}
                onViewAllJobs={handleViewAllSimilarJobs}
                loading={similarJobsLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;