import { useUiStore } from '../store/ui';

type NotificationType = 'success' | 'error' | 'info';

const show = (message: string, type: NotificationType, title?: string) => {
  useUiStore.getState().showNotification(message, type, title);
};

export const showSuccess = (message: string, title = 'Success') => show(message, 'success', title);
export const showError = (message: string, title = 'Error') => show(message, 'error', title);
export const showInfo = (message: string, title = 'Notice') => show(message, 'info', title);


