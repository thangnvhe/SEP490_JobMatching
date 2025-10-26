import React, { useEffect } from 'react';
import { useAppDispatch } from '../store';
import { initializeAuth } from '../store/slices/authSlice';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth state from storage on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};