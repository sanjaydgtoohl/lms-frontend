import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/api";

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout(); // calls backend + clears token
      return true;
    } catch (error: any) {
      // Fallback message if backend doesn't return one
      const message =
        error.response?.data?.message ||
        error.message ||
        "Logout failed";
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: apiClient.isAuthenticated(), // check cookie/token
    loading: false,
  },
  reducers: {
    forceLogout: (state) => {
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { forceLogout } = authSlice.actions;
export default authSlice.reducer;