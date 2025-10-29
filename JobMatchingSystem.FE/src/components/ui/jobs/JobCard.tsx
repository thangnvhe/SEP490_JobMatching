import React from 'react';
import { MapPin, Briefcase, DollarSign, Bookmark } from 'lucide-react';
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
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ngày trước`;
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    return `${salary.min.toLocaleString()}-${salary.max.toLocaleString()} ${salary.currency}`;
  };

  return (
    <Card className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-5 space-y-4">
        {/* Header with bookmark */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {job.isUrgent && (
              <Badge 
                variant="destructive" 
                className="bg-red-50 text-red-700 border border-red-200 text-xs"
              >
                Gấp
              </Badge>
            )}
          </div>
          {onSaveJob && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveJob(job.id)}
              className="p-1 hover:bg-gray-100"
            >
              <Bookmark className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>

        {/* Company and Job Info */}
        <div className="flex items-start space-x-4">
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
                <span className="text-white font-semibold text-sm">
                  {job.company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium text-sm">
              {job.company.name}
            </p>
            
            {/* Location and Experience */}
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location.city}, {job.location.country}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>{job.experienceLevel.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">{formatSalary(job.salary)}</span>
          </div>
        </div>

        {/* Action Button and Time */}
        <div className="flex justify-between items-center pt-2">
          <Button
            onClick={() => onJobDetails(job.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm"
          >
            Xem chi tiết
          </Button>
          <span className="text-xs text-gray-400">{formatTimeAgo(job.postedDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
};