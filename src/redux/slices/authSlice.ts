import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: true,
    loading: false,
  },
  reducers: {},
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

export default authSlice.reducer;