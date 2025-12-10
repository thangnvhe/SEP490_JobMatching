import React, { useState, useEffect } from "react";
import { MapPin, Briefcase, Bookmark, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CompanyServices } from "@/services/company.service";
import { API_BASE_URL } from "../../../../env.ts";
import { Job } from "@/models/job";
import { Company } from "@/models/company.ts";
interface JobCardProps {
  job: Job;
  onJobDetails: (jobId: number) => void;
  onSaveJob?: (jobId: number) => void;
  className?: string;
}

// --- Helper Functions ---

// Function to handle logo URL - similar to licenseFile in ViewCompanyList
const getLogoUrl = (logoPath?: string): string | undefined => {
  if (!logoPath) return undefined;
  
  // If it's already a full URL, return as is
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  // If it's a relative path, prepend the base URL (without /api)
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

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
    'Parttime': 'Bán thời gian',  // Updated to match API response
    'Remote': 'Làm từ xa',
    'Other': 'Khác'
  };
  return jobTypeMap[jobType] || jobType;
};

const formatExperience = (experienceYear?: number) => {
  if (!experienceYear || experienceYear < 0) {
    return "Không yêu cầu";
  }
  if (experienceYear === 0) {
    return "Không yêu cầu";
  }
  if (experienceYear === 1) {
    return "1 năm";
  }
  return `${experienceYear} năm`;
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
  
  const trimmed = cleanedLocation.trim();
  // Limit to 40 characters with ellipsis
  return trimmed.length > 40 ? `${trimmed.substring(0, 30)}...` : trimmed;
};



// --- JobCard Component ---

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobDetails,
  onSaveJob,
  className = "",
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setCompanyLoading(true);
        const response = await CompanyServices.getCompanyById(job.companyId.toString());
        if (response.isSuccess && response.result) {
          setCompany(response.result);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [job.companyId]);
  return (
    <Card
      className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Title, Status, Bookmark */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Company Avatar */}
            <div className="flex-shrink-0">
              {companyLoading ? (
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
              ) : (
                <Avatar className="w-12 h-12 rounded-lg">
                  <AvatarImage 
                    src={getLogoUrl(company?.logo)} 
                    alt={company?.name || `Company ${job.companyId}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold rounded-lg">
                    {company?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            {/* Job Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3
                className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-emerald-600 cursor-pointer leading-tight"
                onClick={() => onJobDetails(job.jobId)}
                title={job.title}
              >
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium text-sm truncate">
                {companyLoading ? 'Đang tải...' : (company?.name || `Company ${job.companyId}`)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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
          
          {job.experienceYear !== undefined && (
            <Badge
              variant="outline"
              className="text-blue-700 border-blue-200 bg-blue-50 text-xs font-normal"
            >
              Kinh nghiệm: {formatExperience(job.experienceYear)}
            </Badge>
          )}
          
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
            {job.taxonomies.slice(0, 3).map((taxonomy: any, index: number) => (
              <Badge
                key={taxonomy.id || index}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100 text-red-700"
              >
                {taxonomy.name} 
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
