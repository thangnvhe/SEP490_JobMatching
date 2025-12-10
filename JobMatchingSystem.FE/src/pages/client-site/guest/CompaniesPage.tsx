import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, MapPin, Mail, Phone, Building2, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Services & Types
import { CompanyServices } from "@/services/company.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { Company } from "@/models/company";
import { useDebounce } from "@/hooks/useDebounce";
import { API_BASE_URL } from "../../../../env";

export default function CompaniesPage() {
  const navigate = useNavigate();

  // Data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 9,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: '',
    isDecending: false,
  });

  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 9,
    search: '',
    sortBy: '',
  });

  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllCompanies = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      const response = await CompanyServices.getAllCompaniesWithPagination(params);

      // Filter approved companies (status === 1)
      const approvedCompanies = response.result.items?.filter((c: Company) => c.status === 1) || [];

      setCompanies(approvedCompanies);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải danh sách công ty");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };
    getAllCompanies(params);
  }, [getAllCompanies, debouncedKeyword, paginationInput]);

  const handlePageChange = (page: number) => {
    setPaginationInput(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLogoUrl = (logoPath?: string) => {
    if (!logoPath) return undefined;
    if (logoPath.startsWith("http")) return logoPath;
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const path = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${baseUrl}${path}`;
  };

  const generatePageNumbers = () => {
    const { currentPage, totalPage } = paginationInfo;
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPage <= maxVisible) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPage);
      } else if (currentPage >= totalPage - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPage - 3; i <= totalPage; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPage);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br  from-emerald-900 via-emerald-800 to-emerald-950 pt-20 pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px] opacity-10"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Khám Phá Các Doanh Nghiệp <span className="text-emerald-400">Hàng Đầu</span>
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl font-light">
              Tìm kiếm môi trường làm việc lý tưởng và phát triển sự nghiệp của bạn tại các công ty uy tín nhất.
            </p>

            {/* Search Box */}
            <div className="pt-8 relative max-w-4xl mx-auto">
              <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2 items-center">
                {/* Keyword Search */}
                <div className="flex-2 relative w-full md:w-auto flex items-center border-b md:border-b-0 md:border-r border-gray-100 px-2">
                  <Search className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                  <Input
                    type="text"
                    placeholder="Nhập tên công ty bạn muốn tìm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent placeholder:text-gray-400 flex-1"
                  />
                </div>

                {/* Search Button */}
                <Button
                  onClick={() => getAllCompanies({ ...paginationInput, search: keyword })}
                  className="w-full md:w-auto rounded-xl px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-200/50 border-0 rounded-2xl" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy công ty nào</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác xem sao nhé.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  className="group flex flex-col h-full bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-gray-100 hover:ring-emerald-100"
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  <CardHeader className="p-6 pb-0">
                    <div className="flex justify-between items-start">
                      <div className="h-20 w-20 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-emerald-200 transition-colors">
                        <Avatar className="h-full w-full rounded-lg">
                          <AvatarImage src={getLogoUrl(company.logo)} className="object-contain" />
                          <AvatarFallback className="rounded-lg text-2xl font-bold text-emerald-600 bg-emerald-50">
                            {company.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors ">
                      {company.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 flex-1 flex flex-col">
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                      {company.description || "Chưa có mô tả về công ty này."}
                    </p>

                    <div className="space-y-3 text-sm text-gray-500 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                        <span className="line-clamp-1">{company.address || "Chưa cập nhật địa chỉ"}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span className="truncate">{company.email || "Chưa cập nhật email"}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span className="truncate">{company.phoneContact || "Chưa cập nhật số điện thoại"}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between border-t border-gray-50 group-hover:border-emerald-50 transition-colors">
                      <span className="text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center">
                        Xem chi tiết <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {paginationInfo.totalPage > 1 && (
              <div className="mt-16 pb-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginationInfo.currentPage > 1 && handlePageChange(paginationInfo.currentPage - 1)}
                        className={paginationInfo.currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 border-none shadow-sm bg-white"}
                      />
                    </PaginationItem>

                    {generatePageNumbers().map((page, i) => (
                      <PaginationItem key={i}>
                        {page === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
                            isActive={paginationInfo.currentPage === page}
                            className={`cursor-pointer transition-all duration-200 border-none shadow-sm ${paginationInfo.currentPage === page
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white font-bold scale-105"
                                : "hover:bg-emerald-50 hover:text-emerald-600 bg-white"
                              }`}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginationInfo.currentPage < paginationInfo.totalPage && handlePageChange(paginationInfo.currentPage + 1)}
                        className={paginationInfo.currentPage === paginationInfo.totalPage ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 border-none shadow-sm bg-white"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
