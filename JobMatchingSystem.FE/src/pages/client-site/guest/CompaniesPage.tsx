import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyCard } from '@/components/ui/companies/CompanyCard';
import { 
  Building2, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { companyService } from '@/services/test-services/companyService';
import type { Company } from '@/models/company';
import { useNavigate } from 'react-router-dom';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allCompanies = await companyService.getAllCompanies();
        setCompanies(allCompanies);
        setFilteredCompanies(allCompanies);
      } catch (err) {
        setError('Không thể tải danh sách công ty');
        console.error('Error fetching companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedLocation) {
      filtered = filtered.filter(company =>
        company.address.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedLocation, companies]);

  const handleCompanyClick = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  // Get unique locations from companies
  const uniqueLocations = Array.from(new Set(companies.map(company => {
    // Extract city from address (assuming format: "City, Country" or "City")
    const parts = company.address.split(',');
    return parts[0].trim();
  }))).filter(Boolean).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Đang tải danh sách công ty...
              </h2>
              <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
              <p className="text-gray-500 mb-6">
                Có lỗi xảy ra khi tải danh sách công ty.
              </p>
              <Button onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Khám Phá Các Công Ty Hàng Đầu
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tìm hiểu về các công ty uy tín, môi trường làm việc tuyệt vời và cơ hội nghề nghiệp phù hợp với bạn.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Tìm kiếm công ty theo tên, mô tả, địa điểm..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      className="pl-9 pr-10 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none min-w-[180px]"
                    >
                      <option value="">Tất cả địa điểm</option>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Lọc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div>
              Hiển thị <span className="font-semibold">{filteredCompanies.length}</span> công ty
              {searchTerm && (
                <span> cho từ khóa "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy công ty nào' : 'Chưa có công ty nào'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `Không có công ty nào phù hợp với từ khóa "${searchTerm}"`
                  : 'Hiện tại chưa có công ty nào trong hệ thống.'
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={handleCompanyClick}
                className="h-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;