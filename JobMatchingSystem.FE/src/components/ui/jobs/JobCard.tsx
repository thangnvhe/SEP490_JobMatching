import React from 'react';
import { Clock, MapPin, Briefcase, DollarSign, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { JobTest as Job } from '@/models/job';

interface JobCardProps {
  job: Job;
  onJobDetails: (jobId: string) => void;
  onSaveJob?: (jobId: string) => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobDetails,
  onSaveJob,
  className = '',
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    return `${salary.currency}${salary.min.toLocaleString()}-${salary.currency}${salary.max.toLocaleString()}`;
  };

  return (
    <Card className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-8 space-y-7">
        {/* Header with time badge and bookmark */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Badge 
              variant="secondary" 
              className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1"
            >
              {formatTimeAgo(job.postedDate)}
            </Badge>
            {job.isUrgent && (
              <Badge 
                variant="destructive" 
                className="bg-red-50 text-red-700 border border-red-200"
              >
                Urgent
              </Badge>
            )}
          </div>
          {onSaveJob && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveJob(job.id)}
              className="p-2 hover:bg-gray-100"
            >
              <Bookmark className="h-5 w-5 text-gray-400" />
            </Button>
          )}
        </div>

        {/* Company and Job Info */}
        <div className="flex items-start space-x-5">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.company.logo ? (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {job.company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">
              {job.company.name}
            </p>
          </div>
        </div>

        {/* Job Attributes and Action */}
        <div className="flex justify-between items-end">
          {/* Job Attributes */}
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-sm font-medium">{job.category.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">{job.jobType.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">{formatSalary(job.salary)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">
                {job.location.city}, {job.location.country}
              </span>
            </div>
          </div>

          {/* Job Details Button */}
          <Button
            onClick={() => onJobDetails(job.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2"
          >
            Job details
          </Button>
        </div>

        {/* Tags (if any) */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {job.tags.length > 3 && (
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-200 text-xs"
              >
                +{job.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};