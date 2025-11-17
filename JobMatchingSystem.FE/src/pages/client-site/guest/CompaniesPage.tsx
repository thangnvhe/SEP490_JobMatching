import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyCard } from '@/components/ui/companies/CompanyCard';
import { 
  Building2, 
  Search, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CompanyServices } from '@/services/company.service';
import type { Company } from '@/models/company';
import { useNavigate } from 'react-router-dom';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input tạm thời
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;
  
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        direction: false
      };
      
      const response = await CompanyServices.getAllCompanies(params);
      
      if (response?.isSuccess && response?.result) {
        const { items, pageInfo } = response.result;
        
        // Filter chỉ hiển thị company đã approve cho guest (status = 1)
        // Nếu API không filter thì chúng ta filter ở frontend
        const approvedCompanies = items?.filter((company: Company) => company.status === 1) || [];
        
        setCompanies(approvedCompanies);
        // Note: Nếu filter frontend thì totalItems không chính xác, nhưng để test trước
        setTotalItems(pageInfo?.totalItem || 0);
        setTotalPages(pageInfo?.totalPage || 1);
      } else {
        setError('Không thể tải danh sách công ty');
        setCompanies([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách công ty');
      console.error('Error fetching companies:', err);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const handleCompanyClick = (companyId: number) => {
    navigate(`/companies/${companyId}`);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && companies.length === 0) {
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
              <Button onClick={() => fetchCompanies()}>
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
              <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Nhập tên công ty cần tìm..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    className="pl-10 pr-10"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="px-6">
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                  {searchTerm && (
                    <Button type="button" variant="outline" onClick={handleClearSearch}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div>
              Hiển thị <span className="font-semibold">{companies.length}</span> của <span className="font-semibold">{totalItems}</span> công ty
              {searchTerm && (
                <span> cho từ khóa "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy công ty nào
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `Không có công ty nào phù hợp với từ khóa "${searchTerm}"`
                  : 'Hiện tại chưa có công ty nào được đăng ký.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onViewDetails={handleCompanyClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let page;
                    if (totalPages <= 5) {
                      page = index + 1;
                    } else if (currentPage <= 3) {
                      page = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + index;
                    } else {
                      page = currentPage - 2 + index;
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="flex items-center gap-2"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Loading overlay for pagination */}
        {isLoading && companies.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Đang tải...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;