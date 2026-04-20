import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";


export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;