import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import { UserServices } from '@/services/user.service';
import { toast } from 'sonner';
import type { BaseResponse } from '@/models/base';

export const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      // Lấy token từ query parameter (TokenLink)
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token xác nhận không hợp lệ hoặc đã hết hạn.');
        toast.error('Token xác nhận không hợp lệ');
        return;
      }

      try {
        // Gọi API xác nhận email
        const response: BaseResponse<any> = await UserServices.verifyEmail(token);
        
        setStatus('success');
        setMessage(response.result?.message || 'Email của bạn đã được xác nhận thành công!');
        toast.success('Xác nhận email thành công!');
        
        // Tự động redirect sau 3 giây
        setTimeout(() => {
          navigate('/', { state: { emailConfirmed: true } });
        }, 3000);
        
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 
          error.message ||
          'Xác nhận email thất bại. Token có thể đã hết hạn hoặc không hợp lệ.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                <Spinner className="w-10 h-10 text-blue-600" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={2.5} />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Đang xác nhận email...'}
              {status === 'success' && 'Xác nhận thành công!'}
              {status === 'error' && 'Xác nhận thất bại'}
            </CardTitle>
            
            <CardDescription className="text-base text-gray-600 px-4">
              {message || 'Vui lòng đợi trong giây lát...'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          {status === 'success' && (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-green-50 p-3 rounded-lg border border-green-200">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="text-green-700">
                  Bạn sẽ được chuyển đến trang chủ sau 3 giây...
                </span>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Về trang chủ ngay
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3 animate-in fade-in duration-500">
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-700 text-center">
                  Có thể token đã hết hạn hoặc đã được sử dụng. Vui lòng thử đăng ký lại hoặc liên hệ hỗ trợ.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Về trang chủ
              </Button>
              <Button 
                onClick={() => navigate('/', { state: { openRegister: true } })}
                className="w-full h-11"
                variant="outline"
              >
                Đăng ký lại
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-3 animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


