import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store';
import type { RootState } from '@/store';
import { clearError } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { UserServices } from '@/services/user.service';

const ResetPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useParams<{ token: string }>();
  const { isLoading, error } = useSelector((state: RootState) => state.authState);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Get parameters from URL (these would come from the email link)
  const email = searchParams.get('email');
  const decodedToken = token ? decodeURIComponent(token) : null;

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Validate that we have the required parameters
  useEffect(() => {
    if (!decodedToken || !email) {
      setLocalError('Đường dẫn không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }
  }, [decodedToken, email]);

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setLocalError('Vui lòng nhập đầy đủ thông tin');
      return false;
    }

    if (newPassword.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return false;
    }

    setLocalError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!email || !decodedToken) {
      setLocalError('Đường dẫn không hợp lệ. Vui lòng thử lại.');
      return;
    }

    try {
      // Call reset password API
      const result = await UserServices.resetPassword(email, decodedToken, newPassword, confirmPassword);

      if (result.statusCode === 200) {
        setIsSuccess(true);
        toast.success('Mật khẩu đã được đặt lại thành công!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        toast.error(result.errorMessages?.[0] || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Thành công!</CardTitle>
            <CardDescription>
              Mật khẩu của bạn đã được đặt lại thành công.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Bạn sẽ được chuyển hướng về trang đăng nhập trong vài giây...
            </p>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-center">
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {localError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setLocalError('');
                }}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError('');
                }}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !!localError}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              Quay về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
