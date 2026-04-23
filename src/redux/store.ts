import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import { forceLogout } from "./slices/authSlice";


export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
});

if (typeof window !== "undefined") {
  const globalWindow = window as Window & { __authEventListenerRegistered?: boolean };

  if (!globalWindow.__authEventListenerRegistered) {
    window.addEventListener("auth:force-logout", () => {
      store.dispatch(forceLogout());
    });
    globalWindow.__authEventListenerRegistered = true;
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;