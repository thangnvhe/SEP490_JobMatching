import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Settings2,
  TrendingUp,
  Users,
  Warehouse,
  Layers,
  ChevronLeft,
  ChevronRight,
  Heart,
  Filter,
  DollarSign,
  Clock
} from "lucide-react";
import { ProvincesService } from "@/services/provinces.service";
import { useCallback, useEffect, useState } from "react";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";
import { RegisterDialog } from "@/pages/client-site/auth/RegisterDialog";
import { ForgotPasswordDialog } from "@/pages/client-site/auth/ForgotPasswordDialog";
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { shortenAddress } from "@/lib/utils/addressUtils";
import type { Job } from "@/models/job";
import type { Company } from "@/models/company";
import type { Taxonomy } from "@/models/taxonomy";
import { useNavigate } from "react-router-dom";
import { PageInfo, PaginationParamsInput } from "@/models/base";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HomePage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  // Feature Jobs State (Existing)
  const [jobs, setJobs] = useState<Job[]>([]);

  // Companies & Taxonomies State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);

  // Best Jobs State (Refactored Pattern)
  const [bestJobs, setBestJobs] = useState<Job[]>([]);
  const [bestJobsLoading, setBestJobsLoading] = useState(true);
  const [bestJobsError, setBestJobsError] = useState<string | null>(null);
  const [bestJobsPagination, setBestJobsPagination] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 12,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: "",
    isDecending: false,
  });
  const [paginationParamsInput, setPaginationParamsInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 12,
    search: "",
    sortBy: "createdAt",
    isDescending: true,
  });

  // Filter states for Best Jobs
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Initial Data Fetching (Hero, Categories, Top Companies, Featured Jobs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taxRes, jobRes, compRes] = await Promise.all([
          TaxonomyService.getAllTaxonomies(),
          JobServices.getAllWithPagination({ page: 1, size: 6, isHighlight: true }), // Assuming featured jobs
          CompanyServices.getAllCompaniesWithPagination({ page: 1, size: 8 }),
        ]);

        if (taxRes.result) {
          setTaxonomies(taxRes.result.slice(0, 10));
        }
        if (jobRes.result && jobRes.result.items) {
          setJobs(jobRes.result.items);
        }
        if (compRes.result && compRes.result.items) {
          setCompanies(compRes.result.items);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  // Best Jobs Fetching Logic (Pattern)
  const fetchBestJobs = useCallback(async (params: PaginationParamsInput) => {
    try {
      setBestJobsLoading(true);
      setBestJobsError(null);
      const response = await JobServices.getAllBestJobs(params);
      setBestJobs(response.result.items);
      setBestJobsPagination(response.result.pageInfo);
    } catch (err: any) {
      setBestJobsError(err.response?.data?.message || "Lỗi khi tải danh sách việc làm tốt nhất");
    } finally {
      setBestJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = {
      ...paginationParamsInput,
      location: selectedLocation || undefined, // Add location filter if selected
    };
    fetchBestJobs(params);
  }, [fetchBestJobs, paginationParamsInput, selectedLocation]);

  const handleBestJobsPageChange = (page: number) => {
    setPaginationParamsInput((prev) => ({ ...prev, page }));
  };

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(prev => prev === location ? "" : location); // Toggle
    setPaginationParamsInput(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const getCategoryIcon = (index: number) => {
    const icons = [
      Users,
      TrendingUp,
      Settings2,
      Warehouse,
      Building2,
      Briefcase,
      Layers,
    ];
    return icons[index % icons.length];
  };

  // Province State
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await ProvincesService.getAllProvinces();
        // Remove prefixes "Thành phố" and "Tỉnh" for cleaner UI buttons
        const provinceNames = response.map(p =>
          p.name.replace(/^(Thành phố |Tỉnh )/, "")
        );
        // Show all provinces but use horizontal scroll UI
        setLocations(provinceNames);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative pt-14 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50/50 to-white -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors">
                <span className="mr-2">🚀</span> #1 Bảng Việc Làm Hàng Đầu
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                Tìm <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600">Công Việc Mơ Ước</span> <br />
                Của Bạn Ngay Hôm Nay!
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                Kết nối với hàng nghìn nhà tuyển dụng và tìm cơ hội hoàn hảo phù hợp với kỹ năng và nguyện vọng của bạn.
              </p>

              <div className="pt-8 relative max-w-4xl mx-auto mb-8">
                <div className="absolute bg-linear-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2 items-center">
                  <div className="flex-2 relative w-full md:w-auto flex items-center border-b md:border-b-0 md:border-r border-gray-100 px-2">
                    <Search className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                    <Input
                      type="text"
                      placeholder="Tên công việc, từ khóa..."
                      className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent placeholder:text-gray-400 flex-1"
                    />
                  </div>
                  <Button
                    className="w-full md:w-auto rounded-xl px-8 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                  >
                    Tìm Kiếm Việc Làm
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium">Phổ biến:</span>
                <div className="flex flex-wrap gap-2">
                  {['Thiết Kế', 'Lập Trình', 'Quản Lý'].map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-white hover:border-emerald-200 transition-all">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-linear-to-r from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-30 animate-pulse" />
              <img
                src="/banner-img-1.png"
                alt="Minh họa tìm kiếm việc làm"
                className="relative w-full h-auto drop-shadow-2xl hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      <LoginDialog
        isOpen={loginOpen}
        onOpenChange={setLoginOpen}
        onOpenRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onOpenForgotPassword={() => {
          setLoginOpen(false);
          setForgotPasswordOpen(true);
        }}
      />
      <RegisterDialog
        isOpen={registerOpen}
        onOpenChange={setRegisterOpen}
        onOpenLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
      <ForgotPasswordDialog
        isOpen={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onOpenLogin={() => {
          setForgotPasswordOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Best Jobs Section (Moved Above Categories) */}
      {!bestJobsError && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">Việc làm phù hợp với bạn</span>
              </h2>
              <Button variant="link" className="text-emerald-600 hover:text-emerald-700">Xem tất cả</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 px-2 text-slate-600 font-medium border-r border-slate-200 pr-4 mr-2">
                <Filter className="h-4 w-4" />
                Lọc theo:
              </div>

              <Select defaultValue="location">
                <SelectTrigger className="w-[140px] border-0 shadow-none font-medium text-slate-700 focus:ring-0">
                  <SelectValue placeholder="Địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Địa điểm</SelectItem>
                  <SelectItem value="salary">Mức lương</SelectItem>
                  <SelectItem value="exp">Kinh nghiệm</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block shrink-0"></div>

              <div className="flex-1 min-w-0 relative group">
                {/* Scroll Left Button */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-white via-white to-transparent pr-4 pl-0 py-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-white shadow-md border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      const container = document.getElementById('province-scroll-container');
                      if (container) {
                        container.scrollBy({ left: -200, behavior: 'smooth' });
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>

                {/* Scroll Container */}
                <div
                  id="province-scroll-container"
                  className="flex gap-2 overflow-x-auto scroll-smooth pb-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <Button
                    variant={selectedLocation === "" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedLocation("")}
                    className={`shrink-0 ${selectedLocation === "" ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-slate-100 hover:text-emerald-600"}`}
                  >
                    Tất cả
                  </Button>
                  {locations.map(loc => (
                    <Button
                      key={loc}
                      variant={selectedLocation === loc ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleLocationFilter(loc)}
                      className={`shrink-0 ${selectedLocation === loc ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-slate-100 hover:text-emerald-600"}`}
                    >
                      {loc}
                    </Button>
                  ))}
                </div>

                {/* Scroll Right Button */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-l from-white via-white to-transparent pl-4 pr-0 py-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-white shadow-md border-slate-200 hover:bg-slate-50"
                    onClick={() => {
                      const container = document.getElementById('province-scroll-container');
                      if (container) {
                        container.scrollBy({ left: 200, behavior: 'smooth' });
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>


            </div>

            {/* Suggestion Banner */}
            <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span><strong>Gợi ý:</strong> Di chuột vào tiêu đề việc làm để xem thêm thông tin chi tiết</span>
              </div>
              <button className="text-blue-400 hover:text-blue-600">×</button>
            </div>

            {/* Job List */}
            {bestJobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="h-48 animate-pulse bg-slate-100 border-slate-200" />
                ))}
              </div>
            ) : bestJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                <p className="text-lg text-slate-600">Hiện chưa có việc làm phù hợp cho bạn</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {bestJobs.map((job) => (
                    <Card
                      key={job.jobId}
                      className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white cursor-pointer hover:border-emerald-200 relative overflow-hidden"
                      onClick={() => navigate(`/jobs/${job.jobId}`)}
                    >
                      <CardContent className="px-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            {/* Logo */}
                            <Avatar className="h-14 w-14 rounded-xl border border-slate-100 bg-white shadow-sm shrink-0">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.title}`} />
                              <AvatarFallback className="bg-emerald-50 text-emerald-600 font-bold text-lg rounded-xl">
                                {job.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Title & Company */}
                            <div>
                              <h3
                                className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1"
                                title={job.title}
                              >
                                {job.title}
                              </h3>
                              <p className="text-sm text-slate-500 font-medium line-clamp-1 uppercase tracking-wide">
                                CÔNG TY {job.companyId}
                              </p>
                            </div>
                          </div>

                          {/* Heart Icon */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 -mt-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add save logic here
                            }}
                          >
                            <Heart className="h-5 w-5" />
                          </Button>
                        </div>

                        {/* Job Info Tags */}
                        <div className="space-y-2.5">
                          {/* Salary */}
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400 font-medium">Mức lương</span>
                              <span className="text-sm font-bold text-emerald-700">
                                {job.salaryMin && job.salaryMax
                                  ? `${job.salaryMin / 1000000} - ${job.salaryMax / 1000000} triệu`
                                  : "Thoả thuận"}
                              </span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                              <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400 font-medium">Địa điểm</span>
                              <span className="text-sm text-slate-700 font-medium truncate max-w-[200px]">
                                {shortenAddress(job.location)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer/Time (Optional) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{job.jobType || "Toàn thời gian"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>3 ngày trước</span>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={bestJobsPagination.currentPage === 1}
                    onClick={() => handleBestJobsPageChange(bestJobsPagination.currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-slate-600 px-4">
                    <span className="text-emerald-600 font-bold">{bestJobsPagination.currentPage}</span> / {bestJobsPagination.totalPage} trang
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={bestJobsPagination.currentPage >= bestJobsPagination.totalPage}
                    onClick={() => handleBestJobsPageChange(bestJobsPagination.currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Khám Phá Theo Danh Mục
              </h2>
              <p className="text-lg text-slate-600">
                Tìm vị trí phù hợp dựa trên chuyên môn của bạn
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-200 hover:border-emerald-600">Xem Tất Cả</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {taxonomies.map((category, index) => {
              const Icon = getCategoryIcon(index);
              return (
                <Card
                  key={category.id}
                  className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200 cursor-pointer bg-slate-50/50 hover:bg-white"
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="mb-3 p-3 bg-white rounded-xl shadow-sm group-hover:bg-emerald-600 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors truncate w-full">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">100+ Việc Làm</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section (Old style, kept as is or can be removed if user wants replacement) */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Cơ Hội Việc Làm Mới Nhất
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Những công việc được chọn lọc dành riêng cho bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card
                key={job.jobId}
                className="group hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 border-slate-200 overflow-hidden bg-white relative h-full flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex gap-5 flex-1">
                    <div className="relative shrink-0">
                      <Avatar className="h-16 w-16 rounded-xl border-2 border-emerald-100 shadow-md group-hover:border-emerald-200 transition-colors">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.title}`} />
                        <AvatarFallback className="rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white font-bold text-xl">
                          {job.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{shortenAddress(job.location)}</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg">
                              <Briefcase className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{job.jobType}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                        <div className="text-sm font-semibold text-emerald-700">
                          {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : "Thỏa thuận"}
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 h-8 text-xs font-semibold"
                        >
                          Ứng Tuyển
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="px-8"
              onClick={() => navigate('/jobs')}
            >
              Xem Tất Cả Việc Làm
            </Button>
          </div>
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Các Công Ty Tuyển Dụng Hàng Đầu
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="group hover:-translate-y-2 transition-all duration-300 border-slate-200 overflow-hidden bg-white hover:shadow-lg"
              >
                <div className="h-20 bg-linear-to-br from-emerald-50 to-teal-50" />
                <CardContent className="p-4 pt-0 flex flex-col items-center text-center -mt-10">
                  <Avatar className="h-20 w-20 rounded-xl border-4 border-white shadow-sm mb-3 bg-white">
                    <AvatarImage src={company.logo} alt={company.name} className="object-contain p-2" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-bold rounded-xl">
                      {company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-emerald-900 mb-1 group-hover:text-emerald-600 transition-colors truncate w-full">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[150px]">{shortenAddress(company.address) || 'Trụ Sở Chính'}</span>
                  </div>

                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg h-9 text-sm">
                    Xem Hồ Sơ
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
