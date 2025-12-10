import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
import { SaveJobServices } from "@/services/save-job.service";
import { Position } from "@/models/position";
import { PositionService } from "@/services/position.service";
import { Taxonomy } from "@/models/taxonomy";
import { TaxonomyService } from "@/services/taxonomy.service";


export default function JobsPage() {
  const navigate = useNavigate();
  // Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Record<number, Company>>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
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
    status: "Opened",
    companyId: null,
    recruiterId: null,
    isDeleted: null,
    positionId: null,
    taxonomyIds: null,
  });

  const debouncedKeyword = useDebounce(keyword, 700);

  // Chuẩn hóa params trước khi gọi API (tránh axios encode array thành taxonomyIds[])
  const buildRequestParams = useCallback(
    (params: PaginationParamsInput) => {
      const { taxonomyIds, ...rest } = params;
      return {
        ...rest,
        taxonomyIds:
          taxonomyIds && Array.isArray(taxonomyIds) && taxonomyIds.length > 0
            ? taxonomyIds.join(",")
            : null,
      };
    },
    []
  );

  const getAllWithPagination = useCallback(async (params: PaginationParamsInput) => {
    try {
      setLoading(true);
      const requestParams = buildRequestParams(params);
      const response = await JobServices.getAllWithPagination(requestParams);
      setJobs(response.result.items);
      setPaginationInfo(response.result.pageInfo);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu việc làm");
    } finally {
      setLoading(false);
    }
  }, [buildRequestParams]);

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

  const getPositions = useCallback(async () => {
    try {
      const response = await PositionService.getAll();
      if (response.isSuccess && response.result) {
        setPositions(response.result);
      } else {
        setPositions([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu vị trí");
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
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu kỹ năng");
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
      toast.error(err.response?.data?.message || "Lỗi khi tải dữ liệu công ty");
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
    try {
      const response = await SaveJobServices.saveJob(jobId);
      if (response.isSuccess) {
        toast.success(`Đã lưu công việc bạn quan tâm`);
      } else {
        toast.error(response.errorMessages[0]);
      }
    } catch (error) {
      toast.error("Công việc này đẫ được lưu");
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
    </div>
  );
}
