import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/models/user';
import Cookies from 'js-cookie';

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
    if (!Cookies.get('role') || !requiredRoles.includes(Cookies.get('role') as UserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Specific role guards
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['admin']}>{children}</AuthGuard>
);

export const RecruiterGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['recruiter']}>{children}</AuthGuard>
);

export const CandidateGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requiredRoles={['candidate']}>{children}</AuthGuard>
);

// Guest guard (redirect authenticated users)
export const GuestGuard: React.FC<{ 
  children: React.ReactNode; 
  redirectTo?: string 
}> = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated } = useAppSelector(state => state.authState);
  
  if (isAuthenticated || Cookies.get('accessToken')) {
    // Redirect based on user role
    const userRole = Cookies.get('role');
    let defaultRedirect = redirectTo;
    
    switch (userRole) {
      case 'admin':
        defaultRedirect = '/admin';
        break;
      case 'recruiter':
        defaultRedirect = '/recruiter';
        break;
      case 'candidate':
        defaultRedirect = '/candidate';
        break;
      default:
        defaultRedirect = redirectTo;
    }
    
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};