import React, { useState, useEffect } from "react";
import { MapPin, Briefcase, Bookmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JobDetailResponse } from "@/models/job";
import { CompanyServices } from "@/services/company.service";
interface JobCardProps {
  job: JobDetailResponse;
  onJobDetails: (jobId: number) => void;
  onSaveJob?: (jobId: number) => void;
  className?: string;
}

// --- Helper Functions ---

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

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

const formatSalary = (salaryMin?: number, salaryMax?: number) => {
  // Display salaries in millions without currency symbol, e.g. "8 - 12 triệu"
  if (!salaryMin && !salaryMax) return "Thương lượng";

  const toMillions = (value?: number) => {
    if (!value) return undefined;
    const m = value / 1_000_000;
    // Show integer when whole number, otherwise one decimal
    return Number.isInteger(m) ? `${m}` : `${m.toFixed(1)}`;
  };

  const minM = toMillions(salaryMin);
  const maxM = toMillions(salaryMax);

  if (minM && maxM) {
    if (minM === maxM) return `${minM} triệu VND`;
    return `${minM} - ${maxM} triệu VND`;
  }

  if (minM) return `Từ ${minM} triệu VND`;
  if (maxM) return `Lên đến ${maxM} triệu VND`;

  return "Thương lượng";
};

const getJobTypeDisplay = (jobType: string) => {
  const jobTypeMap: { [key: string]: string } = {
    'FullTime': 'Toàn thời gian',
    'PartTime': 'Bán thời gian', 
    'Remote': 'Làm từ xa'
  };
  return jobTypeMap[jobType] || jobType;
};

const cleanLocation = (location: string) => {
  // Remove common prefixes from location string
  const prefixesToRemove = [
    'Địa điểm làm việc\n',
    'Địa điểm làm việc ',
    'Địa chỉ làm việc\n',
    'Địa chỉ làm việc ',
  ];
  
  let cleanedLocation = location;
  prefixesToRemove.forEach(prefix => {
    if (cleanedLocation.startsWith(prefix)) {
      cleanedLocation = cleanedLocation.substring(prefix.length);
    }
  });
  
  return cleanedLocation.trim();
};

const getStatusColor = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Moderated': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Expired': 'bg-yellow-100 text-yellow-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

// --- JobCard Component ---

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobDetails,
  onSaveJob,
  className = "",
}) => {
  const [companyName, setCompanyName] = useState<string>(`Company ${job.companyId}`);

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await CompanyServices.getCompanyById(job.companyId.toString());
        if (response.isSuccess && response.result) {
          setCompanyName(response.result.name || `Company ${job.companyId}`);
        }
      } catch (error) {
        console.error('Error fetching company name:', error);
        // Keep default name if API call fails
      }
    };

    fetchCompanyName();
  }, [job.companyId]);
  return (
    <Card
      className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Title, Status, Bookmark */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <h3
              className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-emerald-600 cursor-pointer leading-tight"
              onClick={() => onJobDetails(job.jobId)}
              title={job.title}
            >
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium text-sm">
              {companyName}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Status Badge */}
            <Badge className={`text-xs ${getStatusColor(job.status)}`}>
              {job.status}
            </Badge>
            
            {/* Bookmark Button */}
            {onSaveJob && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSaveJob(job.jobId)}
                className="p-1 hover:bg-gray-100"
                aria-label="Lưu việc làm"
              >
                <Bookmark className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
        </div>

        {/* Job Info Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="text-gray-600 border-gray-200 bg-gray-50 text-xs font-normal"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {cleanLocation(job.location)}
          </Badge>
          
          <Badge
            variant="outline"
            className="text-gray-600 border-gray-200 bg-gray-50 text-xs font-normal"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            {getJobTypeDisplay(job.jobType)}
          </Badge>
          
          <Badge
            variant="outline"
            className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs font-normal"
          >
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Badge>
        </div>

        {/* Skills/Taxonomies */}
        {job.taxonomies && job.taxonomies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.taxonomies.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700"
              >
                {skill}
              </Badge>
            ))}
            {job.taxonomies.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700"
              >
                +{job.taxonomies.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer: Time + Action */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(job.createdAt)}
            </span>
            {job.expiredAt && (
              <span>
                Hết hạn: {new Date(job.expiredAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onJobDetails(job.jobId)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm h-auto"
          >
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
