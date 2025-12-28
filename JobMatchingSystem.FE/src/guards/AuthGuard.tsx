import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/models/user';

/**
 * Chuẩn hóa role thành viết hoa chữ cái đầu
 */
const capitalizeRole = (role: string): string => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRoles, 
  redirectTo = '/' 
}) => {
  const location = useLocation();
  const { isAuthenticated, role, isInitializing } = useAppSelector(state => state.authState);
  
  // Đợi cho đến khi auth state được restore xong (tránh race condition khi F5)
  if (isInitializing) {
    // Có thể hiển thị loading spinner hoặc null
    return null; // hoặc <LoadingSpinner />
  }
  
  // Check if user is authenticated - sử dụng Redux state đã được restore từ AppInitializer
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if required
  if (requiredRoles && requiredRoles.length > 0) {
    const currentRole = capitalizeRole(role);
    const normalizedRequiredRoles = requiredRoles.map(r => capitalizeRole(r));
    
    if (!currentRole || !normalizedRequiredRoles.includes(currentRole as UserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Specific role guards
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['Admin']}>{children}</AuthGuard>
);

export const RecruiterGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['Recruiter']}>{children}</AuthGuard>
);

export const CandidateGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['Candidate']}>{children}</AuthGuard>
);

// Guest guard (redirect authenticated users)
export const GuestGuard: React.FC<{ 
  children: React.ReactNode; 
  redirectTo?: string 
}> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, role } = useAppSelector(state => state.authState);
  
  if (isAuthenticated) {
    // Redirect based on user role
    const userRole = capitalizeRole(role);
    let defaultRedirect = redirectTo;
    
    switch (userRole) {
      case 'Admin':
        defaultRedirect = '/admin';
        break;
      case 'Recruiter':
        defaultRedirect = '/recruiter';
        break;
      case 'Candidate':
        defaultRedirect = '/candidate';
        break;
      case 'Hiringmanager':
        defaultRedirect = '/hiringmanager';
        break;
      default:
        defaultRedirect = redirectTo;
    }
    
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};