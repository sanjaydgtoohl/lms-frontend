import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'error';

interface UiStoreState {
  notification: {
    isOpen: boolean;
    message: string;
    type: NotificationType;
    title?: string;
  };
  showNotification: (message: string, type?: NotificationType, title?: string) => void;
  hideNotification: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  notification: { isOpen: false, message: '', type: 'info' },
  showNotification: (message: string, type: NotificationType = 'info', title?: string) =>
    set({ notification: { isOpen: true, message, type, title } }),
  hideNotification: () => set({ notification: { isOpen: false, message: '', type: 'info' } }),
}));
