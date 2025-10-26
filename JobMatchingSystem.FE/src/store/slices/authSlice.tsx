import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  User 
} from '@/models';
import { TokenStorage } from '@/utils/tokenStorage';
import { JWTUtils } from '@/utils/jwtUtils';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (loginData: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData);
      if (response.isSuccess) {
        return response.result;
      } else {
        return rejectWithValue(response.errorMessages?.[0] || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(registerData);
      if (response.isSuccess) {
        return response.result;
      } else {
        return rejectWithValue(response.errorMessages?.[0] || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      if (response.isSuccess) {
        return null;
      } else {
        return rejectWithValue(response.result || 'Đăng xuất thất bại');
      }
    } catch (error: any) {
      // Even if logout fails, we should clear local state
      return null;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể lấy thông tin người dùng');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (forgotPasswordData: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(forgotPasswordData);
      if (response.isSuccess) {
        return response.result;
      } else {
        return rejectWithValue(response.errorMessages?.[0] || 'Gửi email đặt lại mật khẩu thất bại');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Gửi email đặt lại mật khẩu thất bại');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetPasswordData: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetPasswordData);
      if (response.isSuccess) {
        return response.result;
      } else {
        return rejectWithValue(response.errorMessages?.[0] || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đặt lại mật khẩu thất bại');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      if (response.isSuccess) {
        return response.result;
      } else {
        return rejectWithValue(response.errorMessages?.[0] || 'Refresh token thất bại');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Refresh token thất bại');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    initializeAuth: (state) => {
      const isAuthenticated = TokenStorage.isAuthenticated();
      const user = TokenStorage.getUser();
      
      state.isAuthenticated = isAuthenticated;
      state.user = user;
      state.isInitialized = true;
      
      // Check if token is expired
      const token = TokenStorage.getAccessToken();
      if (token && JWTUtils.isTokenExpired(token)) {
        // Token expired, clear state
        state.isAuthenticated = false;
        state.user = null;
        TokenStorage.clearAll();
      }
    },
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      TokenStorage.clearAll();
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = TokenStorage.getUser(); // Get user from token
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = TokenStorage.getUser(); // Get user from token
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        // Still logout locally even if API fails
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.user = TokenStorage.getUser(); // Update user from refreshed token
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If refresh fails, logout user
        state.isAuthenticated = false;
        state.user = null;
        TokenStorage.clearAll();
      });
  },
});

export const { clearError, setUser, initializeAuth, resetAuthState } = authSlice.actions;
export default authSlice.reducer;