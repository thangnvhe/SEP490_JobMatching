import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileTextIcon, ExternalLinkIcon, Trash2Icon, BookmarkIcon, SearchIcon } from 'lucide-react';
import { SavedCVService } from '@/services/saved-cv.service';
import { SavedCV } from '@/models/saved-cv';
import { CVServices } from '@/services/cv.service';
import { CVDetail } from '@/models/cv';
import { toast } from 'sonner';

export default function SavedCVsPage() {
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cvDetails, setCvDetails] = useState<Record<number, CVDetail>>({});
  const [hasLoadingFailures, setHasLoadingFailures] = useState(false);

  const loadAllCVs = useCallback(async () => {
    try {
      const response = await CVServices.getAll();
      
      if (response.isSuccess && response.result) {
        // Convert array to object with cvId as key for easy lookup
        const allCVsMap: Record<number, CVDetail> = {};
        response.result.forEach((cv: CVDetail) => {
          allCVsMap[cv.id] = cv;
        });
        setCvDetails(allCVsMap);
        return allCVsMap;
      } else {
        setHasLoadingFailures(true);
      }
    } catch {
      setHasLoadingFailures(true);
    }
    return {};
  }, []);

  const loadSavedCVs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SavedCVService.getAllSavedCVs();
      
      if (response.isSuccess && response.result) {
        setSavedCVs(response.result);
        
        // Load all CVs to get detailed information
        await loadAllCVs();
      } else {
        toast.error('Không thể tải danh sách CV đã lưu');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi tải danh sách CV đã lưu');
    } finally {
      setLoading(false);
    }
  }, [loadAllCVs]);

  useEffect(() => {
    loadSavedCVs();
  }, [loadSavedCVs]);

  const handleUnsaveCV = async (savedCVId: number) => {
    try {
      await SavedCVService.deleteSavedCV(savedCVId);
      setSavedCVs(prev => prev.filter(cv => cv.id !== savedCVId));
      toast.success('Đã bỏ lưu CV');
    } catch (error) {
      console.error('Error unsaving CV:', error);
      toast.error('Có lỗi xảy ra khi bỏ lưu CV');
    }
  };

  // Vì backend chỉ trả về basic fields, hiển thị tất cả CVs
  const filteredCVs = savedCVs.filter(cv => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const cvDetail = cvDetails[cv.cvId];
    const searchLower = searchTerm.toLowerCase();
    
    return (
      cv.cvId.toString().includes(searchLower) ||
      cvDetail?.user?.fullName?.toLowerCase().includes(searchLower) ||
      cvDetail?.name?.toLowerCase().includes(searchLower) ||
      cvDetail?.fileName?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Đang tải danh sách CV đã lưu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách CVs đã lưu</h1>
          <p className="text-gray-600">Quản lý các CV ứng viên đã lưu</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {savedCVs.length} CV đã lưu
          </span>
        </div>
      </div>

      {/* Info Banner for Loading Issues */}
      {hasLoadingFailures && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Một số chi tiết CV không thể tải
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                Có lỗi xảy ra khi tải chi tiết một số CV. Các CV này vẫn hiển thị và có thể bỏ lưu bình thường.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo tên ứng viên hoặc vị trí..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {savedCVs.length > 0 ? `Hiển thị ${filteredCVs.length}/${savedCVs.length} CV đã lưu` : 'Chưa có CV nào được lưu'}
        </p>
      </div>

      {/* CV Grid */}
      {filteredCVs.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'Không tìm thấy CV nào' : 'Chưa có CV đã lưu'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Các CV bạn lưu sẽ hiển thị ở đây'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCVs.map((savedCV) => {
            const cvDetail = cvDetails[savedCV.cvId];
            const hasDetails = !!cvDetail;
            
            return (
            <Card key={savedCV.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {hasDetails && cvDetail.user?.fullName
                          ? cvDetail.user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                          : `CV${savedCV.cvId.toString().slice(-2)}`
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {hasDetails
                          ? cvDetail.user?.fullName || cvDetail.fileName || `CV #${savedCV.cvId}`
                          : `CV #${savedCV.cvId}`
                        }
                      </h3>
                      <p className="text-xs text-gray-500">
                        {hasDetails
                          ? cvDetail.name || cvDetail.fileName || 'CV File'
                          : 'Chi tiết không khả dụng'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* CV Details */}
                <div className="space-y-2 mb-4">
                  {hasDetails && cvDetail.user?.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      {cvDetail.user.email}
                    </div>
                  )}
                  {hasDetails && cvDetail.user?.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                      {cvDetail.user.phoneNumber}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    CV: {hasDetails && cvDetail.fileName ? cvDetail.fileName : `ID ${savedCV.cvId}`}
                  </div>
                  {!hasDetails && (
                    <div className="flex items-center text-sm text-amber-600">
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      <span>Chi tiết không khả dụng</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    {hasDetails && cvDetail.fileUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-1"
                        onClick={() => window.open(cvDetail.fileUrl, '_blank')}
                      >
                        <ExternalLinkIcon className="h-3 w-3" />
                        <span>Xem CV</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="flex items-center space-x-1"
                        title={hasDetails ? 'File không khả dụng' : 'Chi tiết CV không khả dụng'}
                      >
                        <ExternalLinkIcon className="h-3 w-3" />
                        <span>{hasDetails ? 'Không có file' : 'Không khả dụng'}</span>
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnsaveCV(savedCV.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          )}
        </div>
      )}
    </div>
  );
}