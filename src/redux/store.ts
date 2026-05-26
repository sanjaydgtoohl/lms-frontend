import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import permissionsReducer from "./slices/permissionsSlice";
import uiReducer from "./slices/uiSlice";
import { injectAuthStore } from "./authTokenBridge";
import sessionManager from "../services/sessionManager";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
    notifications: notificationReducer,
    permissions: permissionsReducer,
    ui: uiReducer,
  },
});

injectAuthStore(store);

if (typeof window !== "undefined") {
  const globalWindow = window as Window & { __authEventListenerRegistered?: boolean };

  if (!globalWindow.__authEventListenerRegistered) {
    window.addEventListener("auth:force-logout", () => {
      sessionManager.clearAuthSession();
    });
    globalWindow.__authEventListenerRegistered = true;
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
