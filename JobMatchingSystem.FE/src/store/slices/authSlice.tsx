import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { JWTUtils } from "@/lib/utils/jwtUtils";
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse } from "@/models/base";
import Cookies from "js-cookie";
import { UserServices } from "@/services/user.service";

// Define AuthState interface
interface AuthState {
  accessToken: string;
  exp: number;
  name: string;
  nameid: string;
  role: string;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  rememberMe: boolean;
}

const initialState: AuthState = {
  accessToken: '',
  exp: 0,
  name: '',
  nameid: '',
  role: '',
  isAuthenticated: false,
  loading: false,
  error: '',
  rememberMe: false,
}

// Login async thunk
export const loginAsync = createAsyncThunk(
  'Auth/login',
  async ({ email, password, rememberMe }: { email: string; password: string; rememberMe: boolean }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<BaseResponse<any>>('/auth/login', { email, password });
      const token = response.data.result.token;
      
      if (rememberMe) {
        localStorage.setItem('accessToken', token);
      } else {
        Cookies.set('accessToken', token, { path: '/', expires: new Date(Date.now() + 30 * 60 * 1000) });
      }
      // Decode token để lấy thông tin
      const decodedToken = JWTUtils.decodeToken(token);
      return {
        token,
        exp: decodedToken?.exp,
        name: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        nameid: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        role: decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        rememberMe,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessages?.[0] || 'Đăng nhập thất bại');
    }
  }
);

export const logoutAsync = createAsyncThunk('Auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post<BaseResponse<any>>('/auth/logout');
    localStorage.removeItem('accessToken');
    Cookies.remove('accessToken');
    return initialState;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.errorMessages?.[0] || 'Đăng xuất thất bại');
  }
});

// Register async thunk
export const registerAsync = createAsyncThunk(
  'Auth/register',
  async (
    payload: { fullName: string; email: string; password: string; confirmPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<BaseResponse<any>>('/auth/register', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessages?.[0] || 'Đăng ký thất bại');
    }
  }
);

// Forgot password async thunk
export const forgotPassword = createAsyncThunk(
  'Auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await UserServices.forgotPassword(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessages?.[0] || 'Gửi email quên mật khẩu thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: () => {
      localStorage.removeItem('accessToken');
      Cookies.remove('accessToken');
      return initialState;
    },
    clearError: (state) => {
      state.error = '';
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (token) {
        const decodedToken = JWTUtils.decodeToken(token);
        if (decodedToken && !JWTUtils.isTokenExpired(token)) {
          state.accessToken = token;
          state.exp = decodedToken?.exp;
          state.name = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
          state.nameid = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
          state.role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          state.isAuthenticated = true;
          state.rememberMe = !!localStorage.getItem('accessToken');
        } else {
          // Token expired - clear it
          localStorage.removeItem('accessToken');
          Cookies.remove('accessToken');
        }
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      // Login fulfilled
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.token;
        state.exp = action.payload.exp;
        state.name = action.payload.name;
        state.nameid = action.payload.nameid;
        state.role = action.payload.role;
        state.rememberMe = action.payload.rememberMe;
        state.isAuthenticated = true;
        state.error = '';
      })
      // Login rejected
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register pending
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      // Register fulfilled
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
        // Không tự động đăng nhập sau khi đăng ký; chỉ đánh dấu không lỗi
        state.error = '';
      })
      // Register rejected
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout pending
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      // Logout fulfilled
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = '';
        state.exp = 0;
        state.name = '';
        state.nameid = '';
        state.role = '';
        state.isAuthenticated = false;
        state.rememberMe = false;
        state.error = '';
      })
      // Logout rejected
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Vẫn logout local dù API thất bại
        state.accessToken = '';
        state.exp = 0;
        state.name = '';
        state.nameid = '';
        state.role = '';
        state.isAuthenticated = false;
        state.rememberMe = false;
      })
      // Forgot password pending
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      // Forgot password fulfilled
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = '';
      })
      // Forgot password rejected
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
