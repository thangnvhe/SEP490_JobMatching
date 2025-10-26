import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, isLoading, error, user } = useAppSelector(state => state.auth);
  
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [localErrors, setLocalErrors] = useState({
    username: '',
    password: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    const redirectPath = user?.role === 'admin' ? '/admin' :
                        user?.role === 'recruiter' ? '/recruiter' :
                        user?.role === 'candidate' ? '/candidate' : from;
    return <Navigate to={redirectPath} replace />;
  }

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const errors = { username: '', password: '' };
    let isValid = true;

    if (!loginForm.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setLocalErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login({
        username: loginForm.username,
        password: loginForm.password,
        rememberMe
      })).unwrap();
      
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      // Error is handled by the slice and shown via toast
      console.error('Login error:', error);
    }
  };

  const handleInputChange = (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear local error when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={handleInputChange('username')}
                  className={localErrors.username ? 'border-red-500' : ''}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                {localErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{localErrors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleInputChange('password')}
                  className={localErrors.password ? 'border-red-500' : ''}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {localErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{localErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}