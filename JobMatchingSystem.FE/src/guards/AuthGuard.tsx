import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/models/user';
import Cookies from 'js-cookie';

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
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(state => state.authState);
  
  // Check if user is authenticated
  if (!isAuthenticated && !Cookies.get('accessToken')) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if required
  if (requiredRoles && requiredRoles.length > 0) {
    const currentRole = capitalizeRole(Cookies.get('role') || '');
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
  const { isAuthenticated } = useAppSelector(state => state.authState);
  
  if (isAuthenticated || Cookies.get('accessToken')) {
    // Redirect based on user role
    const userRole = capitalizeRole(Cookies.get('role') || '');
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
        defaultRedirect = '/recruiter'; // HiringManager uses same dashboard as Recruiter
        break;
      default:
        defaultRedirect = redirectTo;
    }
    
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};