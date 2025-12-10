import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MapPinIcon, BriefcaseIcon, GraduationCapIcon, FileTextIcon, ExternalLinkIcon, BookmarkIcon, MailIcon } from 'lucide-react';
import { CandidateMatchingService } from '@/services/candidate-matching.service';
import { CandidateMatchingResult, CandidateSearchFilters } from '@/models/candidate-matching';
import { TaxonomyService } from '@/services/taxonomy.service';
import { Taxonomy } from '@/models/taxonomy';
import { JobServices } from '@/services/job.service';
import { Job } from '@/models/job';
import { SavedCVService } from '@/services/saved-cv.service';
import { SavedCV } from '@/models/saved-cv';
import { InvitationService } from '@/services/invitation.service';
import { toast } from 'sonner';

export default function CVSearchPage() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<CandidateMatchingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [savedCVIds, setSavedCVIds] = useState<Set<number>>(new Set());
  const [savingCVIds, setSavingCVIds] = useState<Set<number>>(new Set());
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [invitingCandidateIds, setInvitingCandidateIds] = useState<Set<string>>(new Set());
  
  // Filter states
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    jobId: searchParams.get('jobId') || '',
    page: 1,
    size: 10,
    minExperience: undefined,
    maxExperience: undefined,
    requiredSkills: [],
    educationLevelId: undefined
  });

  const loadTaxonomies = useCallback(async () => {
    try {
      const response = await TaxonomyService.getAllTaxonomies();
      if (response.isSuccess && response.result) {
        setTaxonomies(response.result);
      }
    } catch (error) {
      console.error('Error loading taxonomies:', error);
    }
  }, []);

  const loadRecruiterJobs = useCallback(async () => {
    try {
      const response = await JobServices.getAllMyJobsPagination({ page: 1, size: 100 });
      if (response.isSuccess && response.result && response.result.items) {
        setJobs(response.result.items);
        
        // Nếu có jobId từ URL, tìm và set job đã chọn
        const jobIdFromUrl = searchParams.get('jobId');
        if (jobIdFromUrl) {
          const foundJob = response.result.items.find(job => job.jobId.toString() === jobIdFromUrl);
          if (foundJob) {
            setSelectedJob(foundJob);
          }
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Không thể tải danh sách công việc');
    }
  }, [searchParams]);

  const loadSavedCVs = useCallback(async () => {
    try {
      const response = await SavedCVService.getAllSavedCVs();
      if (response.isSuccess && response.result) {
        setSavedCVs(response.result);
        // Tạo Set các CV IDs đã lưu
        const cvIds = new Set(response.result.map(savedCV => savedCV.cvId));
        setSavedCVIds(cvIds);
      }
    } catch (error) {
      console.error('Error loading saved CVs:', error);
    }
  }, []);

  const searchCandidates = useCallback(async () => {
    if (!filters.jobId) {
      toast.error('Vui lòng chọn công việc để tìm kiếm ứng viên');
      return;
    }

    setLoading(true);
    try {
      const response = await CandidateMatchingService.getCandidatesForJob({
        ...filters,
        requiredSkills: selectedSkills
      });
      
      if (response.isSuccess && response.result) {
        setCandidates(response.result.items || []);
        setTotalPages(response.result.totalPages || 0);
        setTotalCount(response.result.totalCount || 0);
        if ((response.result.items || []).length === 0) {
          toast.info('Không tìm thấy ứng viên phù hợp với công việc này');
        }
      } else {
        setCandidates([]);
        setTotalPages(0);
        setTotalCount(0);
        toast.error('Có lỗi xảy ra khi tìm kiếm ứng viên');
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
      setCandidates([]); // Đảm bảo candidates luôn là array
      toast.error('Có lỗi xảy ra khi tìm kiếm ứng viên');
    } finally {
      setLoading(false);
    }
  }, [filters, selectedSkills]);

  useEffect(() => {
    loadTaxonomies();
    loadRecruiterJobs();
    loadSavedCVs();
  }, [loadTaxonomies, loadRecruiterJobs, loadSavedCVs]);

  useEffect(() => {
    if (filters.jobId) {
      searchCandidates();
    }
  }, [filters.jobId, searchCandidates]); // Chạy lại khi jobId thay đổi

  const handleFilterChange = (key: keyof CandidateSearchFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      return newSkills;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const handleSaveCV = async (cvId: number) => {
    setSavingCVIds(prev => new Set(prev).add(cvId));
    try {
      await SavedCVService.saveCV(cvId);
      setSavedCVIds(prev => new Set(prev).add(cvId));
      // Reload saved CVs to get the updated list
      loadSavedCVs();
      toast.success('Đã lưu CV thành công');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Có lỗi xảy ra khi lưu CV');
    } finally {
      setSavingCVIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handleUnsaveCV = async (cvId: number) => {
    setSavingCVIds(prev => new Set(prev).add(cvId));
    try {
      // Tìm savedCV để lấy ID để xóa
      const savedCV = savedCVs.find(cv => cv.cvId === cvId);
      if (!savedCV) {
        toast.error('Không tìm thấy CV đã lưu');
        return;
      }
      
      await SavedCVService.deleteSavedCV(savedCV.id);
      setSavedCVIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
      setSavedCVs(prev => prev.filter(cv => cv.cvId !== cvId));
      toast.success('Đã bỏ lưu CV');
    } catch (error) {
      console.error('Error unsaving CV:', error);
      toast.error('Có lỗi xảy ra khi bỏ lưu CV');
    } finally {
      setSavingCVIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(cvId);
        return newSet;
      });
    }
  };

  const handleInviteCandidate = async (candidate: CandidateMatchingResult) => {
    if (!selectedJob) {
      toast.error('Không xác định được công việc để mời ứng tuyển');
      return;
    }

    setInvitingCandidateIds(prev => new Set(prev).add(candidate.candidateId));
    try {
      await InvitationService.inviteCandidateForJob({
        candidateEmail: candidate.email,
        jobId: selectedJob.jobId,
        message: `Chúng tôi muốn mời bạn ứng tuyển vào vị trí ${selectedJob.title} tại công ty chúng tôi.`
      });
      toast.success(`Đã gửi email mời ứng tuyển đến ${candidate.candidateName}`);
    } catch (error) {
      console.error('Error inviting candidate:', error);
      toast.error('Có lỗi xảy ra khi gửi email mời ứng tuyển');
    } finally {
      setInvitingCandidateIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidate.candidateId);
        return newSet;
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 px-4 lg:px-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm CV ứng viên</h1>
          <p className="text-muted-foreground">
            Tìm kiếm và đánh giá ứng viên phù hợp cho vị trí tuyển dụng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel - Left Side */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Bộ lọc tìm kiếm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job Selection */}
              <div className="space-y-2">
                <Label htmlFor="jobId">Công việc</Label>
                {searchParams.get('jobId') && selectedJob ? (
                  // Hiển thị thông tin job đã chọn
                  <div className="p-3 border rounded-md bg-blue-50 border-blue-200">
                    <span className="font-medium text-blue-900">{selectedJob.title}</span>
                  </div>
                ) : (
                  // Hiển thị dropdown chọn job
                  <Select value={filters.jobId} onValueChange={(value) => handleFilterChange('jobId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn công việc để tìm ứng viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map(job => (
                        <SelectItem key={job.jobId} value={job.jobId.toString()}>
                          <span className="font-medium">{job.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Experience Range */}
              <div className="space-y-2">
                <Label>Số năm kinh nghiệm</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Tối thiểu"
                    value={filters.minExperience || ''}
                    onChange={(e) => handleFilterChange('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Tối đa"
                    value={filters.maxExperience || ''}
                    onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Education Level */}
              <div className="space-y-2">
                <Label>Trình độ học vấn</Label>
                <Select value={filters.educationLevelId?.toString() || 'all'} onValueChange={(value) => handleFilterChange('educationLevelId', value === 'all' ? undefined : parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="1">Cao đẳng</SelectItem>
                    <SelectItem value="2">Đại học</SelectItem>
                    <SelectItem value="3">Thạc sĩ</SelectItem>
                    <SelectItem value="4">Tiến sĩ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Kỹ năng yêu cầu</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {taxonomies.map(taxonomy => (
                    <div key={taxonomy.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`skill-${taxonomy.id}`}
                        checked={selectedSkills.includes(taxonomy.id)}
                        onChange={() => handleSkillToggle(taxonomy.id)}
                        className="rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`skill-${taxonomy.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {taxonomy.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <Button onClick={searchCandidates} className="w-full" disabled={loading}>
                {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
              </Button>
            </CardContent>
          </Card>

          {/* Candidates List - Right Side */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <div className="text-center py-8">
                <p>Đang tìm kiếm ứng viên...</p>
              </div>
            )}

            {!loading && (!Array.isArray(candidates) || candidates.length === 0) && !filters.jobId && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Vui lòng chọn công việc để tìm kiếm ứng viên phù hợp</p>
                </CardContent>
              </Card>
            )}

            {!loading && Array.isArray(candidates) && candidates.length === 0 && filters.jobId && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Không tìm thấy ứng viên phù hợp với công việc này</p>
                </CardContent>
              </Card>
            )}

            {Array.isArray(candidates) && candidates.map(candidate => (
              <Card key={candidate.candidateId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {candidate.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{candidate.candidateName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          {candidate.position}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {candidate.address}
                        </p>
                      </div>
                    </div>
                    
                    {/* Matching Score */}
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getScoreColor(candidate.totalScore)}`}>
                        {candidate.totalScore.toFixed(1)}% {getScoreLabel(candidate.totalScore)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Độ phù hợp
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {candidate.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Điện thoại:</span> {candidate.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Giới tính:</span> {candidate.gender ? 'Nam' : 'Nữ'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Ngày sinh:</span> {new Date(candidate.birthday).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Kỹ năng:</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map(skill => (
                        <Badge key={skill.taxonomyId} variant="secondary">
                          {skill.skillName} ({skill.experienceYear} năm)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Latest Work Experience */}
                  {candidate.workExperiences.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Kinh nghiệm gần nhất:</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium">{candidate.workExperiences[0].position}</p>
                        <p className="text-sm text-muted-foreground">{candidate.workExperiences[0].companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(candidate.workExperiences[0].startDate).toLocaleDateString('vi-VN')} - {
                            candidate.workExperiences[0].endDate ? 
                            new Date(candidate.workExperiences[0].endDate).toLocaleDateString('vi-VN') :
                            'Hiện tại'
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {candidate.educations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Học vấn:</h4>
                      <div className="flex items-center space-x-2">
                        <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {candidate.educations[0].educationLevelName} - {candidate.educations[0].major}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({candidate.educations[0].schoolName})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CV Download */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {candidate.primaryCV.fileName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={savedCVIds.has(candidate.primaryCV.cvId) ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          if (savedCVIds.has(candidate.primaryCV.cvId)) {
                            handleUnsaveCV(candidate.primaryCV.cvId);
                          } else {
                            handleSaveCV(candidate.primaryCV.cvId);
                          }
                        }}
                        disabled={savingCVIds.has(candidate.primaryCV.cvId)}
                      >
                        <BookmarkIcon className={`h-4 w-4 mr-2 ${savedCVIds.has(candidate.primaryCV.cvId) ? 'fill-current' : ''}`} />
                        {savingCVIds.has(candidate.primaryCV.cvId) 
                          ? 'Đang xử lý...' 
                          : savedCVIds.has(candidate.primaryCV.cvId) 
                            ? 'Đã lưu' 
                            : 'Lưu CV'
                        }
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleInviteCandidate(candidate)}
                        disabled={invitingCandidateIds.has(candidate.candidateId)}
                      >
                        <MailIcon className="h-4 w-4 mr-2" />
                        {invitingCandidateIds.has(candidate.candidateId) 
                          ? 'Đang gửi...' 
                          : 'Mời ứng tuyển'
                        }
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={candidate.primaryCV.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Xem CV
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {Array.isArray(candidates) && candidates.length > 0 && (
              <div className="flex justify-center items-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFilterChange('page', Math.max(1, (filters.page || 1) - 1));
                    searchCandidates();
                  }}
                  disabled={filters.page === 1 || loading}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {filters.page || 1} / {totalPages} 
                  {totalCount > 0 && (
                    <span className="ml-2">({totalCount} ứng viên)</span>
                  )}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleFilterChange('page', (filters.page || 1) + 1);
                    searchCandidates();
                  }}
                  disabled={(filters.page || 1) >= totalPages || loading}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}