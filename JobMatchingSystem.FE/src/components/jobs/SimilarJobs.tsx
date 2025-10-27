import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/ui/jobs/JobCard';
import { ArrowRight, Briefcase } from 'lucide-react';
import type { JobTest } from '@/models/job';

interface SimilarJobsProps {
  jobs: JobTest[];
  currentJobId: string;
  onJobDetails: (jobId: string) => void;
  onSaveJob?: (jobId: string) => void;
  onViewAllJobs?: () => void;
  loading?: boolean;
  className?: string;
}

export const SimilarJobs: React.FC<SimilarJobsProps> = ({
  jobs,
  currentJobId,
  onJobDetails,
  onSaveJob,
  onViewAllJobs,
  loading = false,
  className = '',
}) => {
  // Filter out current job and limit to 3 similar jobs
  const similarJobs = jobs.filter(job => job.id !== currentJobId).slice(0, 3);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <span>Similar Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="space-y-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-6"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex space-x-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded w-16"></div>
                      ))}
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarJobs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-emerald-600" />
            <span>Similar Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Similar Jobs</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find similar jobs at the moment.
            </p>
            {onViewAllJobs && (
              <Button
                variant="outline"
                onClick={onViewAllJobs}
                className="border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
              >
                Browse All Jobs
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-emerald-600" />
          <span>Similar Jobs</span>
        </CardTitle>
        {onViewAllJobs && similarJobs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllJobs}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {similarJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobDetails={onJobDetails}
              onSaveJob={onSaveJob}
              className="shadow-sm hover:shadow-md transition-shadow duration-200"
            />
          ))}
        </div>
        
        {/* View More Button */}
        {onViewAllJobs && similarJobs.length >= 3 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={onViewAllJobs}
              className="w-full border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              View More Similar Jobs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};