import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/api";
import sessionManager from "../../services/sessionManager";
import type { User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.login(credentials);
      // sessionManager will schedule refresh based on cookies set by loginService
      sessionManager.startSessionFromCookies();
      return {
        token: response.token,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      return rejectWithValue(message);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: { email: string; password: string; firstName?: string; lastName?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.register(userData);
      sessionManager.startSessionFromCookies();
      return {
        token: response.token,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      return rejectWithValue(message);
    }
  }
);

// Refresh token thunk
export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.refreshToken();
      return {
        token: response.token,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Token refresh failed";
      return rejectWithValue(message);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout(); // calls backend + clears token
      sessionManager.clearSession();
      sessionManager.clearLocalStorage();
      return true;
    } catch (error: any) {
      // Even if logout API call fails, clear local state
      sessionManager.clearSession();
      sessionManager.clearLocalStorage();
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Logout failed";
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    refreshTokenValue: null,
    isAuthenticated: apiClient.isAuthenticated(), // check cookie/token
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.loading = false;
        state.error = null;
      }
    },
    forceLogout: (state) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.token = null;
      state.refreshTokenValue = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshTokenValue = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshTokenValue = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh token cases
    builder
      .addCase(refreshTokenThunk.pending, () => {
        // Don't set loading for refresh to avoid UI flickering
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshTokenValue = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // Refresh failure triggers force logout via HTTP interceptor
        state.isAuthenticated = false;
      });

    // Logout cases
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshTokenValue = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshTokenValue = null;
      });
  },
});

export const { forceLogout, setAuthenticated, clearError } = authSlice.actions;
export default authSlice.reducer;