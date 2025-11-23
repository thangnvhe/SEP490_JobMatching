import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserServices } from '@/services/user.service';

// Types
interface CV {
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

interface ApiResponse {
  statusCode: number;
  isSuccess: boolean;
  errorMessages: string[];
  result: CV[];
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ApplyJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: number;
  jobTitle: string;
  onUploadCV?: () => void;
}

const ApplyJobDialog: React.FC<ApplyJobDialogProps> = ({
  isOpen,
  onOpenChange,
  jobId,
  jobTitle,
  onUploadCV
}) => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Get authentication state from Redux
  const authState = useSelector((state: RootState) => state.authState);
  
  // Get user ID from auth state or user profile
  const userId = userProfile?.id || authState.nameid;

  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await UserServices.getUserProfile();
      
      if (response.isSuccess) {
        setUserProfile(response.result as User);
      } else {
        console.error('Failed to fetch user profile:', response.errorMessages);
        toast.error(`Lỗi khi tải thông tin người dùng: ${response.errorMessages?.join(', ') || 'Không xác định'}`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchCVs = useCallback(async () => {
    if (!userId) {
      console.warn('User ID not available, cannot fetch CVs');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`https://localhost:7044/api/CV/user/${userId}`);
      
      if (!response.ok) {
        // Check if it's 404 (no CVs found) - this is normal for new users
        if (response.status === 404) {
          setCvs([]);
          return;
        }
        throw new Error('Failed to fetch CVs');
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.isSuccess) {
        setCvs(data.result || []); // Ensure we set empty array if result is null
      } else {
        // Only show error if it's not an empty result scenario
        if (data.errorMessages?.some(msg => !msg.toLowerCase().includes('not found') && !msg.toLowerCase().includes('no cv'))) {
          console.error('Error fetching CVs:', data.errorMessages);
          toast.error(`Lỗi: ${data.errorMessages.join(', ')}`);
        } else {
          setCvs([]); // Set empty array for "not found" scenarios
        }
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
      // Only show alert for actual network errors, not for empty results
      if (error instanceof Error && !error.message.includes('404')) {
        toast.error("Không thể tải danh sách CV");
      } else {
        setCvs([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      // Reset states when dialog opens
      setSelectedCvId(null);
      // Fetch user profile first
      fetchUserProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    // Fetch CVs when user profile is loaded and userId is available
    if (isOpen && !isLoadingProfile && userId) {
      fetchCVs();
    }
  }, [isOpen, isLoadingProfile, userId, fetchCVs]);

  const handleSubmitApplication = async () => {
    if (!selectedCvId) {
      toast.error('Vui lòng chọn CV để ứng tuyển');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get token from localStorage or cookies
      const token = localStorage.getItem('accessToken') || document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        toast.error("Lỗi: Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      const requestData = {
        jobId: jobId,
        cvId: selectedCvId
      };

      const response = await fetch('https://localhost:7044/api/CandidateJob', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        toast.success(data.message || "Ứng tuyển thành công!");
        onOpenChange(false);
      } else {
        // Handle API error response
        const errorMessage = data.errorMessages?.join(', ') || data.message || 'Không thể ứng tuyển';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("Lỗi: Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCVSelect = (cvId: number) => {
    setSelectedCvId(cvId);
  };

  const handleUploadClick = () => {
    onOpenChange(false);
    onUploadCV?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Ứng tuyển cho vị trí: {jobTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 overflow-y-auto max-h-[50vh]">
          {/* Upload CV Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload CV mới</span>
            </Button>
          </div>

          {/* Loading state */}
          {(isLoadingProfile || isLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="text-gray-600">Đang tải danh sách CV...</p>
              </div>
            </div>
          )}

          {/* CV List */}
          {!isLoadingProfile && !isLoading && cvs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                Chọn CV để ứng tuyển:
              </h3>
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <Card
                    key={cv.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCvId === cv.id
                        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCVSelect(cv.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${
                            selectedCvId === cv.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <FileText className={`h-5 w-5 ${
                              selectedCvId === cv.id ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{cv.name}</h4>
                              {cv.isPrimary && (
                                <Badge variant="secondary" className="text-xs">
                                  CV chính
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{cv.fileName}</p>
                          </div>
                        </div>
                        
                        {selectedCvId === cv.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoadingProfile && !isLoading && cvs.length === 0 && (
            <div className="text-center py-8">
              <div className="rounded-full bg-gray-100 p-6 mx-auto w-fit mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có CV nào
              </h3>
              <p className="text-gray-500 mb-4">
                Bạn cần upload CV để có thể ứng tuyển vào vị trí này.
              </p>
              <Button onClick={handleUploadClick} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload CV ngay
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmitApplication}
            disabled={!selectedCvId || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Đang ứng tuyển...
              </>
            ) : (
              'Nộp đơn ứng tuyển'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyJobDialog;