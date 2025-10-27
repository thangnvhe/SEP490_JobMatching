import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobCard } from '@/components/ui/jobs/JobCard';
import { 
  Briefcase, 
  ArrowRight, 
  Loader2,
  Building2
} from 'lucide-react';
import { companyService } from '@/services/test-services/companyService';
import type { JobTest } from '@/models/job';
import { useNavigate } from 'react-router-dom';

interface CompanyJobsProps {
  companyId: string;
  companyName: string;
}

export const CompanyJobs: React.FC<CompanyJobsProps> = ({ companyId, companyName }) => {
  const [jobs, setJobs] = useState<JobTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const companyJobs = await companyService.getCompanyJobs(companyId);
        setJobs(companyJobs);
      } catch (err) {
        setError('Không thể tải danh sách việc làm');
        console.error('Error fetching company jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [companyId]);

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewAllJobs = () => {
    navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Việc làm tại {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Đang tải danh sách việc làm...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Việc làm tại {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Việc làm tại {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có việc làm nào
            </h3>
            <p className="text-gray-500 mb-4">
              Công ty này hiện tại chưa có vị trí tuyển dụng nào.
            </p>
            <Button 
              variant="outline"
              onClick={handleViewAllJobs}
            >
              Xem tất cả việc làm
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Việc làm tại {companyName}
            <Badge variant="secondary" className="ml-2">
              {jobs.length} vị trí
            </Badge>
          </CardTitle>
          
          {jobs.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleViewAllJobs}
              className="hidden sm:flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Job Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard 
              key={job.id}
              job={job}
              onJobDetails={handleJobClick}
              className="h-full hover:shadow-md transition-shadow"
            />
          ))}
        </div>

        {/* View All Button (Mobile) */}
        {jobs.length > 0 && (
          <div className="flex justify-center sm:hidden pt-4">
            <Button 
              variant="outline" 
              onClick={handleViewAllJobs}
              className="w-full"
            >
              Xem tất cả {jobs.length} việc làm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};