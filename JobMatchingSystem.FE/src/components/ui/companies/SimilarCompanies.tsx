import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanyCard } from '@/components/ui/companies/CompanyCard';
import { 
  Building2, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import { companyService } from '@/services/test-services/companyService';
import type { Company } from '@/models/company';
import { useNavigate } from 'react-router-dom';

interface SimilarCompaniesProps {
  currentCompanyId: string;
  currentCompanyName: string;
}

export const SimilarCompanies: React.FC<SimilarCompaniesProps> = ({
  currentCompanyId,
  currentCompanyName
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSimilarCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const similarCompanies = await companyService.getSimilarCompanies(currentCompanyId, 6);
        setCompanies(similarCompanies);
      } catch (err) {
        setError('Không thể tải danh sách công ty tương tự');
        console.error('Error fetching similar companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarCompanies();
  }, [currentCompanyId]);

  const handleCompanyClick = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const handleViewAllCompanies = () => {
    navigate('/companies');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Công ty tương tự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-500">Đang tải danh sách công ty...</p>
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
            <Building2 className="w-5 h-5 text-green-600" />
            Công ty tương tự
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

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Công ty tương tự
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy công ty tương tự
            </h3>
            <p className="text-gray-500 mb-4">
              Hiện tại chưa có công ty nào tương tự như {currentCompanyName}.
            </p>
            <Button 
              variant="outline"
              onClick={handleViewAllCompanies}
            >
              Xem tất cả công ty
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
            <Building2 className="w-5 h-5 text-green-600" />
            Công ty tương tự
          </CardTitle>
          
          <Button 
            variant="outline" 
            onClick={handleViewAllCompanies}
            className="hidden sm:flex items-center gap-2"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Company Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onViewDetails={handleCompanyClick}
              className="h-full"
            />
          ))}
        </div>

        {/* View All Button (Mobile) */}
        <div className="flex justify-center sm:hidden pt-4">
          <Button 
            variant="outline" 
            onClick={handleViewAllCompanies}
            className="w-full"
          >
            Xem tất cả công ty
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};