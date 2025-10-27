import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { JWTUtils } from "@/utils/jwtUtils";
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse } from "@/models/base";
import Cookies from "js-cookie";


const initialState: any = {
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
        name: decodedToken?.name,
        nameid: decodedToken?.nameid,
        role: decodedToken?.role,
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
      state.error = undefined;
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem('accessToken') || Cookies.get('accessToken');
      if (token) {
        const decodedToken = JWTUtils.decodeToken(token);
        if (decodedToken && !JWTUtils.isTokenExpired(token)) {
          state.accessToken = token;
          state.exp = decodedToken?.exp;
          state.name = decodedToken?.name;
          state.nameid = decodedToken?.nameid;
          state.role = decodedToken?.role;
          state.isAuthenticated = true;
          state.rememberMe = localStorage.getItem('accessToken') ? true : false;
        }
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = undefined;
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
        state.error = undefined;
      })
      // Login rejected
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;
