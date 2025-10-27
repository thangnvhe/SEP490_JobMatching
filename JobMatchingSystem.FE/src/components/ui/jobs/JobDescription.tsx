import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { CheckCircle, Star, Clock } from 'lucide-react';
import type { JobTest } from '@/models/job';

interface JobDescriptionProps {
  job: JobTest;
  className?: string;
}

export const JobDescription: React.FC<JobDescriptionProps> = ({
  job,
  className = '',
}) => {
  // Helper function to render formatted text
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
        {line}
      </p>
    ));
  };

  // Helper function to render list items
  const renderListItems = (items: string[]) => {
    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 0) {
      return 'Expired';
    } else if (diffInDays === 1) {
      return 'Expires tomorrow';
    } else if (diffInDays <= 7) {
      return `Expires in ${diffInDays} days`;
    } else {
      return `Expires on ${date.toLocaleDateString()}`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Job Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Star className="h-5 w-5 text-emerald-600" />
            <span>Job Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {job.category.name}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Job Type</h4>
                <p className="text-gray-900 font-medium">{job.jobType.name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Experience Level</h4>
                <p className="text-gray-900 font-medium">{job.experienceLevel.name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                <p className="text-gray-900 font-medium">
                  {job.location.city}, {job.location.country}
                  {job.location.isRemote && (
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                      Remote
                    </Badge>
                  )}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Salary Range</h4>
                <p className="text-gray-900 font-medium">
                  {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Application Deadline</span>
                </h4>
                <p className="text-gray-900 font-medium">
                  {formatExpiryDate(job.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {typeof job.description === 'string' ? (
              renderFormattedText(job.description)
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {job.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderListItems(job.requirements)}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Benefits & Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderListItems(job.benefits)}
          </CardContent>
        </Card>
      )}

      {/* Skills & Tags */}
      {job.tags && job.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};