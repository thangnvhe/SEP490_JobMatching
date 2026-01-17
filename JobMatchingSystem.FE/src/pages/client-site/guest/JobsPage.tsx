import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, MapPin } from "lucide-react";

// Components
import JobSearchFilter from "@/components/ui/jobs/JobSearchFilter";
import JobList from "./JobList";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";
// Services & Types
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { PageInfo, PaginationParamsInput } from "@/models/base";
// Icons
import { Job } from "@/models/job";
import { Company } from "@/models/company";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Province, ProvincesService } from "@/services/provinces.service";
import { useNavigate, useSearchParams } from "react-router";
import { SaveJobServices } from "@/services/save-job.service";
import { Position } from "@/models/position";
import { PositionService } from "@/services/position.service";
import { Taxonomy } from "@/models/taxonomy";
import { TaxonomyService } from "@/services/taxonomy.service";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";


export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.authState);

  const initialSearch = searchParams.get("search") || "";
  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Record<number, Company>>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  // local state 
  const [loading, setLoading] = useState(true);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
 
  const [keyword, setKeyword] = useState(initialSearch);
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 10,
    totalItem: 0,
    totalPage: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    sortBy: '',
    isDecending: false,
  });
  const [paginationInput, setPaginationInput] = useState<PaginationParamsInput>({
    page: 1,
    size: 10,
    search: initialSearch,
    sortBy: '',
    isDecending: false,
    title: null,
    description: null,
    requirements: null,
    benefits: null,
    location: null,
    salaryMin: null,
    salaryMax: null,
    experienceYearMin: null,
    experienceYearMax: null,
    jobType: null,
    status: "Opened",
    companyId: null,
    recruiterId: null,
    isDeleted: false,
    positionId: null,
    taxonomyIds: null,
  });

  const debouncedKeyword = useDebounce(keyword, 700);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== keyword) {
      setKeyword(searchParam || "");
      setPaginationInput((prev) => ({
        ...prev,
        page: 1,
        search: searchParam || "",
      }));
    }
  }, [searchParams, keyword]);

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      const response = await JobServices.getAllWithPagination(params);
      setJobs(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      toast.error(err.response.data.errorMessages[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProvinces = useCallback(async () => {
    try {
      const response = await ProvincesService.getAllProvinces();
      setProvinces(response);
    } catch (err: any) {
      toast.error(err.response.data.errorMessages[0]);
    }
  }, []);

  useEffect(() => {
    getProvinces();
  }, [getProvinces]);

  const getPositions = useCallback(async () => {
    try {
      const response = await PositionService.getAll();
      if (response.isSuccess && response.result) {
        setPositions(response.result);
      } else {
        setPositions([]);
      }
    } catch (err: any) {
      toast.error(err.response.data.errorMessages[0]);
      setPositions([]);
    }
  }, []);

  const getTaxonomies = useCallback(async () => {
    try {
      const response = await TaxonomyService.getAllTaxonomies();
      if (response.isSuccess && response.result) {
        setTaxonomies(response.result);
      } else {
        setTaxonomies([]);
      }
    } catch (err: any) {
      toast.error(err.response.data.errorMessages[0]);
      setTaxonomies([]);
    }
  }, []);

  useEffect(() => {
    getPositions();
    getTaxonomies();
  }, [getPositions, getTaxonomies]);

  const getAllCompanies = useCallback(async () => {
    try {
      const response = await CompanyServices.getAll();
      // Chuyển đổi array companies thành Record<number, Company> để mapping với companyId
      const companiesMap: Record<number, Company> = {};
      if (response.result && Array.isArray(response.result)) {
        response.result.forEach((company) => {
          companiesMap[company.id] = company;
        });
      }
      setCompanies(companiesMap);
    } catch (err: any) {
      toast.error(err.response.data.errorMessages[0]);
    }
  }, []);

  useEffect(() => {
    getAllCompanies();
  }, [getAllCompanies]);

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
      status: "Opened", // Đảm bảo chỉ lấy jobs có status = "Opened"
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput]);


  const handleSaveJob = async (jobId: number) => {
    // Kiểm tra đăng nhập trước khi lưu công việc
    if (!isAuthenticated) {
      toast.warning("Bạn phải đăng nhập trước khi sử dụng tính năng này");
      setLoginDialogOpen(true);
      return;
    }

    try {
      const job = jobs.find(j => j.jobId === jobId);
      
      // Nếu đã lưu rồi thì bỏ lưu
      if (job?.isSave) {
        // Tìm savedJobId từ danh sách saved jobs
        const savedJobsResponse = await SaveJobServices.getMySavedJobs();
        if (savedJobsResponse.isSuccess && savedJobsResponse.result) {
          const savedJob = savedJobsResponse.result.find(sj => sj.jobId === jobId);
          if (savedJob) {
            await SaveJobServices.deleteSavedJob(savedJob.id);
            toast.success("Đã bỏ lưu công việc");
            // Cập nhật trạng thái isSave trong danh sách jobs
            setJobs(prevJobs => 
              prevJobs.map(j => j.jobId === jobId ? { ...j, isSave: false } : j)
            );
            return;
          }
        }
      } else {
        // Lưu công việc
        const response = await SaveJobServices.saveJob(jobId);
        if (response.isSuccess) {
          toast.success(`Đã lưu công việc bạn quan tâm`);
          // Cập nhật trạng thái isSave trong danh sách jobs
          setJobs(prevJobs => 
            prevJobs.map(j => j.jobId === jobId ? { ...j, isSave: true } : j)
          );
        } else {
          toast.error(response.errorMessages[0]);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("Công việc này đã được lưu");
      } else {
        toast.error("Có lỗi xảy ra khi thực hiện thao tác");
      }
    }
  };

  const handleSortChange = (sortBy: string) => {
    setPaginationInput({
      ...paginationInput,
      sortBy: sortBy === 'createdAt' ? '' : (sortBy),
      isDecending: sortBy === 'salaryMin' ? true : false,
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationInput({
      ...paginationInput,
      page: page,
    });
  };

  const handleJobDetails = (jobId: number) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-950 pt-20 pb-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px] opacity-10"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Tìm kiếm <span className="text-emerald-400">công việc</span> mơ ước
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl font-light">
              Kết nối với hàng ngàn nhà tuyển dụng hàng đầu và cơ hội phát triển sự nghiệp.
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
                    placeholder="Vị trí tuyển dụng, tên công ty..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent placeholder:text-gray-400 flex-1"
                  />
                </div>

                {/* Location Search */}
                <div className="flex-1 relative w-full md:w-auto flex items-center px-2">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 ml-2" />
                  <Select
                    value={paginationInput.location || ''}
                    onValueChange={(value) => setPaginationInput({ ...paginationInput, location: value })}
                  >
                    <SelectTrigger className="border-0 shadow-none focus:ring-0 text-base h-12 bg-transparent w-full pl-2 focus:ring-offset-0">
                      <SelectValue placeholder="Tất cả địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_locations">Tất cả địa điểm</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button
                  onClick={() => getAllWithPagination(paginationInput)}
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
      <div className="container mx-auto px-4 mt-8 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filter - Sticky */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">

              <JobSearchFilter
                filters={{
                  jobType: paginationInput.jobType,
                  experienceYearMin: paginationInput.experienceYearMin,
                  experienceYearMax: paginationInput.experienceYearMax,
                  salaryMin: paginationInput.salaryMin,
                  salaryMax: paginationInput.salaryMax,
                  positionId: paginationInput.positionId,
                  taxonomyIds: paginationInput.taxonomyIds,
                }}
                onFiltersChange={(newFilters) => {
                  setPaginationInput({
                    ...paginationInput,
                    jobType: newFilters.jobType || '',
                    experienceYearMin: newFilters.experienceYearMin ?? null,
                    experienceYearMax: newFilters.experienceYearMax ?? null,
                    salaryMin: newFilters.salaryMin ?? null,
                    salaryMax: newFilters.salaryMax ?? null,
                    positionId: newFilters.positionId ?? null,
                    taxonomyIds: newFilters.taxonomyIds ?? null,
                  });
                }}
                positions={positions}
                taxonomies={taxonomies}
              />
            </div>
          </aside>

          {/* Job Results */}
          <main className="flex-1 min-w-0">
            <JobList
              jobs={jobs}
              companies={companies}
              total={paginationInfo.totalItem}
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPage}
              pageSize={paginationInfo.pageSize}
              sortBy={paginationInput.sortBy || ''}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onJobDetails={handleJobDetails}
              onSaveJob={handleSaveJob}
              loading={loading}
            />
          </main>
        </div>
      </div>
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
}
