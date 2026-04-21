import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem } from "../../services/notifications";

interface ModuleNotifications {
  notifications: NotificationItem[];
  unreadCount: number;
  totalItems: number;
}

interface NotificationState {
  all: ModuleNotifications;
  leadManagement: ModuleNotifications;
  brief: ModuleNotifications;
  preLead: ModuleNotifications;
  system: ModuleNotifications;
}

const createInitialModuleState = (): ModuleNotifications => ({
  notifications: [],
  unreadCount: 0,
  totalItems: 0,
});

const initialState: NotificationState = {
  all: createInitialModuleState(),
  leadManagement: createInitialModuleState(),
  brief: createInitialModuleState(),
  preLead: createInitialModuleState(),
  system: createInitialModuleState(),
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; notifications: NotificationItem[]; total: number }>) {
      const { module, notifications, total } = action.payload;
      state[module].notifications = notifications;
      state[module].totalItems = total;
      state[module].unreadCount = notifications.filter(n => !n.read).length;
    },
    addNotification(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; notification: NotificationItem }>) {
      const { module, notification } = action.payload;
      state[module].notifications.unshift(notification);
      state[module].totalItems += 1;
      if (!notification.read) {
        state[module].unreadCount += 1;
      }
      // Also add to 'all' module when source module is not already 'all'
      if (module !== 'all') {
        state.all.notifications.unshift(notification);
        state.all.totalItems += 1;
        if (!notification.read) {
          state.all.unreadCount += 1;
        }
      }
    },
    setUnreadCount(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; count: number }>) {
      const { module, count } = action.payload;
      state[module].unreadCount = count;
    },
    incrementUnreadCount(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; by?: number }>) {
      const { module, by = 1 } = action.payload;
      state[module].unreadCount += by;
    },
    markNotificationRead(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; id: string }>) {
      const { module, id } = action.payload;
      const notification = state[module].notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state[module].unreadCount = Math.max(state[module].unreadCount - 1, 0);
      }
      // Also update in 'all' module
      const allNotification = state.all.notifications.find(n => n.id === id);
      if (allNotification && !allNotification.read) {
        allNotification.read = true;
        state.all.unreadCount = Math.max(state.all.unreadCount - 1, 0);
      }
    },
    markAllNotificationsRead(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system' }>) {
      const module = action.payload.module;
      state[module].notifications = state[module].notifications.map((n: NotificationItem) => ({ ...n, read: true }));
      state[module].unreadCount = 0;
      // Keep 'all' in sync without clearing unrelated modules
      if (module === 'all') {
        state.all.notifications = state.all.notifications.map((n: NotificationItem) => ({ ...n, read: true }));
        state.all.unreadCount = 0;
      } else {
        const updatedIds = new Set(state[module].notifications.map((n: NotificationItem) => n.id));
        state.all.notifications = state.all.notifications.map((n: NotificationItem) => (
          updatedIds.has(n.id) ? { ...n, read: true } : n
        ));
        state.all.unreadCount = state.all.notifications.filter((n: NotificationItem) => !n.read).length;
      }
    },
    updateNotificationInList(state, action: PayloadAction<{ module: 'all' | 'leadManagement' | 'brief' | 'preLead' | 'system'; notification: NotificationItem }>) {
      const { module, notification } = action.payload;
      const index = state[module].notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        state[module].notifications[index] = notification;
      }
    },
    refreshAllNotifications(state, action: PayloadAction<{ all: { notifications: NotificationItem[]; total: number; totalItems?: number }; leadManagement: { notifications: NotificationItem[]; total: number; totalItems?: number }; brief: { notifications: NotificationItem[]; total: number; totalItems?: number }; preLead: { notifications: NotificationItem[]; total: number; totalItems?: number }; system: { notifications: NotificationItem[]; total: number; totalItems?: number } }>) {
      const { all, leadManagement, brief, preLead, system } = action.payload;
      state.all = { ...all, unreadCount: all.notifications.filter((n: NotificationItem) => !n.read).length, totalItems: all.totalItems ?? all.total };
      state.leadManagement = { ...leadManagement, unreadCount: leadManagement.notifications.filter((n: NotificationItem) => !n.read).length, totalItems: leadManagement.totalItems ?? leadManagement.total };
      state.brief = { ...brief, unreadCount: brief.notifications.filter((n: NotificationItem) => !n.read).length, totalItems: brief.totalItems ?? brief.total };
      state.preLead = { ...preLead, unreadCount: preLead.notifications.filter((n: NotificationItem) => !n.read).length, totalItems: preLead.totalItems ?? preLead.total };
      state.system = { ...system, unreadCount: system.notifications.filter((n: NotificationItem) => !n.read).length, totalItems: system.totalItems ?? system.total };
    },
  },
});

export const {
  setNotifications,
  addNotification,
  setUnreadCount,
  incrementUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotificationInList,
  refreshAllNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;