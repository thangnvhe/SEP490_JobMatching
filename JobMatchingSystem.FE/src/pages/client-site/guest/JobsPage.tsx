import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Search, MapPin } from "lucide-react";

// Components
import JobSearchFilter from "@/components/ui/jobs/JobSearchFilter";
import JobList from "./JobList";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useNavigate } from "react-router";


export default function JobsPage() {
  const authState = useSelector((state: RootState) => state.authState);
  const navigate = useNavigate();
  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Record<number, Company>>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  // local state 
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
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
    search: '',
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
    status: null,
    companyId: null,
    recruiterId: null,
    isDeleted: null,
  });

  const debouncedKeyword = useDebounce(keyword, 700);

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      const response = await JobServices.getAllWithPagination(params);
      setJobs(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu việc làm");
    } finally {
      setLoading(false);
    }
  }, []);

  const getProvinces = useCallback(async () => {
    try {
      const response = await ProvincesService.getAllProvinces();
      setProvinces(response);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu tỉnh thành");
    }
  }, []);

  useEffect(() => {
    getProvinces();
  }, [getProvinces]);

  // Fetch companies for displayed jobs
  useEffect(() => {
    const fetchCompanies = async () => {
      if (jobs.length === 0) return;

      // Filter unique company IDs that are not yet in the state
      const uniqueCompanyIds = [...new Set(jobs.map(job => job.companyId))];
      const idsToFetch = uniqueCompanyIds.filter(id => !companies[id]);

      if (idsToFetch.length === 0) return;

      try {
        // Fetch all missing companies in parallel
        const responses = await Promise.all(
          idsToFetch.map(id => CompanyServices.getCompanyById(id.toString()).catch(() => null))
        );

        setCompanies(prev => {
          const newCompanies = { ...prev };
          responses.forEach((res) => {
            if (res && res.result) {
              newCompanies[res.result.id] = res.result;
            }
          });
          return newCompanies;
        });
      } catch (error) {
        console.error("Error fetching companies info", error);
      }
    };

    fetchCompanies();
  }, [jobs]);

  useEffect(() => {
    const params = {
      ...paginationInput,
      search: debouncedKeyword,
    };
    getAllWithPagination(params);
  }, [getAllWithPagination, debouncedKeyword, paginationInput]);


  const handleSaveJob = async (jobId: number) => {
    try {
      if (authState.role?.toLowerCase() !== 'candidate') {
        toast.error('Chỉ ứng viên mới có thể lưu việc làm');
        return;
      }
      // TODO: Implement actual save job API call here
      toast.success(`Đã lưu công việc ${jobId}`);
    } catch (error) {
      toast.error("Có lỗi khi lưu công việc");
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
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 pt-20 pb-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>

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
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2 items-center">
                {/* Keyword Search */}
                <div className="flex-[2] relative w-full md:w-auto flex items-center border-b md:border-b-0 md:border-r border-gray-100 px-2">
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
                }}
                onFiltersChange={(newFilters) => {
                  setPaginationInput({
                    ...paginationInput,
                    jobType: newFilters.jobType || '',
                    experienceYearMin: newFilters.experienceYearMin ?? null,
                    experienceYearMax: newFilters.experienceYearMax ?? null,
                    salaryMin: newFilters.salaryMin ?? null,
                    salaryMax: newFilters.salaryMax ?? null,
                  });
                }}
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
    </div>
  );
}
