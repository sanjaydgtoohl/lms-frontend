import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type NotificationType = "info" | "success" | "error";

interface UiNotification {
  isOpen: boolean;
  message: string;
  type: NotificationType;
  title?: string;
}

interface UiState {
  notification: UiNotification;
  errorList: Array<{ message: string; time: number }>;
}

const initialState: UiState = {
  notification: { isOpen: false, message: "", type: "info" },
  errorList: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type?: NotificationType;
        title?: string;
      }>
    ) => {
      state.notification = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type ?? "info",
        title: action.payload.title,
      };
    },
    hideNotification: (state) => {
      state.notification = { isOpen: false, message: "", type: "info" };
    },
    pushError: (state, action: PayloadAction<string>) => {
      state.errorList.push({ message: action.payload, time: Date.now() });
    },
    clearErrors: (state) => {
      state.errorList = [];
    },
  },
});

export const { showNotification, hideNotification, pushError, clearErrors } =
  uiSlice.actions;

export default uiSlice.reducer;
