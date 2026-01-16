import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'error';


interface UiStoreState {
  notification: {
    isOpen: boolean;
    message: string;
    type: NotificationType;
    title?: string;
  };
  errorList: Array<{ message: string; time: number }>;
  showNotification: (message: string, type?: NotificationType, title?: string) => void;
  hideNotification: () => void;
  pushError: (message: string) => void;
  clearErrors: () => void;
}


export const useUiStore = create<UiStoreState>((set) => ({
  notification: { isOpen: false, message: '', type: 'info' },
  errorList: [],
  showNotification: (message: string, type: NotificationType = 'info', title?: string) =>
    set({ notification: { isOpen: true, message, type, title } }),
  hideNotification: () => set({ notification: { isOpen: false, message: '', type: 'info' } }),
  pushError: (message: string) =>
    set((state) => ({ errorList: [...state.errorList, { message, time: Date.now() }] })),
  clearErrors: () => set({ errorList: [] }),
}));
