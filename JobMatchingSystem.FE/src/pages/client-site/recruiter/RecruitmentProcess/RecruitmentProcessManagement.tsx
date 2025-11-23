import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import type { RootState } from '@/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Eye,
  FileText,
  RefreshCcw,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { JobServices } from '@/services/job.service';
import { UserServices } from '@/services/user.service';
import type { User } from '@/models/user';
import type { JobDetailResponse } from '@/models/job';

interface CandidateJobResponse {
  candidateJobId: number;
  jobId: number;
  cvId: number;
  status: number;
  appliedAt: string;
  updatedAt: string;
}

interface CVResponse {
  id: number;
  userId: number;
  name: string;
  isPrimary: boolean;
  fileName: string;
  fileUrl: string;
  user: null;
  savedCVs: [];
  candidateJobs: [];
}

interface CandidateData {
  candidateJobId: number;
  cvId: number;
  cvName: string;
  fileName: string;
  fileUrl: string;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: number;
  appliedAt: string;
}

const RecruitmentProcessManagement: React.FC = () => {
  // Redux state
  const authState = useSelector((state: RootState) => state.authState);
  const currentUserId = authState.nameid;
  
  // URL search params
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get('jobId');

  // State management
  const [jobs, setJobs] = useState<JobDetailResponse[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobIdFromUrl || '');
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [jobStages, setJobStages] = useState<any[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'stages'>('candidates');
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCV, setSelectedCV] = useState<CandidateData | null>(null);
  const [isViewCVDialogOpen, setIsViewCVDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Fetch jobs for the dropdown
  const fetchJobs = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setJobsLoading(true);
      setError(null);
      
      const params = {
        Page: 1,
        Size: 100, // Get all jobs for dropdown
        RecuiterId: parseInt(currentUserId),
        Status: 3, // Only get opened jobs (status = 3)
        sortBy: 'openedAt',
        isDescending: true // Sort by most recent opened jobs
      };
      
      const response = await JobServices.getJobsWithPagination(params);
      
      if (response.isSuccess && response.result) {
        if (response.result.items && Array.isArray(response.result.items)) {
          setJobs(response.result.items as JobDetailResponse[]);
        } else if (Array.isArray(response.result)) {
          setJobs(response.result as JobDetailResponse[]);
        } else {
          // If it's a single result, check if it has items property
          if (response.result && response.result.items) {
            setJobs(response.result.items as JobDetailResponse[]);
          } else {
            setJobs([]);
          }
        }
      } else {
        setError("Không thể tải danh sách tin tuyển dụng");
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Lỗi khi tải danh sách tin tuyển dụng");
    } finally {
      setJobsLoading(false);
    }
  }, [currentUserId]);

  // Fetch job stages for recruitment process
  const fetchJobStages = useCallback(async (jobId: string) => {
    if (!jobId) return;
    
    try {
      setStagesLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://localhost:7044/api/JobStage/job/${jobId}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setJobStages([]);
          return;
        }
        throw new Error('Failed to fetch job stages');
      }
      
      const data = await response.json();
      
      if (data.isSuccess && data.result) {
        const stages = Array.isArray(data.result) ? data.result : [data.result];
        setJobStages(stages);
        
        // Auto-select first stage
        if (stages.length > 0) {
          setSelectedStageId(stages[0].jobStageId.toString());
        }
      } else {
        setJobStages([]);
      }
    } catch (err: any) {
      console.error("Error fetching job stages:", err);
      setError(err.message || "Lỗi khi tải danh sách vòng tuyển dụng");
      setJobStages([]);
    } finally {
      setStagesLoading(false);
    }
  }, []);

  // Fetch candidate applications for selected job
  // Fetch candidate applications for selected job (and optionally stage)
  const fetchCandidateJobs = useCallback(async (jobId: string, stageId?: string) => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let url = `https://localhost:7044/api/CandidateJob/job/${jobId}?page=${currentPage}&size=${pageSize}&isDescending=false`;
      if (stageId && activeTab === 'stages') {
        url += `&stageId=${stageId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          setCandidates([]);
          setTotalItems(0);
          return;
        }
        throw new Error('Failed to fetch candidate jobs');
      }
      
      const data = await response.json();
      
      if (data.isSuccess && data.result) {
        const candidateJobs: CandidateJobResponse[] = data.result.items || data.result;
        
        // Fetch additional data for each candidate
        const candidatePromises = candidateJobs.map(async (candidateJob) => {
          try {
            // Fetch CV data
            const cvResponse = await fetch(`https://localhost:7044/api/CV/${candidateJob.cvId}`);
            const cvData = await cvResponse.json();
            
            if (!cvData.isSuccess) {
              console.warn(`Failed to fetch CV ${candidateJob.cvId}`);
              return null;
            }
            
            const cv: CVResponse = cvData.result;
            
            // Fetch User data
            const userResponse = await UserServices.getById(cv.userId.toString());
            
            if (!userResponse.isSuccess) {
              console.warn(`Failed to fetch User ${cv.userId}`);
              return null;
            }
            
            const user = userResponse.result as User;
            
            return {
              candidateJobId: candidateJob.candidateJobId,
              cvId: candidateJob.cvId,
              cvName: cv.name,
              fileName: cv.fileName,
              fileUrl: cv.fileUrl,
              userId: cv.userId,
              fullName: user.fullName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              status: candidateJob.status,
              appliedAt: candidateJob.appliedAt,
            };
          } catch (error) {
            console.error(`Error fetching data for candidate job ${candidateJob.candidateJobId}:`, error);
            return null;
          }
        });
        
        const candidateData = await Promise.all(candidatePromises);
        const validCandidates = candidateData.filter(Boolean) as CandidateData[];
        
        setCandidates(validCandidates);
        
        if (data.result.pageInfo) {
          setTotalItems(data.result.pageInfo.totalItem);
        } else {
          setTotalItems(candidateJobs.length);
        }
      } else {
        setCandidates([]);
        setTotalItems(0);
      }
    } catch (err: any) {
      console.error("Error fetching candidate jobs:", err);
      setError(err.message || "Lỗi khi tải danh sách ứng viên");
      setCandidates([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeTab]);

  // Load jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto-select job from URL parameter when jobs are loaded
  useEffect(() => {
    if (jobIdFromUrl && jobs.length > 0) {
      const jobExists = jobs.find(job => job.jobId.toString() === jobIdFromUrl);
      if (jobExists) {
        setSelectedJobId(jobIdFromUrl);
      }
    }
  }, [jobIdFromUrl, jobs]);

  // Load candidates when job is selected
  useEffect(() => {
    if (selectedJobId) {
      if (activeTab === 'candidates') {
        fetchCandidateJobs(selectedJobId);
      } else if (activeTab === 'stages') {
        fetchJobStages(selectedJobId);
      }
    }
  }, [selectedJobId, activeTab, fetchCandidateJobs, fetchJobStages]);

  // Load candidates when stage is selected
  useEffect(() => {
    if (selectedJobId && selectedStageId && activeTab === 'stages') {
      fetchCandidateJobs(selectedJobId, selectedStageId);
    }
  }, [selectedStageId, selectedJobId, activeTab, fetchCandidateJobs]);

  // Handler functions
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentPage(1); // Reset pagination
    setSelectedStageId(''); // Reset stage selection
    setActiveTab('candidates'); // Reset to candidates tab
  };

  const handleTabChange = (tab: 'candidates' | 'stages') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination
    if (tab === 'stages' && selectedJobId) {
      fetchJobStages(selectedJobId);
    }
  };

  const handleStageChange = (stageId: string) => {
    setSelectedStageId(stageId);
    setCurrentPage(1); // Reset pagination
  };

  const handleViewCV = (candidate: CandidateData) => {
    setSelectedCV(candidate);
    setIsViewCVDialogOpen(true);
  };

  const handleDownloadCV = (candidate: CandidateData) => {
    const link = document.createElement('a');
    link.href = `https://localhost:7044${candidate.fileUrl}`;
    link.download = candidate.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải CV thành công');
  };

  const handleRefresh = () => {
    if (selectedJobId) {
      if (activeTab === 'candidates') {
        fetchCandidateJobs(selectedJobId);
      } else if (activeTab === 'stages') {
        fetchJobStages(selectedJobId);
        if (selectedStageId) {
          fetchCandidateJobs(selectedJobId, selectedStageId);
        }
      }
    }
    fetchJobs();
  };

  // Status helpers
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Chưa xem';
      case 1:
        return 'Đã xem';
      case 2:
        return 'Phù hợp';
      case 3:
        return 'Không phù hợp';
      case 4:
        return 'Đã tuyển';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 1:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 2:
        return 'bg-green-100 text-green-800 border border-green-200';
      case 3:
        return 'bg-red-100 text-red-800 border border-red-200';
      case 4:
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Pagination calculations
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + candidates.length, totalItems);
  const safePage = Math.min(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  // Columns definition
  const columns = useMemo<ColumnDef<CandidateData>[]>(() => [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => {
        const index = row.index;
        return (currentPage - 1) * pageSize + index + 1;
      },
      enableSorting: false,
    },
    {
      id: "fullName",
      accessorKey: "fullName",
      header: "Họ và tên",
      enableSorting: true,
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{candidate.fullName}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{email}</span>
          </div>
        );
      },
    },
    {
      id: "phoneNumber",
      accessorKey: "phoneNumber",
      header: "Số điện thoại",
      enableSorting: false,
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phoneNumber") as string;
        return phoneNumber ? (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{phoneNumber}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Chưa cập nhật</span>
        );
      },
    },
    {
      id: "cvName",
      accessorKey: "cvName",
      header: "CV",
      enableSorting: false,
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{candidate.cvName}</span>
          </div>
        );
      },
    },
    {
      id: "appliedAt",
      accessorKey: "appliedAt",
      header: "Ngày ứng tuyển",
      enableSorting: true,
      cell: ({ row }) => {
        const date = row.getValue("appliedAt") as string;
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{new Date(date).toLocaleDateString('vi-VN')}</span>
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Trạng thái",
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleViewCV(candidate)}
              variant="outline"
              size="sm"
              title="Xem CV"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleDownloadCV(candidate)}
              variant="outline"
              size="sm"
              title="Tải xuống CV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [currentPage, pageSize]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý quy trình tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các ứng viên đã ứng tuyển vào tin tuyển dụng
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading || jobsLoading}
          title="Làm mới dữ liệu"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${(loading || jobsLoading) ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Chọn tin tuyển dụng</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedJobId} onValueChange={handleJobChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn tin tuyển dụng để xem danh sách ứng viên" />
              </SelectTrigger>
              <SelectContent>
                {jobsLoading ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : jobs.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Không có tin tuyển dụng nào
                  </SelectItem>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.jobId} value={job.jobId.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{job.title}</span>
                        <Badge variant="outline" className="ml-2">
                          {job.location}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Candidates and Recruitment Process */}
      {selectedJobId && (
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'candidates' | 'stages')}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="candidates">Danh sách ứng viên</TabsTrigger>
              <TabsTrigger value="stages">Quy trình tuyển dụng</TabsTrigger>
            </TabsList>
            
            {/* Stage selector for recruitment process */}
            {activeTab === 'stages' && jobStages.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Vòng tuyển dụng:</span>
                <Select value={selectedStageId} onValueChange={handleStageChange}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Chọn vòng tuyển dụng" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobStages.map((stage) => (
                      <SelectItem key={stage.jobStageId} value={stage.jobStageId.toString()}>
                        {stage.stageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Danh sách ứng viên</span>
                  </div>
                  {totalItems > 0 && (
                    <Badge variant="outline">
                      {totalItems} ứng viên
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Đang tải danh sách ứng viên...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <p className="text-sm text-red-500">{error}</p>
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                      Thử lại
                    </Button>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Chưa có ứng viên nào ứng tuyển vào tin này</p>
                  </div>
                ) : (
                  <>
                    <DataTable
                      columns={columns}
                      data={candidates}
                      loading={loading}
                      sorting={sorting}
                      onSortingChange={setSorting}
                    />
                    
                    {/* Pagination */}
                    {totalItems > pageSize && (
                      <div className="flex items-center justify-between mt-4 gap-6">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị {startIndex + 1} - {endIndex} của {totalItems} kết quả
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Số dòng mỗi trang:</p>
                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 20, 50].map(size => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              disabled={safePage === 1}
                              title="Trang đầu"
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(safePage - 1)}
                              disabled={safePage === 1}
                              title="Trang trước"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1 px-2">
                              <span className="text-sm">Trang</span>
                              <span className="text-sm font-semibold">{safePage}</span>
                              <span className="text-sm">của</span>
                              <span className="text-sm font-semibold">{totalPages}</span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(safePage + 1)}
                              disabled={safePage === totalPages}
                              title="Trang sau"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              disabled={safePage === totalPages}
                              title="Trang cuối"
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment Stages Tab */}
          <TabsContent value="stages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Ứng viên theo vòng tuyển dụng</span>
                  </div>
                  {totalItems > 0 && selectedStageId && (
                    <Badge variant="outline">
                      {totalItems} ứng viên
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Đang tải vòng tuyển dụng...</p>
                    </div>
                  </div>
                ) : jobStages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <p className="text-sm text-gray-500">Không có vòng tuyển dụng nào cho tin này</p>
                  </div>
                ) : !selectedStageId ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <p className="text-sm text-gray-500">Vui lòng chọn vòng tuyển dụng để xem danh sách ứng viên</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Đang tải danh sách ứng viên...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <p className="text-sm text-red-500">{error}</p>
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                      Thử lại
                    </Button>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Chưa có ứng viên nào ở vòng tuyển dụng này</p>
                  </div>
                ) : (
                  <>
                    <DataTable
                      columns={columns}
                      data={candidates}
                      loading={loading}
                      sorting={sorting}
                      onSortingChange={setSorting}
                    />
                    
                    {/* Pagination */}
                    {totalItems > pageSize && (
                      <div className="flex items-center justify-between mt-4 gap-6">
                        <div className="text-sm text-muted-foreground">
                          Hiển thị {startIndex + 1} - {endIndex} của {totalItems} kết quả
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Số dòng mỗi trang:</p>
                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 20, 50].map(size => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              disabled={safePage === 1}
                              title="Trang đầu"
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(safePage - 1)}
                              disabled={safePage === 1}
                              title="Trang trước"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1 px-2">
                              <span className="text-sm">Trang</span>
                              <span className="text-sm font-semibold">{safePage}</span>
                              <span className="text-sm">của</span>
                              <span className="text-sm font-semibold">{totalPages}</span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(safePage + 1)}
                              disabled={safePage === totalPages}
                              title="Trang sau"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              disabled={safePage === totalPages}
                              title="Trang cuối"
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* CV Viewer Dialog */}
      <Dialog open={isViewCVDialogOpen} onOpenChange={setIsViewCVDialogOpen}>
        <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Xem CV - {selectedCV?.fullName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCV && (
              <>
                {/* Candidate Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Họ tên:</span>
                      <span className="text-sm">{selectedCV.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{selectedCV.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Điện thoại:</span>
                      <span className="text-sm">{selectedCV.phoneNumber || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">CV:</span>
                      <span className="text-sm">{selectedCV.cvName}</span>
                    </div>
                  </div>
                </div>

                {/* CV Preview */}
                <div className="border rounded-lg">
                  <iframe
                    src={`https://localhost:7044${selectedCV.fileUrl}`}
                    className="w-full h-96 rounded-lg"
                    title={`CV - ${selectedCV.fullName}`}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => handleDownloadCV(selectedCV)}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                  <Button onClick={() => setIsViewCVDialogOpen(false)}>
                    Đóng
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitmentProcessManagement;