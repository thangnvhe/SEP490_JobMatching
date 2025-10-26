// Re-export from models for backward compatibility
export type {
  APIResponse as ApiResponse,
  LoginRequest,
  LoginResponse as AuthResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
  Job,
  Company,
  UserRoleType,
  JobStatusType,
  CompanyStatusType
} from '@/models';

// Additional types that may be needed
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}