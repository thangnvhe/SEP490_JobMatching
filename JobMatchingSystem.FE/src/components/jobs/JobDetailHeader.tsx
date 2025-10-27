import React from 'react';
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, Heart, Share2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { JobTest } from '@/models/job';

interface JobDetailHeaderProps {
  job: JobTest;
  onBack: () => void;
  onApply: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
  className?: string;
}

export const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBack,
  onApply,
  onSave,
  onShare,
  isSaved = false,
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
    return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`;
  };

  return (
    <Card className={`bg-white border-none shadow-sm ${className}`}>
      <CardContent className="p-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Job Info */}
          <div className="flex-1">
            <div className="flex items-start space-x-4 mb-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {job.company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Title and Company */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  {job.isUrgent && (
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border border-red-200">
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="h-5 w-5 text-gray-500" />
                  <span className="text-lg text-gray-700 font-medium">
                    {job.company.name}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Posted {formatTimeAgo(job.postedDate)}</span>
                  {job.applicationCount && (
                    <>
                      <Separator orientation="vertical" className="h-4 mx-3" />
                      <span>{job.applicationCount} applications</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Job Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {job.location.city}, {job.location.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium text-gray-900">
                    {formatSalary(job.salary)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900">
                    {job.jobType.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">
                    {job.experienceLevel.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex flex-col space-y-3 lg:w-48">
            <Button
              onClick={onApply}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-3 h-12"
            >
              Apply Now
            </Button>
            
            <div className="flex space-x-2">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className={`flex-1 border-gray-300 ${
                    isSaved 
                      ? 'text-red-600 border-red-300 bg-red-50' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}
              
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="flex-1 border-gray-300 text-gray-600 hover:text-gray-900"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};